/**
 * Example usage of QuizConfirmationDialog component
 * 
 * This file demonstrates how to use the QuizConfirmationDialog component
 * in your course page or wherever quizzes are displayed.
 */

import { useState } from "react";
import QuizConfirmationDialog from "./QuizConfirmationDialog";

// Example component showing how to use QuizConfirmationDialog
export function QuizListExample() {
  const [selectedQuiz, setSelectedQuiz] = useState<{
    quizId: string;
    quizName: string;
    answerType: "free_response" | "multiple_choice";
    hasFile?: boolean;
    publishTime?: {
      date: string;
      hour: string;
      minute: string;
      second: string;
    };
    duration?: {
      date: string;
      hour: string;
      minute: string;
      second: string;
    };
    timeLimit?: {
      hour: string;
      minute: string;
      second: string;
    };
  } | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Example quiz data
  const quizzes = [
    {
      quizId: "quiz1",
      quizName: "Quiz 1",
      answerType: "free_response" as const,
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
    },
    {
      quizId: "quiz2",
      quizName: "Quiz 2",
      answerType: "multiple_choice" as const,
      hasFile: false,
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
        minute: "45",
        second: "00",
      },
    },
    {
      quizId: "quiz3",
      quizName: "Quiz 3",
      answerType: "multiple_choice" as const,
      hasFile: true,
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
        minute: "50",
        second: "00",
      },
    },
  ];

  const handleQuizClick = (quiz: typeof quizzes[0]) => {
    setSelectedQuiz(quiz);
    setShowDialog(true);
  };

  return (
    <div>
      <h2>Quizzes</h2>
      <ul>
        {quizzes.map((quiz) => (
          <li key={quiz.quizId}>
            <button onClick={() => handleQuizClick(quiz)}>
              {quiz.quizName} - {quiz.answerType === "free_response" ? "Free Response" : "Multiple Choice"}
            </button>
          </li>
        ))}
      </ul>

      {selectedQuiz && (
        <QuizConfirmationDialog
          isOpen={showDialog}
          onClose={() => {
            setShowDialog(false);
            setSelectedQuiz(null);
          }}
          quiz={selectedQuiz}
          sectionId="test-course-123"
          userFlag={1}
          language="en"
        />
      )}
    </div>
  );
}
