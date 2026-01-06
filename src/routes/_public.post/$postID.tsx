import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getPost, getPostInfo, getThreads, createDiscussionThread } from "~/services/post.server";
import { Form, useNavigation } from "@remix-run/react";
import { useState } from "react";

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

  const threads = await getThreads(postId);

  return { post, content: content.htmlContent, threads: threads };
}

export async function action({ request, params }: LoaderFunctionArgs) {
  const postId = params.postID;
  const formData = await request.formData();

  const title = formData.get("title") as string;
  const message = formData.get("message") as string;
  if (!postId || !title || !message) {
    throw new Response("Invalid Form Data", { status: 400 });
    return null;
  }
  const error = await createDiscussionThread(postId, title, message);
  if (error) {
    throw new Response("Error creating discussion thread", { status: 500 });
  }
  return redirect(`/post/${postId}`);
}

export default function PostViewer() {
  const { post, content, threads } = useLoaderData<typeof loader>();
  // State to toggle the "New Discussion" form
  const [isCreating, setIsCreating] = useState(false);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
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

  //view for discussion posts
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

      <h1 className="text-3xl font-bold text-gray-900 mb-8">{post.title}</h1>

      <div 
        className="prose prose-blue max-w-none text-gray-800 leading-relaxed mb-12"
        dangerouslySetInnerHTML={{ __html: content }} 
      />

      {/* --- DISCUSSION SECTION --- */}
      <div>
        {/* Header + New Button */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
            <h2 className="text-xl font-bold text-gray-800">Discussions</h2>
            <button
                onClick={() => setIsCreating(!isCreating)}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition shadow-sm"
            >
                {isCreating ? "Cancel" : "+ New Discussion"}
            </button>
        </div>

        {/* The Creation Form (Visible only when clicking button) */}
        {isCreating && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 animate-in fade-in slide-in-from-top-2">
                <h3 className="font-bold text-gray-700 mb-4">Start a new topic</h3>
                <Form method="post" onSubmit={() => setIsCreating(false)}>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                        <input 
                            name="title" 
                            type="text" 
                            required 
                            placeholder="What is this discussion about?"
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Message</label>
                        <textarea 
                            name="message" 
                            required 
                            rows={3}
                            placeholder="Type your question or thought here..."
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-green-600 text-white text-sm px-6 py-2 rounded font-medium hover:bg-green-700 transition"
                        >
                            {isSubmitting ? "Creating..." : "Create Discussion"}
                        </button>
                    </div>
                </Form>
            </div>
        )}

        {/* Existing Threads List */}
        {threads.length > 0 ? (
          <ul className="space-y-3">
            {threads.map((thread) => (
              <li key={thread.thread_id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition shadow-sm">
                <Link to={`/threads/${thread.thread_id}`} className="block group">
                  <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition mb-1">
                    {thread.title}
                  </h4>
                  <div className="text-xs text-gray-400">
                     View discussion &rarr;
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
            <p className="text-gray-400 italic text-sm">No discussions yet. Be the first to start one!</p>
        )}
      </div>

      <div className="mt-12 mb-6 pt-4 border-t border-gray-100">
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