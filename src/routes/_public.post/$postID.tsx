import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getPost, getPostInfo } from "~/services/post.server";

export async function loader({ params }: LoaderFunctionArgs) {

  const postId = params.postID; // Note: case sensitive, matches filename $postID

  if (!postId) {
    redirect("/");
    throw new Response("Post ID Missing", { status: 400 });
  }

  const post = await getPostInfo(postId);

  if (!post) {
    throw new Response("Post is missing", { status: 400 });
  }

  const content = await getPost(post.section_id, post.post_id);

  if (!content) {
  }

  return { post, content: content.htmlContent };
}

export default function PostViewer() {
  const { post, content } = useLoaderData<typeof loader>();

  return (
    <div className="p-8">
      {/* Navigation Header */}
      <div className="mb-6 pb-4 border-b border-gray-100 flex justify-between items-center">
        <Link 
          to={`/courses/${post.section_id}`}
          className="text-sm font-medium text-gray-500 hover:text-blue-600 transition flex items-center gap-1"
        >
          ← Back to Course
        </Link>
      </div>

      {/* The Post Title (From DB) */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {post.title}
      </h1>

      {/* The Post Content (From Storage) */}
      {/* 'prose' class comes from @tailwindcss/typography plugin. 
          If you don't have it, the text might look unstyled. */}
      <div 
        className="prose prose-blue max-w-none text-gray-800 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </div>
  );
}