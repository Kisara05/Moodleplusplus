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
    course_id: item.course_id,
    // Safely pull the name up to the top level
    course_name: Array.isArray(item.course)
      ? item.course[0]?.course_name
      : item.course?.course_name
  }));
  // Return the clean, flat list
  return { sections: flatSections };
}

export default function CoursesList() {
  const { sections } = useLoaderData<typeof loader>();
  console.log(sections);
  return (
    <div>
      <h2>Danh sách khóa học</h2>
      <ul>
        {sections.map((course) => (
          <li key={course.section_id}>
            <Link to={`/courses/${course.section_id}`}>{course.course_name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
