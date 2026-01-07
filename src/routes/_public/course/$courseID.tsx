import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getSectionById } from "~/services/course.server";
import { getAllPosts } from "~/services/post.server";

export async function loader({ params }: LoaderFunctionArgs) {
  console.log(params);
  const courseId = params.courseID;
  console.log(courseId);
  if (!courseId) {
    throw new Response("Course ID is missing", { status: 400 });
  }
  const course = await getSectionById(courseId);
  const posts = await getAllPosts(courseId);
  console.log(course);
  console.log(posts);
  if (!course) {
    throw new Response("Course not found", { status: 404 });
  }
  if (!posts) {
    throw new Response("Invalid post return type", {status: 404});
  }
  return { course: course, posts: posts };
}

export default function CourseDetail() {
  const { course, posts } = useLoaderData<typeof loader>();
  console.log("CLIENT SIDE DATA RECEVIED:", posts);
  for (let i of posts) {
    console.log(i.title);
  }
  return (
    <div>
      <h2>{course.course_id}</h2>
      {/* <p>{course.description}</p> */}
      {/* 2. The Loop */}
      <ul className="space-y-2">
        {posts.map((post: any) => (
          <li 
            key={post.post_id} 
            className="p-3 border rounded shadow-sm hover:bg-gray-50 transition"
          >
            {/* The Post Title */}
            <Link to={`/post/${post.post_id}`}>{post.title}</Link>
            
            {/* Optional: Show ID for debugging
            <span className="text-gray-400 text-xs ml-2">
              (ID: {post.post_id})
            </span> */}
          </li>
        ))}
      </ul>
    </div>
  );
}
