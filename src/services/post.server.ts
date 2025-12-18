import { redirect } from "@remix-run/node";
import { supabase } from "./supabase.server";

interface CreatePostDTO {
  title: string;
  content: string; // The HTML string from Editor
  sectionId: string;
}

export async function getAllPosts(sectionId: string) {
    const { data, error } = await supabase
        .from('posts')            // Table: posts
        .select('post_id, title') // Columns: post_id and title
        .eq('section_id', sectionId);     // Filter: WHERE section_id = 2
    
    if (error) throw error;
    return data;
}

export async function getPostInfo(postId: string) {
    const { data, error } = await supabase
        .from('posts')            // Table: posts
        .select('post_id, section_id, title') // Columns: post_id and title
        .eq('post_id', postId)     // Filter: WHERE section_id = 2
        .single();
    
    if (error) throw error;
    return data;
}

export async function getPost(sectionId: string, postId: string) {
    let filePath = `${sectionId}/${postId}.html`

    const { data: fileBlob, error: storageError } = await supabase
        .storage
        .from("posts") // Matches the bucket name in your screenshot
        .download(filePath);
    if (storageError || !fileBlob) {
        console.error(`Error fetching ${filePath}:`, storageError);
        // Optional: Return a safe default string if file is missing
        return { htmlContent: "<p>Content not available.</p>" };
    }

    const htmlContent = await fileBlob.text();

    return { htmlContent };
}

export async function createPostWithContent({ title, content, sectionId }: CreatePostDTO) {
  // 1. Insert Metadata into Database
  // We use post_type: "post" as requested
  const { data: postData, error: dbError } = await supabase
    .from("posts")
    .insert([
      {
        title,
        section_id: sectionId,
        post_type: "post", 
      },
    ])
    .select()
    .single();

  if (dbError || !postData) {
    return { error: "Database Error: " + dbError?.message };
  }

  // 2. Construct the Full HTML File
  // Using the specific styling and wrapper from your snippet
  const fullHtml = `
    <div class="post-content-wrapper">
      <style>
        /* Scoped styles that will survive injection */
        .post-content-wrapper { 
          font-family: system-ui, -apple-system, sans-serif; 
          line-height: 1.6; 
          color: #374151; /* gray-700 */
        }
        .post-content-wrapper h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; margin-top: 1em; }
        .post-content-wrapper h2 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; margin-top: 1em; }
        .post-content-wrapper p { margin-bottom: 1em; }
        .post-content-wrapper ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
        .post-content-wrapper ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
        .post-content-wrapper img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0; }
        .post-content-wrapper pre { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; font-family: monospace; }
        .post-content-wrapper blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; color: #6b7280; font-style: italic; }
        .post-content-wrapper a { color: #2563eb; text-decoration: underline; }
      </style>
      
      ${content} 
    </div>
  `;

  const newPostId = postData.post_id;

  // 3. Construct File Path
  // Folder = sectionId, File = newPostId.html
  const filePath = `${sectionId}/${newPostId}.html`;

  // 4. Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from("posts")
    .upload(filePath, fullHtml, { contentType: "text/html", upsert: true });

  if (uploadError) {
    // If upload fails, try to clean up the empty DB row
    await supabase.from("posts").delete().eq("post_id", newPostId);
    return { error: "Storage Upload Error: " + uploadError.message };
  }

  // 5. Update Database with File URL
  // IMPORTANT: We update 'content_url' so the viewer knows where to find the file.
  // (Your snippet updated 'title', which was redundant).
  const { error: updateError } = await supabase
    .from("posts")
    .update({ title: title }) 
    .eq("post_id", newPostId);

  if (updateError) {
    // If we can't save the link, the post is broken, so we delete it.
    await supabase.from("posts").delete().eq("post_id", newPostId);
    return { error: "Final Update Error (Check if 'content_url' column exists): " + updateError.message };
  }

  return redirect(`/courses/${sectionId}`);
}