import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation, useParams } from "@remix-run/react";
import { useState, lazy, Suspense } from "react";
import { createPostWithContent } from "~/services/post.server";

// --- 1. Lazy Load the Client-Only Editor ---
// We use lazy() so this heavy component is only loaded in the browser, not the server.
const Editor = lazy(() => import("~/components/common/Editor.client"));

// --- 2. LOADER: Verify Section Exists ---
export async function loader({ params }: LoaderFunctionArgs) {
  const sectionId = params.courseID;
  if (!sectionId) throw new Response("Section ID Missing", { status: 400 });
  return { sectionId };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  
  // Extract fields
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const postType = formData.get("postType") as string; // 'material' | 'discussion'
  const sectionId = params.courseID;

  if (!title || !content || !sectionId || !postType) {
    return json({ error: "Title and Content are required" }, { status: 400 });
  }

  // Pass the 'type' to your service
  // Ensure your createPostWithContent function accepts this new property!
  return createPostWithContent({ 
    title, 
    content, 
    sectionId, 
    post_type: postType || 'post' 
  });
}

// --- 4. COMPONENT ---
export default function CreatePostScoped() {
  const params = useParams();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // State
  const [editorContent, setEditorContent] = useState("");
  const [postType, setPostType] = useState<"post" | "discussion" | "quiz">("post");

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-sm border border-gray-200 rounded-lg mt-8">
      
      {/* Header */}
      <div className="mb-6 border-b pb-4">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Section: {params.courseID}
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">Create New Content</h1>
      </div>

      {/* Error Message */}
      {actionData?.error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-6 border border-red-200 flex items-center gap-2">
          <span>⚠️</span> {actionData.error}
        </div>
      )}

      <Form method="post" className="space-y-6">
        
        {/* --- TYPE SELECTOR (Tabs) --- */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Content Type</label>
          <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setPostType("post")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                postType === "post"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📖 Learning Post
            </button>
            <button
              type="button"
              onClick={() => setPostType("discussion")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                postType === "discussion"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              💬 Discussion Topic
            </button>
            <button
              type="button"
              onClick={() => setPostType("quiz")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                postType === "quiz"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ❓ Quiz
            </button>
          </div>
          {/* Hidden Input to send the selection */}
          <input type="hidden" name="postType" value={postType} />
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {postType === "post" ? "Title" : "Topic Subject"}
          </label>
          <input
            type="text"
            name="title"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
            placeholder={postType === "post" ? "e.g. Chapter 1 Summary" : "e.g. Question about the assignment..."}
            required
          />
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {postType === "post" ? "Content" : "Message"}
          </label>
          
          <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition">
            <Suspense fallback={<div className="h-64 bg-gray-50 p-4 text-gray-400 flex items-center justify-center">Loading Editor...</div>}>
              {typeof window !== "undefined" && (
                <Editor
                  value={editorContent}
                  onChange={setEditorContent}
                />
              )}
            </Suspense>
          </div>
          {/* Hidden Input for Editor Data */}
          <input type="hidden" name="content" value={editorContent} />
          
          {/* Helper Text */}
          <p className="text-xs text-gray-400 mt-2">
            {postType === "post" 
              ? "Use this area to write full lecture notes, add images, or embed videos."
              : "Describe the topic you want to discuss. Others can reply to this thread."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
          >
            {isSubmitting 
              ? "Publishing..." 
              : postType === "post" ? "Publish Post" : "Start Discussion"
            }
          </button>

          <a
            href={`/courses/${params.courseID}`}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-center font-medium"
          >
            Cancel
          </a>
        </div>
      </Form>
    </div>
  );
}