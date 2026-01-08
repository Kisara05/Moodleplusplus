import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import { getPost, getPostInfo, getThreads, createDiscussionThread } from "~/services/post.server";
import { getUserById } from "~/services/auth/auth.server";
import { getUserId } from "~/services/auth/session.server";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { Form, useNavigation } from "@remix-run/react";
import { useState } from "react";
import * as React from "react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  // Get user from session
  const userId = await getUserId(request);
  if (!userId) {
    return redirect("/login");
  }

  const user = await getUserById(userId);
  if (!user) {
    return redirect("/login");
  }

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

  const url = new URL(request.url);
  const language = (url.searchParams.get("lang") as "en" | "vi") || "en";
  const user_flag = user.role === "student" ? 1 : 0;

  return json({ 
    post, 
    content: content.htmlContent, 
    threads: threads,
    user,
    user_flag,
    language,
    userId: user.id,
  });
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
  const { post, content, threads, user, user_flag, language, userId } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentLanguage, setCurrentLanguage] = React.useState<"en" | "vi">(language);
  
  // State to toggle the "New Discussion" form
  const [isCreating, setIsCreating] = useState(false);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  const isStudent = user.role === "student";
  
  const toggleLanguage = () => {
    const newLang = currentLanguage === "en" ? "vi" : "en";
    setCurrentLanguage(newLang);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("lang", newLang);
    setSearchParams(newParams);
  };

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: "2rem",
    maxWidth: "1200px",
    width: "100%",
    margin: "0 auto",
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid #e0e0e0",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    fontWeight: "500",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.2s",
  };

  const backButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#2c7a7b",
    color: "white",
  };

  const editButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#2C8B85",
    color: "white",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#0A853F",
    marginBottom: "2rem",
  };

  const contentStyle: React.CSSProperties = {
    color: "#333",
    lineHeight: "1.8",
    marginBottom: "3rem",
  };

  if (post.post_type !== 'discussion') 

  return (
    <div style={containerStyle}>
      <Header
        signed_in={true}
        user_flag={user_flag}
        language={currentLanguage}
        onLanguageChange={toggleLanguage}
        userId={userId}
      />
      <main style={mainStyle}>
        {/* Navigation Buttons */}
        <div style={buttonContainerStyle}>
          <Link 
            to={`/courses/${post.section_id}`}
            style={backButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#236b6d";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#2c7a7b";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            ← Back to Course
          </Link>
          {!isStudent && (
            <Link 
              to={`/post/${post.post_id}/edit`}
              style={editButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#247a74";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#2C8B85";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Edit Post ✏️
            </Link>
          )}
        </div>

        {/* The Post Title (From DB) */}
        <h1 style={titleStyle}>
          {post.title}
        </h1>

        {/* The Post Content (From Storage) */}
        <div 
          style={contentStyle}
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      </main>
      <Footer language={currentLanguage} />
    </div>
  );

  //view for discussion posts
  return (
    <div style={containerStyle}>
      <Header
        signed_in={true}
        user_flag={user_flag}
        language={currentLanguage}
        onLanguageChange={toggleLanguage}
        userId={userId}
      />
      <main style={mainStyle}>
        {/* Navigation Buttons */}
        <div style={buttonContainerStyle}>
          <Link 
            to={`/courses/${post.section_id}`}
            style={backButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#236b6d";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#2c7a7b";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            ← Back to Course
          </Link>
          {!isStudent && (
            <Link 
              to={`/post/${post.post_id}/edit`}
              style={editButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#247a74";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#2C8B85";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Edit Post ✏️
            </Link>
          )}
        </div>

        <h1 style={titleStyle}>{post.title}</h1>

        <div 
          style={contentStyle}
          dangerouslySetInnerHTML={{ __html: content }} 
        />

        {/* --- DISCUSSION SECTION --- */}
        <div>
          {/* Header + New Button */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            paddingBottom: "0.5rem",
            borderBottom: "1px solid #e0e0e0",
          }}>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#333",
            }}>Discussions</h2>
            <button
              onClick={() => setIsCreating(!isCreating)}
              style={{
                backgroundColor: "#2c7a7b",
                color: "white",
                fontSize: "0.875rem",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                fontWeight: "500",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#236b6d";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#2c7a7b";
              }}
            >
              {isCreating ? "Cancel" : "+ New Discussion"}
            </button>
          </div>

          {/* The Creation Form (Visible only when clicking button) */}
          {isCreating && (
            <div style={{
              backgroundColor: "#f9f9f9",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              padding: "1.5rem",
              marginBottom: "2rem",
            }}>
              <h3 style={{
                fontWeight: "bold",
                color: "#333",
                marginBottom: "1rem",
              }}>Start a new topic</h3>
              <Form method="post" onSubmit={() => setIsCreating(false)}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    color: "#666",
                    textTransform: "uppercase",
                    marginBottom: "0.25rem",
                  }}>Title</label>
                  <input 
                    name="title" 
                    type="text" 
                    required 
                    placeholder="What is this discussion about?"
                    style={{
                      width: "100%",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      padding: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    color: "#666",
                    textTransform: "uppercase",
                    marginBottom: "0.25rem",
                  }}>First Message</label>
                  <textarea 
                    name="message" 
                    required 
                    rows={3}
                    placeholder="Type your question or thought here..."
                    style={{
                      width: "100%",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      padding: "0.5rem",
                      fontSize: "0.875rem",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: "#0A853F",
                      color: "white",
                      fontSize: "0.875rem",
                      padding: "0.5rem 1.5rem",
                      borderRadius: "4px",
                      fontWeight: "500",
                      border: "none",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      opacity: isSubmitting ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.backgroundColor = "#086d32";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#0A853F";
                    }}
                  >
                    {isSubmitting ? "Creating..." : "Create Discussion"}
                  </button>
                </div>
              </Form>
            </div>
          )}

          {/* Existing Threads List */}
          {threads.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {threads.map((thread) => (
                <li key={thread.thread_id} style={{
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "1rem",
                  marginBottom: "0.75rem",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}>
                  <Link 
                    to={`/threads/${thread.thread_id}`} 
                    style={{
                      display: "block",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <h4 style={{
                      fontWeight: "bold",
                      color: "#333",
                      marginBottom: "0.25rem",
                    }}>
                      {thread.title}
                    </h4>
                    <div style={{
                      fontSize: "0.75rem",
                      color: "#999",
                    }}>
                      View discussion →
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{
              color: "#999",
              fontStyle: "italic",
              fontSize: "0.875rem",
            }}>No discussions yet. Be the first to start one!</p>
          )}
        </div>
      </main>
      <Footer language={currentLanguage} />
    </div>
  );
}