import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { useState } from "react";
import { getSectionById } from "~/services/course.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const signed_in = url.searchParams.get("signed_in") === "1";
  const user_flag = parseInt(url.searchParams.get("user_flag") || "0");
  const language = (url.searchParams.get("lang") as "en" | "vi") || "en";
  const sectionId = params.courseID;

  if (!signed_in) {
    throw new Response(null, {
      status: 302,
      headers: { Location: "/login" },
    });
  }

  try {
    const section = await getSectionById(sectionId || "");
    return json({
      signed_in,
      user_flag,
      language,
      sectionId,
      section,
    });
  } catch (error) {
    console.error("Error loading section data:", error);
    return json({
      signed_in,
      user_flag,
      language,
      sectionId,
      section: null,
    });
  }
}

interface Question {
  choices: string[];
  correctAnswer: number | null;
}

export default function CreateQuizMultipleChoice2() {
  const { signed_in, user_flag, language, sectionId, section } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "vi">(language);
  const [numQuestions, setNumQuestions] = useState(25);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(() => {
    const initial: Question[] = [];
    for (let i = 0; i < 25; i++) {
      initial.push({
        choices: ["", "", "", ""],
        correctAnswer: null,
      });
    }
    return initial;
  });

  const handleNumQuestionsChange = (newNum: number) => {
    if (newNum < 1) return;
    const oldNum = numQuestions;
    setNumQuestions(newNum);
    
    // Update questions array
    if (newNum > oldNum) {
      // Add new questions
      const newQuestions: Question[] = [];
      for (let i = 0; i < newNum; i++) {
        if (i < oldNum) {
          newQuestions.push(questions[i]);
        } else {
          newQuestions.push({
            choices: ["", "", "", ""],
            correctAnswer: null,
          });
        }
      }
      setQuestions(newQuestions);
    } else if (newNum < oldNum) {
      // Remove questions (keep existing data)
      setQuestions(questions.slice(0, newNum));
    }
  };

  const handleAddChoice = (questionIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].choices.length < 10) {
      newQuestions[questionIndex].choices.push("");
      setQuestions(newQuestions);
    }
  };

  const handleRemoveChoice = (questionIndex: number) => {
    const newQuestions = [...questions];
    const currentChoices = newQuestions[questionIndex].choices;
    if (currentChoices.length > 2) {
      const lastIndex = currentChoices.length - 1;
      // If removing the correct answer, reset it
      if (newQuestions[questionIndex].correctAnswer === lastIndex) {
        newQuestions[questionIndex].correctAnswer = null;
      } else if (newQuestions[questionIndex].correctAnswer !== null && 
                 newQuestions[questionIndex].correctAnswer > lastIndex) {
        // If correct answer index is beyond the last index, adjust it
        newQuestions[questionIndex].correctAnswer = null;
      }
      newQuestions[questionIndex].choices.pop();
      setQuestions(newQuestions);
    }
  };

  const handleChoiceChange = (questionIndex: number, choiceIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].choices[choiceIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerSelect = (questionIndex: number, choiceIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswer = choiceIndex;
    setQuestions(newQuestions);
  };

  const isQuestionComplete = (index: number): boolean => {
    const q = questions[index];
    // For multiplechoice2, choices are static labels (A, B, C, D, etc.)
    // Need at least 2 choices and correct answer selected
    return q.choices.length >= 2 && q.correctAnswer !== null;
  };

  const allQuestionsComplete = (): boolean => {
    return questions.every((_, index) => isQuestionComplete(index));
  };

  const handleSave = () => {
    if (!allQuestionsComplete()) {
      setShowErrorDialog(true);
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = () => {
    // TODO: Save to backend
    setShowConfirmDialog(false);
    navigate(`/courses/${sectionId}?signed_in=1&user_flag=${user_flag}`);
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    navigate(`/courses/${sectionId}?signed_in=1&user_flag=${user_flag}`);
  };

  const getChoiceLabel = (index: number): string => {
    return String.fromCharCode(65 + index);
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

  const pageSubtitleStyle: React.CSSProperties = {
    fontSize: "1rem",
    color: "#2C8B85",
    marginBottom: "2rem",
  };

  const numQuestionsContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2rem",
  };

  const numQuestionsInputStyle: React.CSSProperties = {
    width: "100px",
    padding: "0.5rem",
    fontSize: "1rem",
    border: "2px solid #D9D9D9",
    borderRadius: "8px",
    textAlign: "center",
  };

  const questionsListStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    marginBottom: "2rem",
  };

  const questionItemStyle: React.CSSProperties = {
    padding: "1.5rem",
    border: "1px solid #D9D9D9",
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
  };

  const questionHeaderStyle: React.CSSProperties = {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#2C8B85",
    marginBottom: "1rem",
  };

  const choicesRowStyle: React.CSSProperties = {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    marginBottom: "1rem",
    flexWrap: "wrap",
  };

  const choiceBoxStyle = (isSelected: boolean): React.CSSProperties => ({
    flex: "1",
    minWidth: "150px",
    padding: "0.75rem",
    fontSize: "1rem",
    border: isSelected ? "2px solid #0A853F" : "2px solid #D9D9D9",
    borderRadius: "25px",
    fontFamily: "inherit",
    backgroundColor: isSelected ? "#0A853F" : "#FFFFFF",
    color: isSelected ? "#FFFFFF" : "#000000",
    cursor: "pointer",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "500",
  });

  const addChoiceButtonStyle = (disabled: boolean): React.CSSProperties => ({
    padding: "0.75rem 1rem",
    backgroundColor: "#FFFFFF",
    color: disabled ? "#999" : "#2C8B85",
    border: `2px solid ${disabled ? "#D9D9D9" : "#2C8B85"}`,
    borderRadius: "25px",
    fontSize: "0.9rem",
    fontWeight: "500",
    cursor: disabled ? "not-allowed" : "pointer",
    whiteSpace: "nowrap",
    minWidth: "fit-content",
    opacity: disabled ? 0.6 : 1,
  });

  const removeChoiceButtonStyle = (disabled: boolean): React.CSSProperties => ({
    padding: "0.75rem 1rem",
    backgroundColor: disabled ? "#D9D9D9" : "#FF6B35",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "25px",
    fontSize: "0.9rem",
    fontWeight: "500",
    cursor: disabled ? "not-allowed" : "pointer",
    whiteSpace: "nowrap",
    minWidth: "fit-content",
    opacity: disabled ? 0.6 : 1,
    marginLeft: "0.5rem",
  });

  const buttonContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: "1rem",
    marginTop: "2rem",
  };

  const saveButtonStyle: React.CSSProperties = {
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
        <p style={pageSubtitleStyle}>
          {currentLanguage === "en" ? "Creating Quiz in In-class assignments" : "Tạo Quiz trong Bài tập trên lớp"}
        </p>

        {/* Number of Questions */}
        <div style={numQuestionsContainerStyle}>
          <label style={{ fontSize: "1rem", fontWeight: "500", color: "#000000" }}>
            {currentLanguage === "en" ? "Number of questions" : "Số câu hỏi"}
          </label>
          <input
            type="number"
            value={numQuestions}
            onChange={(e) => {
              const num = parseInt(e.target.value);
              if (!isNaN(num) && num > 0) {
                handleNumQuestionsChange(num);
              }
            }}
            style={numQuestionsInputStyle}
            min="1"
          />
        </div>

        {/* Questions List */}
        <div style={questionsListStyle}>
          {questions.map((question, questionIndex) => (
            <div key={questionIndex} style={questionItemStyle}>
              <div style={questionHeaderStyle}>
                {currentLanguage === "en" ? "Question" : "Câu hỏi"} {questionIndex + 1}
              </div>
              
              <div style={choicesRowStyle}>
                {question.choices.slice(0, 4).map((choice, choiceIndex) => (
                  <div
                    key={choiceIndex}
                    onClick={() => handleCorrectAnswerSelect(questionIndex, choiceIndex)}
                    style={choiceBoxStyle(question.correctAnswer === choiceIndex)}
                  >
                    {getChoiceLabel(choiceIndex)}
                  </div>
                ))}
                {question.choices.length > 4 && (
                  <>
                    {question.choices.slice(4).map((choice, choiceIndex) => (
                      <div
                        key={choiceIndex + 4}
                        onClick={() => handleCorrectAnswerSelect(questionIndex, choiceIndex + 4)}
                        style={choiceBoxStyle(question.correctAnswer === choiceIndex + 4)}
                      >
                        {getChoiceLabel(choiceIndex + 4)}
                      </div>
                    ))}
                  </>
                )}
                <button
                  style={addChoiceButtonStyle(question.choices.length >= 10)}
                  onClick={() => handleAddChoice(questionIndex)}
                  disabled={question.choices.length >= 10}
                >
                  {currentLanguage === "en" ? "Add more choices" : "Thêm lựa chọn"}
                </button>
                <button
                  style={removeChoiceButtonStyle(question.choices.length <= 2)}
                  onClick={() => handleRemoveChoice(questionIndex)}
                  disabled={question.choices.length <= 2}
                >
                  {currentLanguage === "en" ? "Remove a choice" : "Xóa lựa chọn"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={buttonContainerStyle}>
          <button style={saveButtonStyle} onClick={handleSave}>
            {currentLanguage === "en" ? "Save and return to course" : "Lưu và quay lại khóa học"}
          </button>
          <button style={cancelButtonStyle} onClick={handleCancel}>
            {currentLanguage === "en" ? "Cancel" : "Hủy"}
          </button>
        </div>
      </main>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div style={dialogOverlayStyle} onClick={() => setShowConfirmDialog(false)}>
          <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>
              {currentLanguage === "en" ? "Confirm Save" : "Xác nhận lưu"}
            </h3>
            <p>
              {currentLanguage === "en"
                ? "Are you sure you want to save and return to the course?"
                : "Bạn có chắc chắn muốn lưu và quay lại khóa học?"}
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button style={dialogButtonStyle} onClick={handleConfirmSave}>
                {currentLanguage === "en" ? "Yes" : "Có"}
              </button>
              <button
                style={{ ...dialogButtonStyle, backgroundColor: "#D9D9D9", color: "#000000" }}
                onClick={() => setShowConfirmDialog(false)}
              >
                {currentLanguage === "en" ? "No" : "Không"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Dialog */}
      {showErrorDialog && (
        <div style={dialogOverlayStyle} onClick={() => setShowErrorDialog(false)}>
          <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: "#FF0000" }}>
              {currentLanguage === "en" ? "Error" : "Lỗi"}
            </h3>
            <p>
              {currentLanguage === "en"
                ? "You have not finished all the questions."
                : "Bạn chưa hoàn thành tất cả các câu hỏi."}
            </p>
            <button style={dialogButtonStyle} onClick={() => setShowErrorDialog(false)}>
              {currentLanguage === "en" ? "OK" : "Đồng ý"}
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div style={dialogOverlayStyle} onClick={() => setShowCancelDialog(false)}>
          <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>
              {currentLanguage === "en" ? "Confirm Cancel" : "Xác nhận hủy"}
            </h3>
            <p>
              {currentLanguage === "en"
                ? "Are you sure you want to cancel? All unsaved changes will be lost."
                : "Bạn có chắc chắn muốn hủy? Tất cả thay đổi chưa lưu sẽ bị mất."}
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button style={dialogButtonStyle} onClick={handleConfirmCancel}>
                {currentLanguage === "en" ? "Yes, Cancel" : "Có, hủy"}
              </button>
              <button
                style={{ ...dialogButtonStyle, backgroundColor: "#D9D9D9", color: "#000000" }}
                onClick={() => setShowCancelDialog(false)}
              >
                {currentLanguage === "en" ? "No" : "Không"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer language={currentLanguage} />
    </div>
  );
}