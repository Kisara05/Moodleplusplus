import { useLoaderData, useNavigate, Form } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { useState, lazy, Suspense } from "react";
import { getSectionById } from "~/services/course.server";
import { getQuizById } from "~/services/quiz.server";
import { submitQuizAnswers } from "~/services/submit.server";

const Editor = lazy(() => import("~/components/common/Editor.client"));

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
    
    return json({
      signed_in,
      user_flag,
      language,
      sectionId,
      section,
      quizId,
      quiz,
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
      error: error instanceof Error ? error.message : "Failed to load quiz",
    });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const quizId = formData.get("quizId") as string;
  const userId = formData.get("userId") as string || "123"; // TODO: Get from session
  const answer = formData.get("answer") as string;
  
  try {
    await submitQuizAnswers(userId, quizId, [{
      questionId: quizId,
      answer: answer,
    }]);
    
    const sectionId = params.courseID;
    return redirect(`/courses/${sectionId}?signed_in=1&user_flag=1`);
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}

export default function TakeQuizFreeResponse() {
  const { signed_in, user_flag, language, sectionId, section, quizId, quiz } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "vi">(language);
  const [answer, setAnswer] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Mock quiz data - replace with actual data from backend
  const textDescription = quiz?.textDescription || "What is the value of the v?";
  const fileUrl = quiz?.fileUrl || "/sample-file.pdf"; // File uploaded by teacher

  const handleDownloadFile = () => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileUrl.split("/").pop() || "quiz-file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = () => {
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
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
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
    minHeight: "100px",
    position: "relative",
  };

  const answerBoxContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
  };

  const answerBoxStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  };

  const answerLabelStyle: React.CSSProperties = {
    fontSize: "1rem",
    fontWeight: "500",
    color: "#2C8B85",
    marginBottom: "0.5rem",
  };

  const downloadBoxStyle: React.CSSProperties = {
    width: "200px",
    padding: "1rem",
    border: "2px solid #D9D9D9",
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    height: "fit-content",
  };

  const downloadIconStyle: React.CSSProperties = {
    fontSize: "2rem",
    color: "#FF0000",
    marginBottom: "0.5rem",
  };

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

        {/* Question Box with Download */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", alignItems: "flex-start" }}>
          <div style={{ ...questionBoxStyle, flex: 1 }}>
            {textDescription}
          </div>
          <div
            style={downloadBoxStyle}
            onClick={handleDownloadFile}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F5F5F5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
          >
            <div style={downloadIconStyle}>📄</div>
            <div style={{ fontSize: "0.8rem", color: "#565656", textAlign: "center" }}>
              {fileUrl.split("/").pop() || "Download file"}
            </div>
          </div>
        </div>

        {/* Answer Box */}
        <div style={answerBoxContainerStyle}>
          <div style={answerBoxStyle}>
            <label style={answerLabelStyle}>
              {currentLanguage === "en" ? "Your answer" : "Câu trả lời của bạn"}
            </label>
            <Suspense fallback={<div style={{ padding: "2rem", border: "2px solid #D9D9D9", borderRadius: "8px", minHeight: "200px" }}>Loading editor...</div>}>
              <Editor value={answer} onChange={setAnswer} />
            </Suspense>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={buttonContainerStyle}>
          <Form method="post" id="quiz-form">
            <input type="hidden" name="quizId" value={quizId} />
            <input type="hidden" name="answer" value={answer} />
            <button type="button" style={submitButtonStyle} onClick={handleSubmit}>
              {currentLanguage === "en" ? "Submit" : "Nộp bài"}
            </button>
          </Form>
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
                ? "Are you sure you want to submit this quiz? You cannot change your answer after submitting."
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
