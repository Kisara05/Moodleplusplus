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
  selectedAnswer: number | null; // Single choice per question
}

export default function TakeQuiz2() {
  const { signed_in, user_flag, language, sectionId, section, quizId, quiz, questions } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "vi">(language);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [fileZoom, setFileZoom] = useState(100);
  
  // Mock questions data - replace with actual data from backend
  const mockQuestions = quiz?.questions || Array.from({ length: 25 }, (_, i) => ({
    questionId: `q${i + 1}`,
    fileUrl: "/sample-file.pdf", // URL to the uploaded file
  }));

  const [answers, setAnswers] = useState<QuestionAnswer[]>(() => 
    mockQuestions.map(q => ({ questionId: q.questionId, selectedAnswer: null }))
  );

  const handleChoiceSelect = (questionIndex: number, choiceIndex: number) => {
    const newAnswers = [...answers];
    // If clicking the same choice, deselect it; otherwise select the new choice
    if (newAnswers[questionIndex].selectedAnswer === choiceIndex) {
      newAnswers[questionIndex].selectedAnswer = null;
    } else {
      newAnswers[questionIndex].selectedAnswer = choiceIndex;
    }
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = () => {
    // Convert answers to backend format
    const formattedAnswers = answers.map(ans => ({
      questionId: ans.questionId,
      answer: ans.selectedAnswer !== null ? ans.selectedAnswer : null,
    }));
    
    // Update hidden input
    const form = document.getElementById("quiz-form") as HTMLFormElement;
    const answersInput = form?.querySelector('input[name="answers"]') as HTMLInputElement;
    if (answersInput) {
      answersInput.value = JSON.stringify(formattedAnswers);
    }
    
    if (form) {
      form.requestSubmit();
    }
  };

  const handleZoomIn = () => {
    setFileZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setFileZoom(prev => Math.max(prev - 10, 50));
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
    width: "500px",
    display: "flex",
    flexDirection: "column",
    height: "600px", // Match left panel height
    overflowY: "auto",
    overflowX: "hidden",
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

  const fileViewerStyle: React.CSSProperties = {
    width: "100%",
    height: "600px",
    border: "2px solid #D9D9D9",
    borderRadius: "8px",
    backgroundColor: "#D9D9D9", // Gray box as per requirement
    marginBottom: "1rem",
    overflow: "auto",
    position: "relative",
  };

  const fileControlsStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1rem",
    alignItems: "center",
  };

  const controlButtonStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    backgroundColor: "#2C8B85",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.9rem",
    cursor: "pointer",
  };

  const tableWrapperStyle: React.CSSProperties = {
    width: "100%",
    maxHeight: "100%",
    overflowY: "auto",
    overflowX: "hidden",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
  };

  const tableHeaderStyle: React.CSSProperties = {
    backgroundColor: "#F5F5F5",
    padding: "1rem",
    textAlign: "left",
    fontWeight: "bold",
    fontSize: "1rem",
    color: "#000000",
    borderBottom: "2px solid #D9D9D9",
  };

  const tableCellStyle: React.CSSProperties = {
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #F0F0F0",
    textAlign: "center",
  };

  const questionIndexCellStyle: React.CSSProperties = {
    ...tableCellStyle,
    fontWeight: "500",
    color: "#000000",
    textAlign: "left",
  };

  const choiceButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: isSelected ? "2px solid #0A853F" : "2px solid #D9D9D9",
    backgroundColor: isSelected ? "#0A853F" : "#FFFFFF",
    color: isSelected ? "#FFFFFF" : "#000000",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
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

          {/* File Viewer */}
          <div style={fileControlsStyle}>
            <button type="button" style={controlButtonStyle} onClick={handleZoomIn}>
              {currentLanguage === "en" ? "Zoom In" : "Phóng to"}
            </button>
            <button type="button" style={controlButtonStyle} onClick={handleZoomOut}>
              {currentLanguage === "en" ? "Zoom Out" : "Thu nhỏ"}
            </button>
            <span style={{ marginLeft: "1rem", color: "#565656" }}>
              {fileZoom}%
            </span>
          </div>
          <div style={fileViewerStyle}>
            <iframe
              src={mockQuestions[0]?.fileUrl || "/sample-file.pdf"}
              style={{
                width: `${fileZoom}%`,
                height: "100%",
                border: "none",
              }}
              title="Quiz file"
            />
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

        {/* Right Panel - Question and Choices Table */}
        <div style={rightPanelStyle}>
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead style={{ position: "sticky", top: 0, backgroundColor: "#F5F5F5", zIndex: 10 }}>
                <tr>
                  <th style={tableHeaderStyle}>{currentLanguage === "en" ? "Question" : "Câu hỏi"}</th>
                  <th style={tableHeaderStyle}>A</th>
                  <th style={tableHeaderStyle}>B</th>
                  <th style={tableHeaderStyle}>C</th>
                  <th style={tableHeaderStyle}>D</th>
                </tr>
              </thead>
              <tbody>
                {mockQuestions.map((question, questionIndex) => (
                  <tr key={questionIndex}>
                    <td style={questionIndexCellStyle}>
                      {questionIndex + 1}
                    </td>
                    <td style={tableCellStyle}>
                      <button
                        type="button"
                        onClick={() => handleChoiceSelect(questionIndex, 0)}
                        style={choiceButtonStyle(answers[questionIndex].selectedAnswer === 0)}
                      >
                        A
                      </button>
                    </td>
                    <td style={tableCellStyle}>
                      <button
                        type="button"
                        onClick={() => handleChoiceSelect(questionIndex, 1)}
                        style={choiceButtonStyle(answers[questionIndex].selectedAnswer === 1)}
                      >
                        B
                      </button>
                    </td>
                    <td style={tableCellStyle}>
                      <button
                        type="button"
                        onClick={() => handleChoiceSelect(questionIndex, 2)}
                        style={choiceButtonStyle(answers[questionIndex].selectedAnswer === 2)}
                      >
                        C
                      </button>
                    </td>
                    <td style={tableCellStyle}>
                      <button
                        type="button"
                        onClick={() => handleChoiceSelect(questionIndex, 3)}
                        style={choiceButtonStyle(answers[questionIndex].selectedAnswer === 3)}
                      >
                        D
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
