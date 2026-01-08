// import { supabase } from "./supabase.server";

// File này sẽ chứa logic backend (CRUD) cho Quiz
export async function getQuizzesForCourse(courseId: string) {
  console.log("Quiz Service: Getting quizzes for course", courseId);
  return [];
}

// Get quiz data by quiz ID for taking quiz
export async function getQuizById(quizId: string) {
  console.log("Quiz Service: Getting quiz by ID", quizId);
  // TODO: Implement backend call to get quiz data
  // const { data, error } = await supabase
  //   .from('quiz')
  //   .select('*')
  //   .eq('quiz_id', quizId)
  //   .single();
  
  // Mock data structure for frontend development
  return {
    quizId,
    quizName: "Quiz 1",
    textDescription: "What is the value of the v?",
    imageDescription: null, // URL or base64 for image
    questions: [],
    answerType: "multiple_choice", // or "free_response"
    hasFile: false, // true for multiplechoice2
    publishTime: {
      date: "2026-01-28",
      hour: "15",
      minute: "00",
      second: "00",
    },
    duration: {
      date: "2026-01-28",
      hour: "16",
      minute: "00",
      second: "00",
    },
    timeLimit: {
      hour: "00",
      minute: "40",
      second: "00",
    },
  };
}

// Get quiz questions for a quiz
export async function getQuizQuestions(quizId: string) {
  console.log("Quiz Service: Getting quiz questions", quizId);
  // TODO: Implement backend call to get questions
  // Mock data structure
  return [];
}
