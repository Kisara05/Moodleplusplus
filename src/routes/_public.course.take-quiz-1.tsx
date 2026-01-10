import { useLoaderData, useNavigate, Form } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { useState } from "react";
import { getSectionById } from "~/services/course.server";
import { getQuizById, getQuizQuestions } from "~/services/quiz.server";
import { submitQuizAnswers } from "~/services/submit.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const signed_in = url.searchParams.get("signed_in") === "1";
  const user_flag = parseInt(url.searchParams.get("user_flag") || "1"); // Student flag
  const language = (url.searchParams.get("lang") as "en" | "vi") || "en";
  const sectionId = params.courseID;
  const quizId = url.searchParams.get("quizId") || "";

  if (!signed_in) {
    throw new Response(null, {
      status: 302,
      headers: { Location: "/login" },
    });
  }

  try {
    const section = await getSectionById(sectionId || "");
    const quiz = await getQuizById(quizId);
    const questions = await getQuizQuestions(quizId);
    
    return json({
      signed_in,
      user_flag,
      language,
      sectionId,
      section,
      quizId,
      quiz,
      questions,
    });
  } catch (error) {
    console.error("Error loading quiz data:", error);
    return json({
      signed_in,
      user_flag,
      language,
      sectionId,
      section: null,
      quizId,
      quiz: null,
      questions: [],
      error: error instanceof Error ? error.message : "Failed to load quiz",
    });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const quizId = formData.get("quizId") as string;
  const userId = formData.get("userId") as string || "123"; // TODO: Get from session
  const answersJson = formData.get("answers") as string;
  
  try {
    const answers = JSON.parse(answersJson);
    await submitQuizAnswers(userId, quizId, answers);
    
    const sectionId = params.courseID;
    return redirect(`/courses/${sectionId}?signed_in=1&user_flag=1`);
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}

interface QuestionAnswer {
  questionId: string;
  selectedAnswer: number | null;
}

export default function TakeQuiz1() {
  const { signed_in, user_flag, language, sectionId, section, quizId, quiz, questions } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "vi">(language);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Mock questions data - replace with actual data from backend
  const mockQuestions = quiz?.questions || Array.from({ length: 25 }, (_, i) => ({
    questionId: `q${i + 1}`,
    textDescription: i === 0 ? "What is the value of the v?" : `Question ${i + 1} text description`,
    imageDescription: i === 0 ? null : null, // URL or base64
    choices: [
      "Abhdkjfknsksj",
      "Mk iuv úhjsnksjan",
      "Hbdhgisdkj óa djvjncj",
      "Hla ksoji hfjidfhkdsj"
    ],
  }));

  const [answers, setAnswers] = useState<QuestionAnswer[]>(() => 
    mockQuestions.map(q => ({ questionId: q.questionId, selectedAnswer: null }))
  );

  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleChoiceSelect = (choiceIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex].selectedAnswer = choiceIndex;
    setAnswers(newAnswers);
  };

  const getQuestionStatus = (index: number): "current" | "answered" | "unanswered" => {
    if (index === currentQuestionIndex) return "current";
    if (answers[index].selectedAnswer !== null) return "answered";
    return "unanswered";
  };

  const handleSubmit = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = () => {
    // Submit form
    const form = document.getElementById("quiz-form") as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: "2rem",
    maxWidth: "1400px",
    margin: "0 auto",
    width: "100%",
    display: "flex",
    gap: "2rem",
  };

  const leftPanelStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  };

  const rightPanelStyle: React.CSSProperties = {
    width: "300px",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: "2rem",
    alignSelf: "flex-start",
    maxHeight: "calc(100vh - 4rem)",
    overflowY: "auto",
  };

  const filterBarStyle: React.CSSProperties = {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  };

  const filterButtonStyle: React.CSSProperties = {
    backgroundColor: "#D9D9D9",
    borderRadius: "25px",
    padding: "0.5rem 1rem",
    border: "none",
    fontSize: "0.9rem",
    color: "#000000",
    fontWeight: "500",
  };

  const activeFilterButtonStyle: React.CSSProperties = {
    ...filterButtonStyle,
    backgroundColor: "#0A853F",
    color: "#FFFFFF",
  };

  const courseTitleStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#2C8B85",
    marginBottom: "0.5rem",
  };

  const quizTitleStyle: React.CSSProperties = {
    fontSize: "1rem",
    color: "#2C8B85",
    marginBottom: "2rem",
  };

  const questionBoxStyle: React.CSSProperties = {
    width: "100%",
    padding: "1.5rem",
    border: "2px solid #D9D9D9",
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    marginBottom: "1rem",
    minHeight: "200px",
  };

  const imageBoxStyle: React.CSSProperties = {
    width: "100%",
    padding: "1.5rem",
    border: "2px solid #D9D9D9",
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    marginBottom: "1rem",
    minHeight: "300px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const choicesContainerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "2rem",
  };

  const choiceButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: "1rem",
    fontSize: "1rem",
    border: isSelected ? "2px solid #0A853F" : "2px solid #D9D9D9",
    borderRadius: "8px",
    backgroundColor: isSelected ? "#0A853F" : "#FFFFFF",
    color: isSelected ? "#FFFFFF" : "#000000",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
  });

  const buttonContainerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    marginTop: "2rem",
  };

  const submitButtonStyle: React.CSSProperties = {
    padding: "0.75rem 2rem",
    backgroundColor: "#2C8B85",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
  };

  const cancelButtonStyle: React.CSSProperties = {
    padding: "0.75rem 2rem",
    backgroundColor: "#FFFFFF",
    color: "#000000",
    border: "2px solid #D9D9D9",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
  };

  const miniBoardStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "0.5rem",
    padding: "1rem",
    backgroundColor: "#F5F5F5",
    borderRadius: "8px",
    width: "100%",
  };

  const miniBoardItemStyle = (status: "current" | "answered" | "unanswered"): React.CSSProperties => ({
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    backgroundColor: status === "current" ? "#0A853F" : status === "answered" ? "#D9D9D9" : "#FFFFFF",
    color: status === "current" ? "#FFFFFF" : "#000000",
    border: status === "current" ? "2px solid #0A853F" : "2px solid #D9D9D9",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
  });

  const dialogOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const dialogStyle: React.CSSProperties = {
    backgroundColor: "#FFFFFF",
    padding: "2rem",
    borderRadius: "8px",
    maxWidth: "400px",
    width: "90%",
  };

  const dialogButtonStyle: React.CSSProperties = {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#2C8B85",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "1rem",
  };

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  return (
    <div style={containerStyle}>
      <Header
        signed_in={signed_in}
        user_flag={user_flag}
        language={currentLanguage}
        onLanguageChange={() => setCurrentLanguage(currentLanguage === "en" ? "vi" : "en")}
        userId="123"
      />
      <main style={mainStyle}>
        <div style={leftPanelStyle}>
          {/* Filter Bar */}
          <div style={filterBarStyle}>
            <button style={activeFilterButtonStyle}>2025 - 2026</button>
            <button style={activeFilterButtonStyle}>Semester 1</button>
            <button style={filterButtonStyle}>Advanced Program (APCS)</button>
          </div>

          {/* Course Title */}
          <h1 style={courseTitleStyle}>
            {section?.course?.course_name || "Element of Software Engineering"} - {section?.class_name || "23TT1"}
          </h1>
          <p style={quizTitleStyle}>
            {quiz?.quizName || "Quiz 1"} {currentLanguage === "en" ? "in In-class assignments" : "trong Bài tập trên lớp"}
          </p>

          {/* Text Description Box */}
          <div style={questionBoxStyle}>
            {currentQuestion.textDescription || (currentLanguage === "en" ? "Question text description" : "Mô tả câu hỏi")}
          </div>

          {/* Image Description Box - Only show if image exists */}
          {currentQuestion.imageDescription && (
            <div style={imageBoxStyle}>
              <img 
                src={currentQuestion.imageDescription} 
                alt="Question image" 
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            </div>
          )}

          {/* Choices */}
          <div style={choicesContainerStyle}>
            {currentQuestion.choices.map((choice, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleChoiceSelect(index)}
                style={choiceButtonStyle(currentAnswer.selectedAnswer === index)}
              >
                {String.fromCharCode(65 + index)}. {choice}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={buttonContainerStyle}>
            <Form method="post" id="quiz-form">
              <input type="hidden" name="quizId" value={quizId} />
              <input type="hidden" name="answers" value={JSON.stringify(answers)} />
              <button type="button" style={submitButtonStyle} onClick={handleSubmit}>
                {currentLanguage === "en" ? "Submit" : "Nộp bài"}
              </button>
            </Form>
          </div>
        </div>

        {/* Mini Board */}
        <div style={rightPanelStyle}>
          <div style={miniBoardStyle}>
            {mockQuestions.map((_, index) => (
              <div
                key={index}
                style={miniBoardItemStyle(getQuestionStatus(index))}
                onClick={() => handleQuestionClick(index)}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div style={dialogOverlayStyle} onClick={() => setShowConfirmDialog(false)}>
          <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>
              {currentLanguage === "en" ? "Confirm Submit" : "Xác nhận nộp bài"}
            </h3>
            <p>
              {currentLanguage === "en"
                ? "Are you sure you want to submit this quiz? You cannot change your answers after submitting."
                : "Bạn có chắc chắn muốn nộp bài này? Bạn không thể thay đổi câu trả lời sau khi nộp."}
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button style={dialogButtonStyle} onClick={handleConfirmSubmit}>
                {currentLanguage === "en" ? "Yes, Submit" : "Có, nộp bài"}
              </button>
              <button
                style={{ ...dialogButtonStyle, backgroundColor: "#D9D9D9", color: "#000000" }}
                onClick={() => setShowConfirmDialog(false)}
              >
                {currentLanguage === "en" ? "Cancel" : "Hủy"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer language={currentLanguage} />
    </div>
  );
}
