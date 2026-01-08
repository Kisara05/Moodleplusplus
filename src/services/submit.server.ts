// import { supabase } from "./supabase.server";

// File này sẽ chứa logic backend (CRUD) cho việc Nộp bài (Submission)
export async function submitAssignment(userId: string, assignmentId: string) {
  console.log("Submission Service: Submitting", userId, assignmentId);
  return { ok: true };
}
