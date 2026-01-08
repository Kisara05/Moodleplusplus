import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { getAllEnrollables } from "~/services/course/enroll.server"; // Import your existing logic
import { getUserId } from "~/services/auth/session.server";
// import { createSupabaseServerClient } from "~/utils/supabase.server";

// --- 1. LOADER ---
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (!userId) return redirect("/login");

  // Call your existing function from enroll.server.ts
  const data = await getAllEnrollables();

  // FIX FOR TYPESCRIPT ERROR 1: 
  // Ensure 'data' is treated as an array, even if it's null/undefined
  const safeData = (data as any[]) || [];

  // Flatten the nested structure (Section -> Course) into a clean list
  const availableSections = safeData.map((item: any) => ({
    section_id: item.section_id,
    // Handle case where 'course' might be an object OR an array (Supabase quirk)
    course_name: Array.isArray(item.course) ? item.course[0]?.course_name : item.course?.course_name,
    course_code: Array.isArray(item.course) ? item.course[0]?.course_id : item.course?.course_id,
  }));

  return json({ availableSections });
}

// --- 2. ACTION (Handles the "Register" click) ---
export async function action({ request }: ActionFunctionArgs) {
  const userId = await getUserId(request);
  if (!userId) return redirect("/login");

//   const { supabase } = createSupabaseServerClient({ request });
  const formData = await request.formData();
  const sectionId = formData.get("sectionId");

  // TODO: Add your INSERT logic here to add row to 'enrollments' table
  // const { error } = await supabase.from('enrollment').insert({...})

  console.log(`Student ${userId} registered for Section ${sectionId}`);
  
  return json({ success: true });
}

// --- 3. UI COMPONENT ---
export default function CourseRegistration() {
  const { availableSections } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Registration</h1>
      <p className="text-gray-500 mb-8">Select a section to enroll.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* FIX FOR TYPESCRIPT ERROR 2: Explicitly type 'section' as any */}
        {availableSections.map((section: any) => (
          <RegistrationCard key={section.section_id} section={section} />
        ))}
        
        {availableSections.length === 0 && (
          <p className="col-span-3 text-center text-gray-400">
            No courses available for registration.
          </p>
        )}
      </div>
    </div>
  );
}

// --- 4. SUB-COMPONENT (Card) ---
function RegistrationCard({ section }: { section: any }) {
  const fetcher = useFetcher();
  const isRegistering = fetcher.state === "submitting";
  const isSuccess = false;

  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
            {section.course_code}
          </span>
          <span className="text-xs text-gray-500 font-mono">
            Sec: {section.section_id}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {section.course_name}
        </h3>
      </div>

      <fetcher.Form method="post" className="mt-4">
        <input type="hidden" name="sectionId" value={section.section_id} />
        <button
          type="submit"
          disabled={isRegistering || isSuccess}
          className={`
            w-full py-2 px-4 rounded-lg text-sm font-semibold transition-all
            ${isSuccess 
              ? "bg-green-100 text-green-700 border border-green-200" 
              : "bg-black text-white hover:bg-gray-800"
            }
          `}
        >
          {isRegistering ? "Registering..." : isSuccess ? "Registered ✓" : "Register"}
        </button>
      </fetcher.Form>
    </div>
  );
}