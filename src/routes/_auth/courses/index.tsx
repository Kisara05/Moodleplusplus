import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getUserId } from "~/services/auth/session.server";
import { getSectionList } from "~/services/course.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  console.log("User ID in loader:", userId);
  const data = await getSectionList(userId!);
  const flatSections = data.map((item: any) => ({
    section_id: item.section_id,
    course_id: Array.isArray(item.course)
      ? item.course[0]?.course_id
      : item.course?.course_id,
    // Safely pull the name up to the top level
    course_name: Array.isArray(item.course)
      ? item.course[0]?.course_name
      : item.course?.course_name
  }));
  console.log("Flat sections:", flatSections);
  // Return the clean, flat list
  return { sections: flatSections };
}

export default function CoursesPage() {
  const { sections } = useLoaderData<typeof loader>();
  // Mock data - sau này sẽ fetch từ database
  // const courses = sections;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Available Courses</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((course) => (
          <Link
            key={course.section_id}
            to={`/courses/${course.section_id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
          >
            {/* <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-48 object-cover"
            /> */}
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{course.course_name}</h3>
              {/* <p className="text-gray-600 mb-4">{course.description}</p> */}
              <div className="flex justify-between items-center">
                {/* <span className="text-2xl font-bold text-blue-600">
                  ${course.price}
                </span> */}
                <span className="text-blue-600 hover:text-blue-700">
                  View Details →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
