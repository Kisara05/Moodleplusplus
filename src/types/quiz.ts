// app/types/quiz.ts

export type Choice = {
  choice_id: number;
  html_content: string;
  // If you want to prevent cheating, usually we DON'T include 'is_correct' here 
  // for the frontend, unless you are grading immediately on the client.
};

export type Question = {
  question_id: number;
  html_content: string;
  display_order: number;
  is_multiple_choice: boolean;
  choice_multiple_question: Choice[]; 
  image_url: string | null;
};

export type Quiz = {
  quiz_id: number;
  title: string;
  description: string | null;
  time_limit: number | null;    // Needed for the "20 min" display
  attempt_limit: number | null; // Needed if you want to show "Attempts: 1/3"
  grade: number | null;         // Total points for the quiz
  question: Question[];
  open_time: string | null;
  deadline: string | null;
  display_description: boolean;
};

// Add this new type for the Student's Record
export type Attempt = {
  attempt_id: number;
  student_id: string;
  quiz_id: number;
  started_at: string;    // Supabase returns timestamps as ISO strings
  submitted_at: string | null;
  grade: number | null;
};