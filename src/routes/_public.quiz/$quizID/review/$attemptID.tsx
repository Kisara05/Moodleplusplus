// app/routes/_public.quiz.$quizID.review.$attemptID.tsx
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useParams, Link } from "@remix-run/react";
import { getAttemptReview } from "~/services/quiz.server";

const TEST_STUDENT_ID = "ST006";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const quizId = Number(params.quizID);
  const attemptId = Number(params.attemptID);

  const data = await getAttemptReview(quizId, attemptId, TEST_STUDENT_ID);

  if (!data) {
    // If try to view someone else's attempt, kick them out
    return redirect(`/quiz/${quizId}`);
  }

  return json(data);
};

export default function QuizReviewPage() {
  const { attempt, quiz, answers, grades } = useLoaderData<typeof loader>();
  const params = useParams();
  const quizId = params.quizID;
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      
      {/* HEADER: Summary */}
        <div className="flex items-center justify-between border-b pb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Review: {quiz?.title}</h1>
            <p className="text-gray-500">
            Submitted on {new Date(attempt.submitted_at).toLocaleDateString()}
            </p>
        </div>
        <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
            {/* 1. Student's Actual Score */}
            {Number(attempt.grade).toFixed(1)} 
            
            {/* 2. FIX: Use quiz.grade as the denominator */}
            <span className="text-lg text-gray-400">
                /{quiz?.grade || 10}
            </span>
            </div>
            <p className="text-sm font-medium text-gray-500 uppercase">Final Score</p>
        </div>
        </div>

      {/* QUESTIONS LIST */}
      <div className="space-y-12">
        {quiz?.question.map((q: any, index: number) => {
          // 1. Find the Grade for this question
          const qGrade = grades.find((g: any) => g.question_id === q.question_id);
          const score = qGrade?.grade || 0;
          const maxScore = q.grade || 0;
          
          // Is it fully correct? (Full points awarded)
          const isCorrect = score === maxScore;
          const isPartial = score > 0 && score < maxScore;

          // 2. Find Student's Answer
          const myMcAnswer = answers.mc.find((a: any) => a.question_id === q.question_id);
          const myEssayAnswer = answers.essay.find((a: any) => a.question_id === q.question_id);

          return (
            <div key={q.question_id} className={`p-6 rounded-xl border-2 ${
              isCorrect ? "border-green-100 bg-green-50/30" : 
              isPartial ? "border-yellow-100 bg-yellow-50/30" : "border-red-100 bg-red-50/30"
            }`}>
              
              {/* Question Header */}
              <div className="flex justify-between mb-4">
                <span className="font-bold text-gray-700">Question {index + 1}: </span>
                <span className={`font-mono font-bold ${
                  isCorrect ? "text-green-600" : isPartial ? "text-yellow-600" : "text-red-600"
                }`}>
                  {score} / {maxScore} pts
                </span>
              </div>
              
              {/* Question Text */}
              <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: q.html_content }} />

              {/* RENDER CHOICES (Read Only) */}
              {q.is_multiple_choice ? (
                <div className="space-y-3">
                    {q.choice_multiple_question.map((choice: any) => {
                    const isSelected = myMcAnswer?.choice_id === choice.choice_id;
                    const isActuallyCorrect = choice.is_correct; 

                    // Determine styling
                    let styleClass = "border-gray-200 bg-white"; 
                    let icon = null;

                    if (isSelected && isActuallyCorrect) {
                        styleClass = "border-green-500 bg-green-50 ring-1 ring-green-500"; 
                        icon = "✅";
                    } else if (isSelected && !isActuallyCorrect) {
                        styleClass = "border-red-500 bg-red-50 ring-1 ring-red-500"; 
                        icon = "❌";
                    } else if (!isSelected && isActuallyCorrect) {
                        styleClass = "border-green-200 bg-green-50/50 border-dashed"; 
                        icon = "💡"; 
                    }

                    return (
                        <div 
                        key={choice.choice_id} 
                        className={`group flex items-center justify-between p-4 rounded-lg border ${styleClass}`}
                        >
                        {/* LEFT SIDE: Radio + Text Wrapper */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            
                            {/* Fake Radio Button (Fixed Size) */}
                            <div className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center transition-colors
                            ${isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300"}
                            `}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            
                            {/* Text Content */}
                            {/* [&_*]:m-0 strips margins from <p> tags inside the HTML content */}
                            <div 
                            className="text-gray-800 break-words [&_*]:m-0" 
                            dangerouslySetInnerHTML={{ __html: choice.html_content + " " + (icon || "") }} 
                            />
                        </div>
                        </div>
                    );
                    })}
                </div>
              ) : (
                // ESSAY REVIEW
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase mb-1">Your Answer</p>
                    <div className="prose text-sm" dangerouslySetInnerHTML={{ __html: myEssayAnswer?.html_content || "(No Answer)" }} />
                  </div>
                </div>
              )}
              
              {/* TEACHER FEEDBACK (If any) */}
              {qGrade?.feedback && (
                <div className="mt-6 bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100 flex gap-3">
                  <div>
                     <strong className="block font-semibold">💬 Teacher Feedback: </strong>
                     {qGrade.feedback}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-8">
        <Link 
          to={`/quiz/${quizId}`}
          className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}