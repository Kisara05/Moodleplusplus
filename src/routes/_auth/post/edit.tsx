import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useState, lazy, Suspense } from "react";
import { getPostForEdit, updatePost, deletePost } from "~/services/post.server";

// Lazy load the editor
const Editor = lazy(() => import("~/components/common/Editor.client"));

export async function loader({ params }: LoaderFunctionArgs) {
  // 1. Get the ID from the filename parameter ($postID)
  const postID = params.postID; 
  
  if (!postID) throw new Response("Post ID Missing", { status: 400 });

  // 2. Fetch the post using your service
  const data = await getPostForEdit(postID);
  if (!data) throw new Response("Post not found", { status: 404 });

  return json({ post: data.post, content: data.content });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const postID = params.postID; // Matches file name

  if (!postID) return json({ error: "Missing ID" }, { status: 400 });

  // --- DELETE ---
  if (intent === "delete") {
    // We need the section_id to redirect the user back to the course list after deleting
    // We can get it from the form or fetch it, but usually passing it in hidden input is easiest, 
    // OR we fetch the post one last time to know where to go. 
    // For efficiency, let's grab it from the form if possible, or just fetch it.
    
    // Let's fetch the post quickly to know its section_id for the redirect
    const { post } = (await getPostForEdit(postID)) || {};
    if (!post) return json({ error: "Post not found" }, { status: 404 });

    const result = await deletePost(postID, post.section_id);
    if (result.error) return json({ error: result.error }, { status: 500 });

    return redirect(`/post/${post.section_id}`);
  }

  // --- SAVE ---
  if (intent === "save") {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    
    // We need section_id for the file path construction. 
    // We can pass it as a hidden input from the UI to save a DB call.
    const sectionId = formData.get("sectionId") as string;

    const result = await updatePost({ postId: postID, sectionId: sectionId, title: title, content: content });

    if (result.error) return json({ error: result.error }, { status: 500 });

    // Redirect back to the viewer
    return redirect(`/post/${postID}`);
  }

  return json({ error: "Invalid Intent" }, { status: 400 });
}

export default function EditPost() {
  const { post, content: initialContent } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [editorContent, setEditorContent] = useState(initialContent);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen">
      <div className="mb-8 border-b pb-6 flex justify-between items-center">
        <div>
           <a href={`/post/${post.post_id}`} className="text-sm text-gray-500 hover:text-blue-600 mb-2 block">
             &larr; Cancel & Go Back
           </a>
          <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
        </div>

        {/* Delete Button */}
        <Form method="post" onSubmit={(e) => !confirm("Delete this post permanently?") && e.preventDefault()}>
          <input type="hidden" name="intent" value="delete" />
          <button className="bg-red-50 text-red-600 px-4 py-2 rounded font-bold hover:bg-red-100 transition">
            Delete Post
          </button>
        </Form>
      </div>

      {actionData?.error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-6 border border-red-200">
          ⚠️ {actionData.error}
        </div>
      )}

      {/* Edit Form */}
      <Form method="post" className="space-y-6">
        <input type="hidden" name="intent" value="save" />
        {/* IMPORTANT: Pass section_id so the action knows where to save the file */}
        <input type="hidden" name="sectionId" value={post.section_id} />

        <div>
          <label className="block font-semibold text-gray-700 mb-2">Title</label>
          <input
            type="text"
            name="title"
            defaultValue={post.title}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-2">Content</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Suspense fallback={<div className="h-64 bg-gray-50 p-4">Loading Editor...</div>}>
              {typeof window !== "undefined" && (
                <Editor value={editorContent} onChange={setEditorContent} />
              )}
            </Suspense>
          </div>
          <input type="hidden" name="content" value={editorContent} />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </Form>
    </div>
  );
}