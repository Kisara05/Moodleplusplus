import { supabase } from "./supabase.server";

export async function getThreads(threadId: string) {
    const { data, error } = await supabase
        .from("threads")
        .select("*")
        .eq("thread_id", threadId)
        .single();
    if (error) throw error;
    return data;
}

type CommentRow = {
  discussion_id: number;       // PK
  reply_discussion: number | null; // Parent ID (FK)
  thread_id: number;
  content: string;
  created_at: string;
  author: string;
};

// This is the "Nested" version we will return
export type CommentNode = CommentRow & {
  replies: CommentNode[];
};

export async function insertComment(authorID: string, content: string, parentId: string | undefined, threadId?: string) {
  console.log(authorID, content, parentId);
  console.log("Inserting comment. Parent ID:", parentId, "Content:", content);

  const { data: insertData, error: insertError } = await supabase
    .from("discussion")
    .insert([
      {
        content: content,
        reply_discussion: parentId || null,
        thread_id: threadId,
        author: authorID
      },
    ])
    .select()
    .single();
  if (insertError) {
    console.error("Error inserting comment:", insertError);
    throw insertError;
  }
  console.log("Inserted comment:", content);
  return threadId;
}

export async function getComments(threadId: string) {
  const { data, error } = await supabase
    .from("discussion")
    .select(`
      *,
      users (
        full_name
      )
    `) 
    // ^ MAGICAL CHANGE: This tells Supabase: 
    // "Look at the Foreign Key (author/user_id), go to the 'users' table, 
    // and grab the 'full_name' for me right now."
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  // B. Transform Flat List -> Nested Tree (The Logic You Needed)
  const commentMap = new Map<number, CommentNode>();
  const rootComments: CommentNode[] = [];

  // Pass 1: Create a map of all comments and add the 'replies' array to them
  data.forEach((row) => {
    // We force cast row to CommentRow to ensure types match
    commentMap.set(row.discussion_id, { ...row, replies: [] } as CommentNode);
  });

  // Pass 2: Link children to their parents
  data.forEach((row) => {
    const comment = commentMap.get(row.discussion_id)!;

    if (row.reply_discussion) {
      // If it has a parent ID, find the parent in our map
      const parent = commentMap.get(row.reply_discussion);
      
      // If parent exists, push this comment into the parent's replies
      if (parent) {
        parent.replies.push(comment);
      } else {
        // Edge case: Parent not found (maybe deleted?), treat as root
        rootComments.push(comment);
      }
    } else {
      // If reply_discussion is NULL, it is a Top-Level Root comment
      rootComments.push(comment);
    }
  });

  return rootComments;
}