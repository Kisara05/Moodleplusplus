// import type { LoaderFunctionArgs } from "@remix-run/node";
// import { json } from "@remix-run/node";
// import { useLoaderData, Link } from "@remix-run/react";
// // import { getCourseList } from "~/services/course.server";

// export async function loader({ request }: LoaderFunctionArgs) {
//   // const courses = await getCourseList();
//   // Sample data:
//   const courses = [
//     { id: "1", title: "Software Engineering" },
//     { id: "2", title: "Databases Structure" },
//   ];
//   return json({ courses });
// }

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
