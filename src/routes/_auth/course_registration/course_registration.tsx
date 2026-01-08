import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { 
    enroll, 
    unregister, // Make sure this is exported from enroll.server.ts
    getAllEnrollablesforStudent, 
    getEnrolledOpenSections // Make sure this is exported from enroll.server.ts
} from "~/services/course/enroll.server"; 
import { getUserId } from "~/services/auth/session.server";
import { getRoleandID } from "~/services/user/user.server";

// --- 1. LOADER ---
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (!userId) return redirect("/login");
  
  const { role, id } = await getRoleandID(userId);
  if (role !== 'student') return redirect("/dashboard");

  // Fetch the two distinct lists
  // 1. "Available" = All open sections MINUS the ones I already took
  const availableRaw = await getAllEnrollablesforStudent(id);
  
  // 2. "Enrolled" = Sections I am currently in (no grade yet)
  const enrolledRaw = await getEnrolledOpenSections(id);

  // Helper to flatten the 'course' object structure safely
  const flatten = (list: any[]) => (list || []).map((item: any) => ({
    section_id: item.section_id,
    course_name: Array.isArray(item.course) ? item.course[0]?.course_name : item.course?.course_name, // Handle array vs object quirk
    course_id: Array.isArray(item.course) ? item.course[0]?.course_id : item.course?.course_id,
    // If your helper returns nested 'section.course' instead of 'course', adjust here. 
    // Based on your previous code, it seems 'course' is at the top level of the join.
  }));

  // Note: Depending on how you wrote your service functions, 
  // you might not need complex flattening if you already did it there.
  // Assuming 'getAllEnrollablesforStudent' returns clean objects:
  return json({ 
      availableSections: availableRaw, 
      enrolledSections: enrolledRaw 
  });
}

// --- 2. ACTION ---
export async function action({ request }: ActionFunctionArgs) {
  const userId = await getUserId(request);
  if (!userId) return redirect("/login");
  
  const { role, id } = await getRoleandID(userId);
  if (role !== 'student') return redirect("/dashboard");

  const formData = await request.formData();
  
  const sectionId = String(formData.get("sectionId"));
  const intent = formData.get("intent"); // Check if we are enrolling or dropping

  try {
      if (intent === "unregister") {
          // Call your unregister function
          await unregister(id, sectionId);
      } else {
          // Call your enroll function
          await enroll(id, sectionId);
      }
  } catch (error) {
      console.error("Action Failed:", error);
      return json({ success: false, error: "Database operation failed" }, { status: 500 });
  }

  return json({ success: true });
}

// --- 3. UI COMPONENT ---
export default function CourseRegistration() {
  const { availableSections, enrolledSections } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      
      {/* --- SECTION A: MY ENROLLED COURSES --- */}
      <div>
        <h2 className="text-2xl font-bold text-green-700 mb-4 border-b border-green-200 pb-2 flex items-center gap-2">
            ✅ My Enrolled Classes
        </h2>
        
        {(!enrolledSections || enrolledSections.length === 0) ? (
            <p className="text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-dashed">
                You have not registered for any classes yet.
            </p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledSections.map((section: any) => (
                    <EnrolledCard key={section.section_id} section={section} />
                ))}
            </div>
        )}
      </div>

      {/* --- SECTION B: AVAILABLE COURSES --- */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
            📚 Available for Registration
        </h2>
        
        {(!availableSections || availableSections.length === 0) ? (
             <p className="text-gray-500 italic">No other courses are available for registration.</p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableSections.map((section: any) => (
                    <RegistrationCard key={section.section_id} section={section} />
                ))}
            </div>
        )}
      </div>

    </div>
  );
}

// --- SUB-COMPONENT 1: Enrolled Card (Unregister) ---
function EnrolledCard({ section }: { section: any }) {
    const fetcher = useFetcher();
    const isDeleting = fetcher.state === "submitting";

    return (
        <div className="border border-green-200 bg-green-50 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <span className="bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded">
                        {section.course_id || section.course?.course_id}
                    </span>
                    <span className="text-xs text-green-700 font-mono">
                        Sec: {section.section_id}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-green-900 mb-4">
                    {section.course_name || section.course?.course_name}
                </h3>
            </div>

            <fetcher.Form method="post">
                <input type="hidden" name="sectionId" value={section.section_id} />
                {/* INTENT: This tells the action to DELETE */}
                <input type="hidden" name="intent" value="unregister" />
                
                <button
                    type="submit"
                    disabled={isDeleting}
                    className="w-full py-2 px-4 rounded-lg text-sm font-semibold bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                    {isDeleting ? "Dropping..." : "Drop Course"}
                </button>
            </fetcher.Form>
        </div>
    );
}

// --- SUB-COMPONENT 2: Available Card (Register) ---
function RegistrationCard({ section }: { section: any }) {
  const fetcher = useFetcher();
  const isRegistering = fetcher.state === "submitting";
  const isSuccess = false;

  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
            {section.course_id || section.course?.course_id}
          </span>
          <span className="text-xs text-gray-500 font-mono">
            Sec: {section.section_id}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {section.course_name || section.course?.course_name}
        </h3>
      </div>

      <fetcher.Form method="post" className="mt-4">
        <input type="hidden" name="sectionId" value={section.section_id} />
        {/* INTENT: This tells the action to INSERT (Default if missing, but explicit is better) */}
        <input type="hidden" name="intent" value="enroll" />
        
        <button
          type="submit"
          disabled={isRegistering || isSuccess}
          className={`
            w-full py-2 px-4 rounded-lg text-sm font-semibold transition-all
            ${isSuccess 
              ? "bg-gray-100 text-gray-500 border border-gray-200 cursor-default" 
              : "bg-black text-white hover:bg-gray-800"
            }
          `}
        >
          {isRegistering ? "Registering..." : isSuccess ? "Registered" : "Register"}
        </button>
      </fetcher.Form>
    </div>
  );
}