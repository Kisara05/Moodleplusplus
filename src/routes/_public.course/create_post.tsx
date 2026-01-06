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

// --- 3. ACTION: Handle Post Creation ---
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string; // The HTML string from Editor
  const sectionId = params.courseID; // Locked to the URL

  if (!title || !content || !sectionId) {
    return { error: "Title and Content are required" ,  status: 400 };
  }

  return createPostWithContent({ title, content, sectionId });
}

// --- 4. COMPONENT: The UI ---
export default function CreatePostScoped() {
  const params = useParams();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // State to hold the HTML from the editor
  const [editorContent, setEditorContent] = useState("");

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-sm border rounded-lg mt-8">
      <div className="mb-6 border-b pb-4">
        <span className="text-sm text-gray-500 uppercase tracking-wide font-bold">
          Section: {params.courseID}
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">Create New Post</h1>
      </div>

      {actionData?.error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-6 border border-red-200">
          ⚠️ {actionData.error}
        </div>
      )}

      <Form method="post" className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Title</label>
          <input
            type="text"
            name="title"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="e.g. Chapter 1 Summary"
            required
          />
        </div>

        {/* Rich Text Editor */}
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Content</label>
          
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse p-4 text-gray-400">Loading Editor...</div>}>
              {/* Only render on client to avoid SSR issues with Quill */}
              {typeof window !== "undefined" && (
                <Editor
                  value={editorContent}
                  onChange={setEditorContent}
                />
              )}
            </Suspense>
          </div>

          {/* HIDDEN INPUT: Transfers the Editor state to the Form Action */}
          <input type="hidden" name="content" value={editorContent} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? "Publishing..." : "Publish Post"}
          </button>

          <a
            href={`/courses/${params.courseID}`}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-center"
          >
            Cancel
          </a>
        </div>
      </Form>
    </div>
  );
}