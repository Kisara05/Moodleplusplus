import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getSectionList } from "~/services/course.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const courses = await getSectionList();
  // FLATTEN HERE using .map()
  const flatSections = courses.map((item: any) => ({
    section_id: item.section_id,
    course_id: item.course_id,
    // Safely pull the name up to the top level
    course_name: Array.isArray(item.course) 
      ? item.course[0]?.course_name 
      : item.course?.course_name
  }));

  // Return the clean, flat list
  return json({ courses: flatSections });
}

export default function CoursesList() {
  const { courses } = useLoaderData<typeof loader>();
  // console.log(courses);
  return (
    <div>
      <h2>Danh sách khóa học</h2>
      <ul>
        {courses.map((course) => (
          <li key={course.section_id}>
            <Link to={`/courses/${course.section_id}`}>{course.course_name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
