import { supabase } from "./supabase.server";

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