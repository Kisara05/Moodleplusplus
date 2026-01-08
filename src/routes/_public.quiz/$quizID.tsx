// app/routes/_public.quiz.$quizID.tsx
import { useState, useEffect, Suspense, lazy } from "react";
import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit, Form, Link} from "@remix-run/react";
import { getQuizById, getStudentAttempts, createAttempt, submitQuizAttempt} from "~/services/quiz.server"; 

const ClientEditor = lazy(() => import("~/components/common/Editor.client"));

// 1. HARDCODED ID FOR PHASE 1 TESTING
const TEST_STUDENT_ID = "ST006";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const quizId = Number(params.quizID);
  const formData = await request.formData();
  
  // 1. Check if this is a "Submit Answers" request
  const answersJson = formData.get("answers");

  if (answersJson) {
    const answers = JSON.parse(answersJson as string);
    try {
      await submitQuizAttempt(quizId, TEST_STUDENT_ID, answers);
      return redirect(`/quiz/${quizId}/results`);
    } catch (error) {
      console.error("Submission Failed:", error);
      return json({ error: "Failed to submit quiz" }, { status: 500 });
    }
  }

  // --- HANDLE START QUIZ REQUEST ---

  // 2. SECURITY CHECK: Fetch Quiz to verify Deadline
  const quiz = await getQuizById(quizId);

  if (!quiz) {
    throw new Response("Quiz Not Found", { status: 404 });
  }

  const now = new Date();
  if (quiz.open_time) {
    const openTime = new Date(quiz.open_time);
    if (now < openTime) {
      return json({ error: "Quiz has not started yet" }, { status: 403 });
    }
  }

  // 3. DEADLINE ENFORCEMENT
  if (quiz.deadline) {
    const deadlineDate = new Date(quiz.deadline);
    if (now > deadlineDate) {
      return json({ error: "Quiz is overdue" }, { status: 403 });
    }
  }

  // 4. ATTEMPT LIMIT ENFORCEMENT (Optional check here)

  // 5. If safe, PROCEED to create attempt
  await createAttempt(quizId, TEST_STUDENT_ID);
  
  return json({ success: true });
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const quizId = Number(params.quizID);
  
  // 1. Fetch Quiz & History
  const quiz = await getQuizById(quizId);
  if (!quiz) throw new Response("Not Found", { status: 404 });
  
  const attempts = await getStudentAttempts(quizId, TEST_STUDENT_ID);

  // 2. Check for ACTIVE attempt (Resume logic)
  const activeAttempt = attempts?.find((a) => a.submitted_at === null);
  
  // --- NEW LOGIC: Calculate Deadline & Effective Time ---
  const deadlineTime = quiz.deadline ? new Date(quiz.deadline).getTime() : 8640000000000; // Far future if null
  const now = Date.now();

  // 3. Timer logic for ACTIVE Attempt (Resume)
  let expireTime = null;
  
  if (activeAttempt) {
    const startTime = new Date(activeAttempt.started_at).getTime();
    
    // Standard duration (if 0/null, treat as infinite/deadline only)
    const limitInMs = (quiz.time_limit || 999999) * 1000; 
    const theoreticalExpire = startTime + limitInMs;

    // RULE: Expire at duration OR deadline, whichever is FIRST
    expireTime = Math.min(theoreticalExpire, deadlineTime);
  }

  // 4. Preview Logic for NEW Attempt (Start Screen)
  // How much time will they get if they click start NOW?
  const secondsToDeadline = Math.max(0, (deadlineTime - now) / 1000);
  
  const effectiveTimeLimit = quiz.time_limit 
    ? Math.min(quiz.time_limit, secondsToDeadline)
    : secondsToDeadline;

  // Return everything needed for the Dashboard
  return json({ 
    quiz, 
    attempt: activeAttempt || null, 
    pastAttempts: attempts || [],    
    expireTime,          // For the active timer
    effectiveTimeLimit,  // For the start screen preview
    serverTime: now
  });
};

function QuizTimer({ expireTime, onTimeUp }: { expireTime: number | null, onTimeUp: () => void }) {
  const [timeLeft, setTimeLeft] = useState<string>("--:--");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!expireTime) return;

    const interval = setInterval(() => {
      const now = Date.now(); // Note: Ideally sync with serverTime, but Date.now() is usually close enough
      const diff = expireTime - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft("00:00:00");
        onTimeUp(); 
      } else {
        const totalSeconds = Math.floor(diff / 1000);
        const d = Math.floor(totalSeconds / (3600 * 24));
        const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        const timeChunk = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        const finalString = d > 0 ? `${d}d ${timeChunk}` : timeChunk;

        setTimeLeft(finalString);
        if (diff < 300000) setIsUrgent(true); // Red alert if < 5 mins
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expireTime, onTimeUp]);

  if (!expireTime) return null;

  return (
    <div className={`fixed bottom-24 right-6 px-5 py-3 rounded-full shadow-xl font-mono text-xl font-bold border-2 z-50 ${
      isUrgent ? "bg-red-50 border-red-500 text-red-600 animate-pulse" : "bg-white border-blue-600 text-blue-800"
    }`}>
      ⏳ {timeLeft}
    </div>
  );
}

