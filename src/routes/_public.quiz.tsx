// src/routes/_public.quiz.tsx
import { Outlet } from "@remix-run/react";

export default function QuizLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <header className="mb-8 text-center">
        <h1 className="text-xl font-bold text-gray-500">My Quiz App</h1>
      </header>
      
      {/* CRITICAL: The <Outlet /> is where $quizID.tsx will render.
        Without this, the child route never appears.
      */}
      <main className="w-full max-w-3xl bg-white shadow-lg rounded-lg">
        <Outlet />
      </main>
    </div>
  );
}

// Add an ErrorBoundary here to catch 404s or DB errors from the child
import { isRouteErrorResponse, useRouteError } from "@remix-run/react";

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div className="p-10 text-center text-red-600">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      {isRouteErrorResponse(error) ? <p>{error.statusText}</p> : <p>Unknown Error</p>}
    </div>
  );
}