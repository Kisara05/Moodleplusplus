// app/routes/_auth/teaching/quiz/$quizID/grading.tsx

import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams, Form, useSubmit, useNavigation } from "@remix-run/react";
import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
import { updateEssayGrade } from "~/services/quiz.server"; // The service we wrote earlier

// --- LOADER: FETCH LIST + SELECTED ATTEMPT ---
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const quizId = Number(params.quizID);
  const url = new URL(request.url);
  const selectedAttemptId = url.searchParams.get("attemptId");
  
  const supabase = createClient(
    process.env.SUPABASE_URL!, 
    process.env.SUPABASE_ANON_KEY!
  );

  // 1. Fetch Quiz Info
  const { data: quiz } = await supabase
    .from("quiz")
    .select("title, grade")
    .eq("quiz_id", quizId)
    .single();

  // 2. Fetch ALL Attempts (For Sidebar) -> UPDATED TO JOIN STUDENT
  const { data: attemptsList } = await supabase
    .from("student_quiz_record")
    .select(`
      attempt_id, 
      student_id, 
      grade, 
      submitted_at,
      student ( student_name )  
    `) // <--- We now fetch the related student object
    .eq("quiz_id", quizId)
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false });

  // 3. If an ID is selected, fetch the Full Details
  let selectedData = null;
  if (selectedAttemptId) {
    // A. The Attempt Record -> UPDATED TO JOIN STUDENT
    const { data: attempt } = await supabase
      .from("student_quiz_record")
      .select("*, student ( student_name )") // <--- Join here too
      .eq("attempt_id", selectedAttemptId)
      .single();

    // ... (Rest of Step B and C remains exactly the same) ...
    const { data: fullQuiz } = await supabase
      .from("quiz")
      .select(`
        question (
          question_id, html_content, grade, is_multiple_choice,
          choice_multiple_question (choice_id, html_content, is_correct, grade)
        )
      `)
      .eq("quiz_id", quizId)
      .single();

    const { data: savedAnswers } = await supabase
      .from("student_question_record")
      .select("question_id, grade, feedback") 
      .eq("attempt_id", selectedAttemptId);
      
    const { data: essayContent } = await supabase
      .from("student_essay_question_record")
      .select("question_id, html_content")
      .eq("attempt_id", selectedAttemptId);

    const { data: mcContent } = await supabase
      .from("student_choice_multiple_record")
      .select("question_id, choice_id")
      .eq("attempt_id", selectedAttemptId);

    selectedData = {
      attempt,
      questions: fullQuiz?.question || [],
      savedAnswers: savedAnswers || [],
      essayContent: essayContent || [],
      mcContent: mcContent || []
    };
  }

  return json({ quiz, attemptsList, selectedData, selectedAttemptId });
};

// --- ACTION: HANDLE GRADING ---
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = String(formData.get("intent"));
  const attemptId = Number(formData.get("attemptId"));
  const supabase = createClient(
    process.env.SUPABASE_URL!, 
    process.env.SUPABASE_ANON_KEY!
  );
  if (intent === "delete") {
    // 1. Delete Multiple Choice Records
    await supabase.from("student_choice_multiple_record").delete().eq("attempt_id", attemptId);
    
    // 2. Delete Essay Records
    await supabase.from("student_essay_question_record").delete().eq("attempt_id", attemptId);

    // 3. Delete Question Records (Scores/Feedback)
    await supabase.from("student_question_record").delete().eq("attempt_id", attemptId);

    // 4. Delete the Main Quiz Record (Parent)
    const { error } = await supabase.from("student_quiz_record").delete().eq("attempt_id", attemptId);

    if (error) {
        return json({ success: false, error: error.message });
    }

    // Redirect to the main grading list (remove query params)
    return redirect(`/quiz/${params.quizID}/grading`);
  }
  const questionId = Number(formData.get("questionId"));
  const newGrade = Number(formData.get("grade"));
  const feedback = String(formData.get("feedback") || "");

  // Calls the service we wrote earlier to Update, Re-Sum, and Clamp
  await updateEssayGrade(attemptId, questionId, newGrade, feedback);

  return json({ success: true });
};

