import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getCourseById } from "~/services/course.server";

export async function loader({ params }: LoaderFunctionArgs) {
  console.log(params);
  const courseId = params.courseID;
  console.log(courseId);
  if (!courseId) {
    throw new Response("Course ID is missing", { status: 400 });
  }
  const course = await getCourseById(courseId);
  if (!course) {
    throw new Response("Course not found", { status: 404 });
  }
  return json({ course });

  // Sample data:
  if (courseId !== "1" && courseId !== "2") {
    throw new Response("Course not found", { status: 404 });
  }
  // const course = {
  //   id: courseId,
  //   title: courseId === "1" ? "Software Enginering" : "Database Structure",
  //   description: "Mô tả chi tiết về khóa học...",
  // };
  console.log(course);
  return json({ course });
}

export default function CourseDetail() {
  const { course } = useLoaderData<typeof loader>();
  return (
    <div>
      <h2>{course.title}</h2>
      <p>{course.description}</p>
    </div>
  );
}
