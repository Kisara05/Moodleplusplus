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

export async function getComments(threadId: string) {
    const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
    if (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
    return data;
}