import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { CommentNode, getComments, getThreads, insertComment } from "~/services/thread.server"; // Make sure this path is correct
import { getPostTitle } from "~/services/post.server";
import { Form, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { redirect } from "react-router-dom";
import { getUserId } from "~/services/auth/session.server";

export async function loader({ params }: LoaderFunctionArgs) {
    const threadID = params.threadID;
    if (!threadID) throw new Response("Thread ID Missing", { status: 400 });

    // 1. Fetch the Thread
    const thread = await getThreads(threadID);
    if (!thread) throw new Response("Thread not found", { status: 404 });

    // 2. Fetch the Post Title (Server-side)
    // We wait for it here so the component gets the final string, not a Promise.
    const postTitle = await getPostTitle(thread.post_id);

    const comments = await getComments(threadID);

    console.log("Comments Tree:", JSON.stringify(comments, null, 2));

    // 3. Return both to the component
    return { thread, postTitle, comments };
}

export async function action({ request, params }: LoaderFunctionArgs) {
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);
    const author = await getUserId(request);
    if (!author) {
      throw new Response("Unauthorized", { status: 401 });
    }
    console.log(updates);
    const content = formData.get("content") as string;
    const parentId = formData.get("parentId") as string;
    console.log(author, content, parentId);
    const threadID = await insertComment(author, content, parentId);
    redirect(`/threads/${threadID}`);
    return null;
}

function CommentView({ comment }: { comment: any }) {
  const [isReplying, setIsReplying] = useState(false);
  const navigation = useNavigation();
  
  // Check if we are currently submitting a reply to *this* specific comment
  const isSubmitting = navigation.state === "submitting" && navigation.formData?.get("parentId") === String(comment.discussion_id);

  // --- CHANGED LOGIC HERE ---
  // 1. We try to grab the name from the "Joined" table (users.full_name)
  // 2. If that fails (or is missing), we fallback to "Unknown"
  // Note: Supabase usually returns the relation as an object or an array depending on your FK setup.
  const authorProfile = Array.isArray(comment.users) ? comment.users[0] : comment.users;
  const authorName = authorProfile?.full_name || "Unknown Student";
  
  // Optional: Grab the ID for fallback display
  const authorId = comment.author || comment.user_id; 
  // --------------------------

  return (
    <div className="mb-4">
      {/* 1. THE COMMENT BOX */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:border-blue-300 transition-colors">
        
        {/* Header (User Info) */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                {authorName.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex flex-col">
                {/* Render the Safe Name */}
                <span className="text-xs font-bold text-gray-700">
                    {authorName}
                </span>
                {/* Optional: Show ID in tiny text for debugging/admin */}
                {/* <span className="text-[10px] text-gray-400">{authorId}</span> */}
            </div>
          </div>
          <span className="text-xs text-gray-400">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Content */}
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
            {comment.content}
        </p>

        {/* Action Bar */}
        <div className="mt-3 pt-2 border-t border-gray-50">
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs font-semibold text-gray-500 hover:text-blue-600 transition"
            >
                {isReplying ? "Cancel" : "Reply"}
            </button>
        </div>

        {/* 2. THE REPLY FORM (Only shows when isReplying is true) */}
        {isReplying && (
          <Form method="post" onSubmit={() => setIsReplying(false)} className="mt-3">
            <input type="hidden" name="parentId" value={comment.discussion_id} />
            
            <textarea 
              name="content"
              autoFocus
              required
              placeholder={`Replying to ${authorName}...`}
              className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-100 outline-none mb-2"
              rows={2}
            />
            
            <div className="flex justify-end">
              <button 
                type="submit" 
                className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-medium hover:bg-blue-700 transition"
              >
                {isSubmitting ? "Posting..." : "Post Reply"}
              </button>
            </div>
          </Form>
        )}
      </div>

      {/* 3. NESTED REPLIES */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 pl-4 border-l-2 border-gray-200 mt-2">
          {comment.replies.map((reply: any) => (
            <CommentView key={reply.discussion_id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ThreadViewer() {
    // 4. Retrieve the resolved data
    const { thread, postTitle, comments } = useLoaderData<typeof loader>();

    return (
    <div>
        {/* Now postTitle is a real string, so it renders perfectly */}
            <h1 className="text-2xl font-bold text-gray-500 mb-2">
                {postTitle?.data?.title || "Unknown Post"}
            </h1>
            <h2>{ thread.title }</h2>
            {comments.map((rootComment: any) => (
                <CommentView key={rootComment.discussion_id} comment={rootComment} />
            ))}
            <Link 
                to={`/post/${thread.post_id}`}
                className="text-sm font-medium text-gray-500 hover:text-blue-600 transition flex items-center gap-1"
                >
                Return to discussion
            </Link>
        </div>
    );
}