export default function QuizIdPage() {
  const submit = useSubmit();
  // Get effectiveTimeLimit from loader
  const { quiz, attempt, pastAttempts, expireTime, effectiveTimeLimit } = useLoaderData<typeof loader>();
  
  const [selections, setSelections] = useState<Record<number, number | string>>({});
  const [isClient, setIsClient] = useState(false);

  // Autosave: Load
  useEffect(() => {
    setIsClient(true);
    if (attempt) {
      const savedKey = `quiz_draft_${attempt.attempt_id}`;
      const savedData = localStorage.getItem(savedKey);
      if (savedData) {
        try {
          setSelections(JSON.parse(savedData));
        } catch (e) {
          console.error("Failed to parse draft");
        }
      }
    }
  }, [attempt]);

  // Autosave: Save
  const handleAnswerChange = (questionId: number, val: number | string) => {
    setSelections((prev) => {
      const next = { ...prev, [questionId]: val };
      if (attempt) {
        localStorage.setItem(`quiz_draft_${attempt.attempt_id}`, JSON.stringify(next));
      }
      return next;
    });
  };

  const finalSubmit = () => {
    if (attempt) localStorage.removeItem(`quiz_draft_${attempt.attempt_id}`);
    const formData = new FormData();
    formData.append("answers", JSON.stringify(selections));
    submit(formData, { method: "post" });
  };

  // Helper to format seconds nicely
  const formatTimeLimit = (seconds: number) => {
    if (!seconds) return "None";
    if (seconds > 31536000) return "Unlimited"; // Simple check for huge numbers
    
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0) parts.push(`${s}s`);

    return parts.join(' ') || "0s";
  };

