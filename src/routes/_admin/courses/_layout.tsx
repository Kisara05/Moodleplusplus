import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getUserId } from "~/services/auth/session.server";
import { getSectionList } from "~/services/course.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  console.log("User ID in loader:", userId);
  const courses = await getSectionList(userId!);
  console.log("Courses in loader:", courses);
  return json({ courses });
}

// export default function CoursesList() {
//   const { courses } = useLoaderData<typeof loader>();
//   return (
//     <div>
//       <h2>Danh sách khóa học</h2>
//       <ul>
//         {courses.map((course) => (
//           <li key={course.id}>
//             <Link to={`/courses/${course.id}`}>{course.title}</Link>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

export default function CoursesList() {
  const { courses } = useLoaderData<typeof loader>();
  console.log(courses);
  return (
    <div>
      <h2>Danh sách khóa học</h2>
      <ul>
        {courses.map((section) => (
          <li key={section.section_id}>
            {section.course.map((course) => (
              <div key={course.course_id}>
                <Link to={`/courses/${section.section_id}`}>
                  {course.course_name}
                </Link>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