// --- COMPONENT ---
export default function GradingConsole() {
  const { quiz, attemptsList, selectedData, selectedAttemptId } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();
  const navigation = useNavigation();

  // Track which question ID shows a warning
  const [warningQId, setWarningQId] = useState<number | null>(null);

  // Handle Input Logic (Enforce Max Score)
  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>, max: number, qId: number) => {
    const val = parseFloat(e.target.value);
    if (val > max) {
      e.target.value = String(max);
      setWarningQId(qId);
      setTimeout(() => setWarningQId(null), 2000);
    }
  };

  // Helper to handle auto-saving on blur
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, 
    qId: number, 
    originalGrade: number, 
    originalFeedback: string
  ) => {
    const form = e.currentTarget.closest("form");
    if (!form) return;
    submit(form, { replace: true, preventScrollReset: true }); 
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
      
      {/* --- LEFT SIDEBAR: STUDENT LIST --- */}
      <div className="w-80 bg-white border-r flex flex-col shrink-0">
        <div className="p-4 border-b bg-gray-50/50">
            <h2 className="font-bold text-gray-900 truncate">{quiz?.title}</h2>
            <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500 uppercase">Grading Queue</p>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    {attemptsList?.length || 0}
                </span>
            </div>
        </div>
        
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {(attemptsList || []).map((att: any) => {
            const isActive = String(att.attempt_id) === selectedAttemptId;
            const studentName = att.student?.student_name || "Unknown";

            return (
                <div
                key={att.attempt_id}
                className={`group flex items-start p-3 rounded-lg border transition-all relative ${
                    isActive 
                    ? "bg-blue-50 border-blue-500 shadow-sm ring-1 ring-blue-500 z-10" 
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
                >
                {/* 1. SELECT BUTTON (Invisible Overlay or just the main text area) */}
                <button
                    onClick={() => setSearchParams({ attemptId: String(att.attempt_id) })}
                    className="flex-1 text-left min-w-0"
                >
                    <div className="flex justify-between items-start mb-1">
                    <div className="flex flex-col overflow-hidden mr-2">
                        <span className="font-bold text-gray-800 truncate text-sm">
                        {studentName}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono mt-0.5">
                        ID: {att.student_id}
                        </span>
                    </div>
                    
                    {/* Grade Pill */}
                    <span className={`text-xs font-mono px-2 py-0.5 rounded shrink-0 ${
                        Number(att.grade) >= (quiz?.grade || 0) * 0.8 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                        {Number(att.grade).toFixed(1)}
                    </span>
                    </div>
                    
                    <div className="text-[10px] text-gray-400 mt-1">
                    {new Date(att.submitted_at).toLocaleDateString()}
                    </div>
                </button>

                {/* 2. DELETE BUTTON (Appears on Hover) */}
                <Form 
                    method="post" 
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100"
                    onSubmit={(e) => {
                    if(!confirm(`Delete submission for ${studentName}?`)) {
                        e.preventDefault();
                    }
                    }}
                >
                    <input type="hidden" name="attemptId" value={att.attempt_id} />
                    <button 
                        type="submit" 
                        name="intent" 
                        value="delete"
                        title="Delete Submission"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                    {/* Trash Icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    </button>
                </Form>
                </div>
            );
            })}
        </div>
        </div>

      {/* --- RIGHT PANEL: GRADING INTERFACE --- */}
      <div className="flex-1 overflow-y-auto p-8">
        {!selectedData ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <span className="text-4xl mb-4">⬅️</span>
            <p>Select a student from the sidebar to begin grading.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8 pb-20">
            
            {/* --- HEADER --- */}
            <div className="flex justify-between items-end border-b pb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {selectedData.attempt.student?.student_name || "Unknown"}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                {/* ... existing ID badges ... */}
                </div>
            </div>

            <div className="flex flex-col items-end gap-2">
                {/* SCORE DISPLAY */}
                <div>
                <span className="block text-xs text-gray-500 uppercase font-bold tracking-wider text-right">Total Score</span>
                <span className="text-4xl font-extrabold text-blue-600">
                    {Number(selectedData.attempt.grade).toFixed(1)} 
                    <span className="text-xl text-gray-300 font-medium"> / {quiz?.grade}</span>
                </span>
                </div>

                {/* --- NEW DELETE BUTTON --- */}
                <Form 
                method="post" 
                onSubmit={(event) => {
                    if (!confirm("Are you sure you want to PERMANENTLY delete this student's submission? This cannot be undone.")) {
                    event.preventDefault();
                    }
                }}
                >
                <input type="hidden" name="attemptId" value={selectedData.attempt.attempt_id} />
                <button 
                    type="submit" 
                    name="intent" 
                    value="delete"
                    className="text-xs text-red-500 hover:text-red-700 hover:underline font-semibold mt-1"
                >
                    🗑 Delete Submission
                </button>
                </Form>
            </div>
            </div>
            {/* --- QUESTIONS LOOP --- */}
            {selectedData.questions.map((q: any, index: number) => {
              const savedQ = selectedData.savedAnswers.find((s: any) => s.question_id === q.question_id);
              const essayAns = selectedData.essayContent.find((e: any) => e.question_id === q.question_id);
              const mcAns = selectedData.mcContent.find((m: any) => m.question_id === q.question_id);
              
              const isEssay = q.is_multiple_choice === false;
              const currentScore = savedQ?.grade || 0;

              return (
                <div key={`${q.question_id}-${selectedAttemptId}`} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  
                  {/* Question Header */}
                  <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">Question {index + 1}: </span>
                        {!isEssay && <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">Multiple Choice</span>}
                      </div>
                      <span className="text-xs font-bold text-gray-400 uppercase">Max: {q.grade} pts</span>
                  </div>
                  
                  {/* Question Content */}
                  <div className="prose prose-sm text-gray-800 mb-6 max-w-none" dangerouslySetInnerHTML={{ __html: q.html_content }} />

                  {/* Student Answer Area */}
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 mb-6">
                    <span className="text-xs font-bold text-gray-400 uppercase block mb-3">Student Answer</span>
                    
                    {isEssay ? (
                      <div className="prose prose-sm bg-white p-3 rounded border border-gray-200 min-h-[60px]" 
                           dangerouslySetInnerHTML={{ __html: essayAns?.html_content || "<em class='text-gray-400'>No answer provided.</em>" }} 
                      />
                    ) : (
                      <div className="space-y-2">
                          {q.choice_multiple_question.map((c: any) => {
                           const isSelected = mcAns?.choice_id === c.choice_id;
                           return (
                             <div key={c.choice_id} className={`flex items-center gap-3 p-3 rounded-md border ${
                               isSelected 
                                ? (c.is_correct ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900") 
                                : "bg-white border-transparent opacity-60 hover:opacity-100"
                             }`}>
                                <div className="text-lg leading-none">
                                  {isSelected ? (c.is_correct ? "✅" : "❌") : <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>}
                                </div>
                                <span dangerouslySetInnerHTML={{__html: c.html_content }} />
                             </div>
                           )
                          })}
                      </div>
                    )}
                  </div>

                  {/* GRADING FORM */}
                  <Form method="post" className="flex flex-col sm:flex-row gap-4 items-start bg-blue-50/40 p-5 rounded-lg border border-blue-100/50">
                    <input type="hidden" name="attemptId" value={selectedData.attempt.attempt_id} />
                    <input type="hidden" name="questionId" value={q.question_id} />
                    
                    {/* Grade Input Section */}
                    <div className="w-full sm:w-32 shrink-0 relative"> 
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Score </label>
                      <input 
                        type="number" 
                        step="0.1"
                        name="grade"
                        defaultValue={currentScore}
                        max={q.grade} 
                        onChange={(e) => handleScoreChange(e, q.grade, q.question_id)}
                        onBlur={(e) => handleBlur(e, q.question_id, currentScore, savedQ?.feedback)}
                        className={`w-full text-lg p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 text-center font-mono font-bold transition-colors
                          ${warningQId === q.question_id ? "border-red-500 bg-red-50 text-red-700" : "border-gray-300 bg-white"}
                        `}
                      />
                      {warningQId === q.question_id && (
                        <div className="absolute top-full mt-1 left-0 w-full z-10 text-center">
                           <span className="inline-block bg-red-600 text-white text-[10px] px-2 py-1 rounded shadow animate-pulse">
                             Max {q.grade}!
                           </span>
                        </div>
                      )}
                    </div>

                    {/* Feedback Input */}
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Feedback </label>
                      <textarea 
                        name="feedback"
                        rows={2}
                        defaultValue={savedQ?.feedback || ""}
                        placeholder="Add feedback for the student..."
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm resize-none"
                        onBlur={(e) => handleBlur(e, q.question_id, currentScore, savedQ?.feedback)}
                      />
                    </div>
                  </Form>
                  
                  <div className="mt-2 text-right">
                    <span className="text-[10px] text-gray-400 italic">
                      {navigation.state === "submitting" ? "Saving..." : "Changes auto-save on click away"}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}