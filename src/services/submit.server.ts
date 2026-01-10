// import { supabase } from "./supabase.server";

// File này sẽ chứa logic backend (CRUD) cho việc Nộp bài (Submission)
export async function submitAssignment(userId: string, assignmentId: string) {
  console.log("Submission Service: Submitting", userId, assignmentId);
  return { ok: true };
}

// Submit quiz answers
export async function submitQuizAnswers(
  userId: string,
  quizId: string,
  answers: {
    questionId: string;
    answer: number | string; // number for multiple choice, string for free response
  }[]
) {
  console.log("Submission Service: Submitting quiz answers", userId, quizId, answers);
  // TODO: Implement backend call to save quiz submission
  // const { data, error } = await supabase
  //   .from('quiz_submission')
  //   .insert({
  //     student_id: userId,
  //     quiz_id: quizId,
  //     answers: answers,
  //     submitted_at: new Date().toISOString()
  //   });
  
  return { success: true, message: "Quiz submitted successfully" };
}