// --- VIEW 1: THE QUIZ DASHBOARD (START SCREEN) ---
  if (!attempt) {
    const attemptCount = pastAttempts.length;
    const maxAttempts = quiz.attempt_limit || 0;
    const now = new Date();
    const openTime = quiz.open_time ? new Date(quiz.open_time) : null;
    const deadline = quiz.deadline ? new Date(quiz.deadline) : null;
    const isUpcoming = openTime ? now < openTime : false;
    const isOverdue = deadline ? now > deadline : false;
    const isLimitReached = maxAttempts > 0 && attemptCount >= maxAttempts;
    
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-12">
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
          
          {/* Conditional Description Display */}
          {quiz.display_description && quiz.description && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-blue-900 text-left max-w-2xl mx-auto">
                <p className="whitespace-pre-wrap">{quiz.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6 border-t border-b border-gray-100 my-6">
            
            {/* 1. Open/Close Time */}
            <div className="text-center md:border-r border-gray-100">
              <span className="text-sm text-gray-500 uppercase tracking-wide block mb-1">Schedule</span>
              <div className="text-sm">
                <p><span className="text-gray-500">Opens:</span> {openTime ? openTime.toLocaleString() : "Now"}</p>
                <p className={`${isOverdue ? "text-red-600 font-bold" : ""}`}>
                  <span className="text-gray-500">Closes:</span> {deadline ? deadline.toLocaleString() : "Never"}
                </p>
              </div>
            </div>

            {/* 2. Attempts */}
            <div className="text-center md:border-r border-gray-100">
               <span className="text-sm text-gray-500 uppercase tracking-wide block mb-1">Attempts: </span>
               <span className={`text-2xl font-bold ${isLimitReached ? "text-red-600" : "text-gray-900"}`}>
                 {attemptCount} <span className="text-gray-400 text-lg">/ {maxAttempts || "∞"}</span>
               </span>
            </div>

            {/* 3. Time Limit (FIXED: Showing Initial/Standard Limit) */}
            <div className="text-center">
                <span className="text-sm text-gray-500 uppercase tracking-wide block mb-1">Time Limit: </span>
                <span className="text-2xl font-bold text-gray-900 block">
                  {/* Using quiz.time_limit directly instead of effectiveTimeLimit */}
                  {formatTimeLimit(quiz.time_limit || 0)}
                </span>
            </div>
          </div>

          <div className="flex justify-center">
            {isUpcoming ? (
            <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-lg p-5 flex flex-col items-center justify-center gap-2 text-gray-600">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔒</span>
                <span className="font-bold text-lg">Quiz is locked</span>
              </div>
              <p className="text-sm">
                Opens on <span className="font-semibold text-gray-900">{openTime?.toLocaleString()}</span>
              </p>
            </div>

            ) : isOverdue ? (
              <div className="w-full max-w-md bg-orange-50 border border-orange-200 rounded-lg p-5 flex flex-col items-center justify-center gap-2 text-orange-800">
                <span className="font-bold text-lg">The quiz is overdue</span>
                <p className="text-sm text-orange-700">Closed on {deadline?.toLocaleString()}</p>
              </div>
            ) : isLimitReached ? (
              <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-center gap-3 text-red-800">
                <span className="font-semibold">You have used all attempts!</span>
              </div>
            ) : (
              <Form method="post" className="w-full max-w-md">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold py-4 rounded-lg shadow-md transition-all">
                  {attemptCount > 0 ? "Start New Attempt" : "Start Quiz Now"}
                </button>
              </Form>
            )}
          </div>
        </div>

        {/* Previous Attempts Table */}
        {pastAttempts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Previous Attempts</h2>
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Attempt</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Grade</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pastAttempts.map((past, index) => {
                    const attemptNum = pastAttempts.length - index; 
                    const score = past.grade || 0;
                    const isPass = (score / (quiz.grade || 10)) >= 0.5;

                    return (
                      <tr key={past.attempt_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">#{attemptNum}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {past.submitted_at ? new Date(past.submitted_at).toLocaleDateString() : <span className="italic text-blue-600">In Progress</span>}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          {past.submitted_at ? <span>{Number(score).toFixed(1)} <span className="text-gray-400">/ {quiz.grade || 10}</span></span> : "-"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {past.submitted_at ? (
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${isPass ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {isPass ? "Passed" : "Failed"}
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-xs font-medium">Ongoing</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          {past.submitted_at ? (
                            <Link to={`/quiz/${quiz.quiz_id}/review/${past.attempt_id}`} className="text-blue-600 hover:underline">Review</Link>
                          ) : (
                            <Link to={`/quiz/${quiz.quiz_id}`} className="text-blue-600 hover:underline">Continue</Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW 2: THE ACTIVE QUIZ ---
  return (
    <div className="max-w-3xl mx-auto p-6 pb-32"> 
      
      {/* Header Badge */}
      <div className="flex flex-col gap-4 mb-8 border-b pb-4">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm">Attempt #{attempt.attempt_id}</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                ● In Progress
                </span>
            </div>
        </div>

        {/* --- LOGIC: Show Description in Active Mode too (Optional) --- */}
        {quiz.display_description && quiz.description && (
             <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 border border-gray-200">
                {quiz.description}
             </div>
        )}
      </div>
      
      <div className="space-y-12">
        {quiz.question.map((q, index) => {
          const isEssay = q.is_multiple_choice === false;

          return (
            <div key={q.question_id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              
              {/* --- MODIFIED SECTION START --- */}
              <div className="flex gap-4 mb-6">
                {/* 1. Question Number Bubble */}
                <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm h-fit mt-1">
                  {index + 1}
                </span>
                
                {/* 2. Content Wrapper (Text + Image) */}
                <div className="w-full space-y-4">
                  
                  {/* A. Question Text */}
                  <div 
                    className="prose text-gray-800 text-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: q.html_content }} 
                  />

                  {/* B. Question Image (New) */}
                  {q.image_url && (
                    <div className="mt-3">
                      <img 
                        src={q.image_url} 
                        alt={`Question ${index + 1} Reference`}
                        className="max-w-full h-auto max-h-[500px] rounded-lg border border-gray-200 shadow-sm object-contain"
                        loading="lazy" 
                      />
                    </div>
                  )}
                </div>
              </div>
              {/* --- MODIFIED SECTION END --- */}
              
              <div className="ml-12">
                {isEssay ? (
                  <div className="border rounded-lg bg-white overflow-hidden">
                    {isClient ? (
                      <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse" />}>
                        <ClientEditor 
                          value={selections[q.question_id] ? String(selections[q.question_id]) : ""} 
                          onChange={(val) => handleAnswerChange(q.question_id, val)}
                        />
                      </Suspense>
                    ) : (
                      <div className="h-64 bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                        Loading Editor...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {q.choice_multiple_question?.length > 0 ? (
                      q.choice_multiple_question.map((choice) => {
                        const isSelected = selections[q.question_id] === choice.choice_id;
                        return (
                          <button 
                            key={choice.choice_id}
                            onClick={() => handleAnswerChange(q.question_id, choice.choice_id)}
                            className={`w-full text-left p-4 rounded-lg border transition-all flex items-start gap-3 group
                              ${isSelected 
                                ? "bg-blue-50 border-blue-500 shadow-sm ring-1 ring-blue-500" 
                                : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-gray-50"
                              }
                            `}
                          >
                            <span className={isSelected ? "text-blue-600" : "text-gray-400"}>
                              {isSelected ? "✅" : "○"}
                            </span>
                            <span dangerouslySetInnerHTML={{ __html: choice.html_content }} />
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-gray-400 italic text-sm">No options available.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <QuizTimer expireTime={expireTime} onTimeUp={finalSubmit} />

      <div className="mt-12 pt-6 border-t border-gray-200 sticky bottom-0 bg-gray-50 p-4 -mx-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40">
         <button 
           onClick={finalSubmit}
           className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg"
         >
           Submit Quiz
         </button>
      </div>
    </div>
  );
}