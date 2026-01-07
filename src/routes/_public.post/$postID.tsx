import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getPost, getPostInfo, getThreads } from "~/services/post.server";
import { supabase } from "~/services/supabase.server";

export async function loader({ params }: LoaderFunctionArgs) {

  const postId = params.postID; // Note: case sensitive, matches filename $postID

  if (!postId) {
    redirect("/");
    throw new Response("Post ID Missing", { status: 400 });
  }

  // If it's a quiz post, redirect to the quiz page
  const {data: post_temp, error} = await supabase
  .from("posts")
  .select(`
    post_id,
    post_type,
    title,
    quiz:quiz(quiz_id) 
  `)
  .eq("post_id", postId)
  .single();

  if (error || !post_temp) {
    throw new Response("Post retrieval error: " + error?.message, { status: 500 });
  }
  const linkedQuiz = Array.isArray(post_temp.quiz) ? post_temp.quiz[0] : post_temp.quiz;

  if (post_temp.post_type === "quiz" && linkedQuiz?.quiz_id) {
    // Use the variable 'linkedQuiz' we just extracted
    throw redirect(`/quiz/${linkedQuiz.quiz_id}`);
  }

  const post = await getPostInfo(postId);

  if (!post) {
    throw new Response("Post is missing", { status: 400 });
  }

  // For non-quiz posts, fetch content and threads
  const content = await getPost(post.section_id, post.post_id);

  if (!content) {
  }

  const threads = await getThreads(postId);

  return { post, content: content.htmlContent, threads: threads };
}

export default function PostViewer() {
  const { post, content, threads } = useLoaderData<typeof loader>();

  if (post.post_type !== 'discussion') 

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
      <div className="mb-6 pb-4 border-b border-gray-100 flex justify-between items-center">
        <Link 
          to={`/post/${post.post_id}/edit`}
          className="text-sm font-medium text-gray-500 hover:text-blue-600 transition flex items-center gap-1"
        >
          Edit Post ✏️
        </Link>
      </div>
    </div>
  );

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
      <div>
        {/* Threads Section */}
        {threads.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Discussions</h2>
            
            <ul className="space-y-2">
              {threads.map((thread) => (
                <li key={thread.thread_id} className="border-b border-gray-100 pb-2">
                  <Link to={`/thread/${thread.thread_id}`} className="text-blue-600 hover:underline">
                    {thread.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <div className="mb-6 pb-4 border-b border-gray-100 flex justify-between items-center">
        <Link 
          to={`/post/${post.post_id}/edit`}
          className="text-sm font-medium text-gray-500 hover:text-blue-600 transition flex items-center gap-1"
        >
          Edit Post ✏️
        </Link>
      </div>
    </div>
  );
}