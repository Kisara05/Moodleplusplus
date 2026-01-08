import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useState } from "react"; // Import useState
import { getUserId } from "~/services/auth/session.server";
import { getSectionList, toggleActiveState } from "~/services/course.server";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
// import { createSupabaseServerClient } from "~/utils/supabase.server"; 

export async function action({ request }: ActionFunctionArgs) {
  // const { supabase } = createSupabaseServerClient({ request });
  const formData = await request.formData();
  // 1. Extract data from the form
  const sectionId = formData.get("sectionId");
  const newStatus = formData.get("newStatus") === "true"; // Convert string to boolean

  if (typeof sectionId !== "string") {
    throw new Error("Invalid section ID");
  }

  const data = await toggleActiveState(sectionId, newStatus);

  // 3. Return success (Remix will automatically re-run the loader to update UI)
  return { success: true };
}

// --- LOADER (No changes needed) ---
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  const data = await getSectionList(userId!);
  const flatSections = data.map((item: any) => ({
    section_id: item.section_id,
    course_id: Array.isArray(item.course)
      ? item.course[0]?.course_id
      : item.course?.course_id,
    course_name: Array.isArray(item.course)
      ? item.course[0]?.course_name
      : item.course?.course_name,
    open_for_reg: item.open_for_reg,
  }));
  console.log(flatSections)
  return { sections: flatSections };
}

function CourseRow({ course }: { course: any }) {
  const fetcher = useFetcher();

  // --- OPTIMISTIC UI MAGIC ---
  // 1. Check if this specific fetcher is currently submitting data.
  // 2. If it is, show the value we just sent (instant feedback).
  // 3. If not, show the actual value from the database.
  const isOpen = fetcher.formData 
    ? fetcher.formData.get("newStatus") === "true"
    : course.open_for_reg;

  return (
    <li className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition bg-white">
      
      {/* USE FETCHER.FORM INSTEAD OF BUTTON ONCLICK */}
      <fetcher.Form method="post">
        {/* Hidden Inputs to send data to the action */}
        <input type="hidden" name="sectionId" value={course.section_id} />
        
        {/* We calculate the OPPOSITE status to send. If currently Open, send "false". */}
        <input type="hidden" name="newStatus" value={(!isOpen).toString()} />

        <button 
          type="submit"
          className={`
              flex flex-col items-center min-w-[60px] cursor-pointer group
              transition-all active:scale-95
          `}
          title="Click to toggle status"
        >
            <div className={`
                w-6 h-6 rounded border flex items-center justify-center mb-1 transition-colors
                ${isOpen 
                    ? "bg-green-100 border-green-500 text-green-600 shadow-sm" 
                    : "bg-gray-50 border-gray-300 text-gray-300 hover:border-gray-400"
                }
            `}>
                {/* Visual Feedback: Show spinner if submitting */}
                {fetcher.state !== "idle" ? (
                   <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                   isOpen ? "✓" : "✕"
                )}
            </div>
            
            <span className={`text-[10px] font-bold uppercase transition-colors ${isOpen ? "text-green-600" : "text-gray-400 group-hover:text-gray-500"}`}>
                {isOpen ? "Open" : "Closed"}
            </span>
        </button>
      </fetcher.Form>

      <div className="h-10 w-px bg-gray-200"></div> 

      {/* Rest of your row content... */}
      <div className="flex-1">
          <Link 
              to={`/courses/${course.section_id}`}
              className="text-xl font-semibold text-blue-600 hover:text-blue-800 hover:underline transition block"
          >
              {course.course_name || "Untitled Course"}
          </Link>
          <div className="text-xs text-gray-500 mt-1">
              Section ID: {course.section_id}
          </div>
      </div>
      
      <Link 
          to={`/courses/${course.section_id}`}
          className="px-4 py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded hover:bg-gray-100 border border-gray-200 transition"
      >
          View &rarr;
      </Link>
    </li>
  );
}

// --- MAIN COMPONENT ---
export default function CoursesList() {
  const { sections } = useLoaderData<typeof loader>();
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Danh sách khóa học</h2>
      
      <ul className="space-y-4">
        {sections.map((course: any) => (
          // Render the sub-component instead of the raw <li>
          <CourseRow key={course.section_id} course={course} />
        ))}
      </ul>
    </div>
  );
}