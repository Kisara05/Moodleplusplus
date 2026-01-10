import { supabase } from "~/services/supabase.server";
import type { Quiz } from "~/types/models/quiz";
import { getUserId } from "../auth/session.server";
import { redirect } from "react-router-dom";
import { getUserById } from "../auth/auth.server";
import { json } from "react-router-dom";  

export async function authorizeAttemptReviewAccess(quizId: number, request: Request){
  const userId = await getUserId(request);
  if (!userId) return redirect("/login");
  const user = await getUserById(userId);
  if (!user) return redirect("/login");
  if (user.role === "student") {
    return true;
  }
  else if (user.role === "teacher" || user.role === "admin") {
    throw json({error: "Access denied", status: 403});
  }
}

export async function getQuizById(quizId: number): Promise<Quiz | null> {
  const { data, error } = await supabase
    .from("quiz")
    .select(`
      *,
      question (
        *,
        choice_multiple_question (*)
      )
    `)
    .eq("quiz_id", quizId)
    .single();

  if (error) return null;

  // SORTING (Optional but recommended):
  // Sort questions by display_order
  if (data.question) {
    data.question.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
    
    // Sort choices inside each question
    data.question.forEach((q: any) => {
      if (q.choice_multiple_question) {
        q.choice_multiple_question.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
      }
    });
  }

  return data;
}

export async function getStudentAttempt(quizId: number, studentId: string) {
  const { data, error } = await supabase
    .from("student_quiz_record")
    .select("*")
    .eq("quiz_id", quizId)
    .eq("student_id", studentId)
    // We want the most recent attempt
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    // Real error, not just "not found"
    console.error("Error fetching attempt:", error);
    return null;
  }

  return data; // Returns the attempt object OR null if none exists
}

export async function getStudentAttempts(quizId: number, studentId: string) {
  const { data, error } = await supabase
    .from("student_quiz_record")
    .select("*")
    .eq("quiz_id", quizId)
    .eq("student_id", studentId)
    .order("started_at", { ascending: false }); // Newest on top

  if (error) throw error;
  return data;
}

