import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, Form, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { redirect } from "react-router-dom";
import { getPostTitle } from "~/services/post.server";
import { CommentNode, getComments, getThreads, insertComment } from "~/services/thread.server";
import { getUserId } from "~/services/auth/session.server";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";

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
    <div style={{ marginBottom: "1rem" }}>
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          padding: "1rem",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: "#e6f2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#2c7a7b",
              }}
            >
              {authorName.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#333" }}>{authorName}</span>
            </div>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#888" }}>
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>

        <div style={{ color: "#333", fontSize: "0.95rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
          {comment.content}
        </div>

        <div style={{ marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid #f0f0f0" }}>
          {!isReplying && (
            <button
              onClick={() => setIsReplying(true)}
              style={{
                backgroundColor: "#2c7a7b",
                color: "white",
                fontSize: "0.85rem",
                padding: "0.4rem 0.75rem",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Reply
            </button>
          )}

          {isReplying && (
            <Form method="post" onSubmit={() => setIsReplying(false)} style={{ marginTop: "0.75rem" }}>
              <input type="hidden" name="parentId" value={comment.discussion_id} />
              <textarea
                name="content"
                autoFocus
                required
                placeholder={`Replying to ${authorName}...`}
                style={{
                  width: "100%",
                  fontSize: "0.95rem",
                  padding: "0.6rem",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  outline: "none",
                  marginBottom: "0.75rem",
                }}
                rows={3}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setIsReplying(false)}
                  style={{
                    backgroundColor: "#ff9800",
                    color: "white",
                    fontSize: "0.9rem",
                    padding: "0.45rem 0.9rem",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#2c7a7b",
                    color: "white",
                    fontSize: "0.9rem",
                    padding: "0.45rem 0.9rem",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Posting..." : "Post Reply"}
                </button>
              </div>
            </Form>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginLeft: "1.5rem", borderLeft: "2px solid #e0e0e0", paddingLeft: "1rem", marginTop: "0.75rem" }}>
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

    const containerStyle: React.CSSProperties = {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#FFFFFF",
    };

    const mainStyle: React.CSSProperties = {
      flex: 1,
      padding: "2rem",
      maxWidth: "900px",
      width: "100%",
      margin: "0 auto",
    };

    const backLinkStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.35rem",
      color: "#2c7a7b",
      textDecoration: "none",
      fontWeight: 600,
      marginBottom: "1rem",
    };

    const titleStyle: React.CSSProperties = {
      fontSize: "2.2rem",
      fontWeight: "bold",
      color: "#0A853F",
      marginBottom: "0.5rem",
    };

    const subtitleStyle: React.CSSProperties = {
      fontSize: "1.1rem",
      fontWeight: 600,
      color: "#555",
      marginBottom: "1.5rem",
    };

    return (
    <div style={containerStyle}>
      <Header signed_in={true} />
      <main style={mainStyle}>
        <Link to={`/post/${thread.post_id}`} style={backLinkStyle}>
          ← Return to discussion
        </Link>

        <h1 style={titleStyle}>{postTitle?.data?.title || "Unknown Post"}</h1>
        <h2 style={subtitleStyle}>{thread.title}</h2>

        <div style={{ marginTop: "1.5rem" }}>
          {comments.map((rootComment: any) => (
            <CommentView key={rootComment.discussion_id} comment={rootComment} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
    );
}