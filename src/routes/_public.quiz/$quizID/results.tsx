// app/routes/_public.quiz.$quizID.results.tsx
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getStudentAttempt, getQuizById } from "~/services/quiz.server";

// Hardcoded for Phase 4
const TEST_STUDENT_ID = "ST006";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const quizId = Number(params.quizID);
  
  // 1. Fetch ALL attempts (ordered by newest first)
  const attempt = await getStudentAttempt(quizId, TEST_STUDENT_ID);
  const quiz = await getQuizById(quizId);

  if (!quiz) throw new Response("Quiz Not Found", { status: 404 });

  // 2. If no attempts exist, redirect to start screen
  if (!attempt || attempt.length === 0) {
    return redirect(`/quiz/${quizId}`);
  }

  return json({ attempt, quiz });
};

export default function QuizResults() {
  const { attempt, quiz } = useLoaderData<typeof loader>();
  
  return (
    <div className="max-w-xl mx-auto p-12 text-center space-y-8">
       {/* Simple Success Message */}
       <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl">
         ✅
       </div>
       
       <h1 className="text-2xl font-bold text-gray-900">Submission Received</h1>
       <p className="text-gray-600">
         Your score: <strong className="text-gray-900">{attempt.grade} / {quiz.grade}</strong>
       </p>

       {/* Button sends them back to the Start Screen (Dashboard) */}
       <Link 
         to={`/quiz/${quiz.quiz_id}`}
         className="inline-block w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
       >
         Return to Quiz Dashboard
       </Link>
    </div>
  );
}