export async function createAttempt(quizId: number, studentId: string) {
  const { data, error } = await supabase
    .from("student_quiz_record")
    .insert({
      quiz_id: quizId,
      student_id: studentId,
      started_at: new Date().toISOString(),
      // grade starts as null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function submitQuizAttempt(
  quizId: number,
  studentId: string,
  answers: Record<string, number | string>
) {
  // 1. Get Active Attempt
  const { data: attempt } = await supabase
    .from("student_quiz_record")
    .select("attempt_id")
    .eq("quiz_id", quizId)
    .eq("student_id", studentId)
    .is("submitted_at", null)
    .single();

  if (!attempt) throw new Error("No active attempt found!");

  // 2. Fetch Quiz Data (Source of Truth)
  const { data: quizData } = await supabase
    .from("quiz")
    .select(`
      grade, 
      question (
        question_id,
        grade, 
        is_multiple_choice,
        choice_multiple_question (choice_id, grade, is_correct)
      )
    `)
    .eq("quiz_id", quizId)
    .single();
    
  if (!quizData) throw new Error("Quiz data not found");

  // 3. Process Answers
  const mcRecords = [];
  const essayRecords = [];
  const questionGradeRecords = []; 
  
  let rawSumScore = 0; 

  // LOOP THROUGH EVERY QUESTION
  for (const q of quizData.question) {
    const userAnswer = answers[q.question_id];
    let questionScore = 0; 
    let feedback = null;

    // CHECK: Did the user provide an answer?
    // We treat empty strings "" as no answer too.
    const hasAnswer = userAnswer !== undefined && userAnswer !== null && userAnswer !== "";

    if (hasAnswer) {
      if (q.is_multiple_choice === false) {
        // --- ESSAY ---
        if (typeof userAnswer === 'string') {
          essayRecords.push({
            attempt_id: attempt.attempt_id,
            question_id: q.question_id,
            html_content: userAnswer
          });
          // Score 0 until graded
        }
      } else {
        // --- MULTIPLE CHOICE ---
        const userChoiceId = Number(userAnswer);
        if (!isNaN(userChoiceId)) {
          mcRecords.push({
            attempt_id: attempt.attempt_id,
            question_id: q.question_id,
            choice_id: userChoiceId,
            is_selected: true 
          });

          // Calc Score
          const selectedChoice = q.choice_multiple_question.find((c: any) => c.choice_id === userChoiceId);
          if (selectedChoice) {
            questionScore = (selectedChoice.grade || 0);
          }
        }
      }
      
      // Safety: Clamp Score
      const questionMax = q.grade || 0;
      if (questionScore > questionMax) questionScore = questionMax;
    } else {
      // --- NO ANSWER PROVIDED ---
      // We explicitly set score to 0. 
      // We do NOT insert into mcRecords or essayRecords (saving space),
      // but we WILL insert into questionGradeRecords below.
      questionScore = 0;
      feedback = null; // Or set default: "Question skipped"
    }

    // Add to running total
    rawSumScore += questionScore;

    // CRITICAL CHANGE: Always push this record, even if skipped
    questionGradeRecords.push({
      attempt_id: attempt.attempt_id,
      question_id: q.question_id,
      grade: questionScore,
      feedback: feedback // Now the row exists, so Teachers can UPDATE this field later!
    });
  }

 // 4. Batch Insert (Atomic-like operations) WITH ERROR TRAPS

  if (mcRecords.length > 0) {
    const { error: mcError } = await supabase
      .from("student_choice_multiple_record")
      .insert(mcRecords);
      
    if (mcError) {
      console.error("MC Insert Error:", mcError); 
      throw new Error(`MC Insert Failed: ${mcError.message}`);
    }
  }

  if (essayRecords.length > 0) {
    const { error: essayError } = await supabase
      .from("student_essay_question_record")
      .insert(essayRecords);

    if (essayError) {
      console.error("Essay Insert Error:", essayError);
      throw new Error(`Essay Insert Failed: ${essayError.message}`);
    }
  }

  if (questionGradeRecords.length > 0) {
    const { error: qError } = await supabase
      .from("student_question_record")
      .insert(questionGradeRecords);
      
    if (qError) throw new Error(`Question Record Failed: ${qError.message}`);
  }

  // 5. FINAL CALCULATION: Clamp [0, Quiz Max]
  const quizMaxScore = quizData.grade || 0;
  
  // Logic: Max(0, Min(RawSum, QuizMax))
  let finalGrade = Math.min(rawSumScore, quizMaxScore); // Cap at Max
  finalGrade = Math.max(finalGrade, 0);                 // Floor at 0

  // 6. Update Attempt
  const { error: updateError } = await supabase
    .from("student_quiz_record")
    .update({
      grade: finalGrade,
      submitted_at: new Date().toISOString()
    })
    .eq("attempt_id", attempt.attempt_id);

  if (updateError) throw updateError;

  return finalGrade;
}

export async function getAttemptReview(quizId: number, attemptId: number, studentId: string) {
  // 1. Verify this attempt belongs to the student (Security)
  const { data: attempt } = await supabase
    .from("student_quiz_record")
    .select("*")
    .eq("attempt_id", attemptId)
    .eq("student_id", studentId)
    .eq("quiz_id", quizId) // Extra safety check
    .single();

  if (!attempt) return null;

  // 2. Fetch Questions & Answer Key
  // We need to know which choices were correct to show the user
  const { data: quizData } = await supabase
    .from("quiz")
    .select(`
      title,
      grade,
      question (
        question_id,
        html_content,
        grade,
        is_multiple_choice,
        choice_multiple_question (
          choice_id,
          html_content,
          is_correct,
          grade
        )
      )
    `)
    .eq("quiz_id", quizId)
    .single();

  // 3. Fetch Student's Specific Answers
  const { data: mcAnswers } = await supabase
    .from("student_choice_multiple_record")
    .select("question_id, choice_id")
    .eq("attempt_id", attemptId);

  const { data: essayAnswers } = await supabase
    .from("student_essay_question_record")
    .select("question_id, html_content")
    .eq("attempt_id", attemptId);

  // 4. Fetch the Grades Per Question (The Snapshot)
  const { data: questionGrades } = await supabase
    .from("student_question_record")
    .select("question_id, grade, feedback")
    .eq("attempt_id", attemptId);

  return { 
    attempt, 
    quiz: quizData, 
    answers: { 
      mc: mcAnswers || [], 
      essay: essayAnswers || [] 
    },
    grades: questionGrades || []
  };
}

export async function getQuizzesForCourse(courseId: string) {
  console.log("Quiz Service: Getting quizzes for course", courseId);
  return [];
}
