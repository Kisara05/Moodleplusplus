import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ params }: LoaderFunctionArgs) {
  const courseId = params.courseId;

  // Sample data:
  if (courseId !== "1" && courseId !== "2") {
    throw new Response("Course not found", { status: 404 });
  }
  const course = {
    id: courseId,
    title: courseId === "1" ? "Software Enginering" : "Database Structure",
    description: "Mô tả chi tiết về khóa học...",
  };
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
