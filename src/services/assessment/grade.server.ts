import { supabase } from "~/services/supabase.server";

export async function updateEssayGrade(
  attemptId: number, 
  questionId: number, 
  newGrade: number, 
  feedback: string
) {
  // 1. Update the specific Question Record
  const { error: updateError } = await supabase
    .from("student_question_record")
    .update({ 
      grade: newGrade, 
      feedback: feedback 
    })
    .eq("attempt_id", attemptId)
    .eq("question_id", questionId);

  if (updateError) throw new Error("Failed to update question grade");

  // 2. RECALCULATE: Fetch all question scores for this attempt
  const { data: allScores } = await supabase
    .from("student_question_record")
    .select("grade")
    .eq("attempt_id", attemptId);

  if (!allScores) return;

  // 3. Sum them up
  const rawSum = allScores.reduce((sum, row) => sum + (row.grade || 0), 0);

  // 4. Fetch Quiz Max Score (to clamp)
  // We need to know the quiz_id to find the max grade
  const { data: attemptData } = await supabase
      .from("student_quiz_record")
      .select("quiz_id, quiz(grade)")
      .eq("attempt_id", attemptId)
      .single();

  // FIX STARTS HERE
  // We explicitly cast or check the type to handle Supabase's response
  let maxQuizGrade = 10;
  
  if (attemptData && attemptData.quiz) {
    // If it comes back as an array (one-to-many logic), take the first item
    const quizMeta = Array.isArray(attemptData.quiz) 
      ? attemptData.quiz[0] 
      : attemptData.quiz;
      
    // @ts-ignore: Suppress strict type check for now if types are generated
    maxQuizGrade = quizMeta?.grade || 10;
  }
  
  // 5. Clamp and Update Final Grade
  let finalGrade = Math.min(rawSum, maxQuizGrade);
  finalGrade = Math.max(finalGrade, 0); // Ensure no negatives

  await supabase
    .from("student_quiz_record")
    .update({ grade: finalGrade })
    .eq("attempt_id", attemptId);
    
  return true;
}