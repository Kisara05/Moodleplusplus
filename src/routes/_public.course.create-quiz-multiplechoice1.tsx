import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { useState, useRef } from "react";
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
  textDescription: string;
  imageFile: File | null;
  imagePreview: string | null;
  choices: string[];
  correctAnswer: number | null;
}

export default function CreateQuizMultipleChoice1() {
  const { signed_in, user_flag, language, sectionId, section } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "vi">(language);
  const [numQuestions, setNumQuestions] = useState(25);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswerMode, setIsAnswerMode] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showNumQuestionsDialog, setShowNumQuestionsDialog] = useState(false);
  const [tempNumQuestions, setTempNumQuestions] = useState(25);
  const [questions, setQuestions] = useState<Question[]>(() => {
    const initial: Question[] = [];
    for (let i = 0; i < 25; i++) {
      initial.push({
        textDescription: "",
        imageFile: null,
        imagePreview: null,
        choices: ["", "", "", ""],
        correctAnswer: null,
      });
    }
    return initial;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            textDescription: "",
            imageFile: null,
            imagePreview: null,
            choices: ["", "", "", ""],
            correctAnswer: null,
          });
        }
      }
      setQuestions(newQuestions);
    } else if (newNum < oldNum) {
      // Remove questions (keep existing data)
      setQuestions(questions.slice(0, newNum));
      if (currentQuestionIndex >= newNum) {
        setCurrentQuestionIndex(newNum - 1);
      }
    }
  };

  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index);
    setIsAnswerMode(false);
  };

  const handleChoiceChange = (choiceIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[currentQuestionIndex].choices[choiceIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerClick = () => {
    setIsAnswerMode(!isAnswerMode);
  };

  const handleChoiceSelect = (choiceIndex: number) => {
    if (isAnswerMode) {
      const newQuestions = [...questions];
      newQuestions[currentQuestionIndex].correctAnswer = choiceIndex;
      setQuestions(newQuestions);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newQuestions = [...questions];
      newQuestions[currentQuestionIndex].imageFile = file;
      const reader = new FileReader();
      reader.onloadend = () => {
        newQuestions[currentQuestionIndex].imagePreview = reader.result as string;
        setQuestions(newQuestions);
      };
      reader.readAsDataURL(file);
    }
  };

  const isQuestionComplete = (index: number): boolean => {
    const q = questions[index];
    return (
      q.textDescription.trim() !== "" &&
      q.choices.every(c => c.trim() !== "") &&
      q.correctAnswer !== null
    );
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
    navigate(`/courses/${sectionId}?signed_in=1&user_flag=${user_flag}`);
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
    minWidth: "200px",
    width: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
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
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const numQuestionsContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2rem",
  };

  const numQuestionsInputStyle: React.CSSProperties = {
    width: "80px",
    padding: "0.5rem",
    fontSize: "1rem",
    border: "2px solid #D9D9D9",
    borderRadius: "8px",
    textAlign: "center",
  };

  const gearIconStyle: React.CSSProperties = {
    cursor: "pointer",
    fontSize: "1.5rem",
    color: "#2C8B85",
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: "1.5rem",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "1rem",
    fontWeight: "500",
    color: "#000000",
    marginBottom: "0.5rem",
  };

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "2px solid #D9D9D9",
    borderRadius: "8px",
    outline: "none",
    minHeight: "120px",
    resize: "vertical",
    fontFamily: "inherit",
  };

  const imageUploadContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start",
  };

  const imageUploadBoxStyle: React.CSSProperties = {
    width: "200px",
    height: "200px",
    border: "2px solid #2C8B85",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    backgroundColor: "#FFFFFF",
    position: "relative",
  };

  const imagePreviewStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "6px",
  };

  const answersSectionStyle: React.CSSProperties = {
    marginTop: "2rem",
  };

  const answersHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1rem",
  };

  const correctAnswerBoxStyle: React.CSSProperties = {
    width: "24px",
    height: "24px",
    border: isAnswerMode ? "2px solid #0A853F" : "2px solid #0A853F",
    backgroundColor: isAnswerMode ? "#0A853F" : "#FFFFFF",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const choicesContainerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  };

  const choiceInputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "2px solid #D9D9D9",
    borderRadius: "8px",
    outline: "none",
    fontFamily: "inherit",
  };

  const choiceButtonStyle = (isSelected: boolean, isAnswerMode: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    border: isSelected ? "2px solid #0A853F" : "2px solid #D9D9D9",
    borderRadius: "8px",
    backgroundColor: isSelected ? "#0A853F" : "#FFFFFF",
    color: isSelected ? "#FFFFFF" : "#000000",
    cursor: isAnswerMode ? "pointer" : "default",
    textAlign: "left",
    fontFamily: "inherit",
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

  // Calculate number of columns based on question count
  const getMiniBoardColumns = (): number => {
    if (numQuestions <= 5) return numQuestions;
    if (numQuestions <= 10) return 5;
    if (numQuestions <= 15) return 5;
    if (numQuestions <= 20) return 5;
    if (numQuestions <= 25) return 5;
    return Math.ceil(Math.sqrt(numQuestions)); // For larger numbers, use square root
  };

  const miniBoardStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${getMiniBoardColumns()}, 1fr)`,
    gap: "0.5rem",
    padding: "1rem",
    backgroundColor: "#F5F5F5",
    borderRadius: "8px",
    width: "100%",
  };

  const miniBoardItemStyle = (isCurrent: boolean, isComplete: boolean): React.CSSProperties => ({
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    backgroundColor: isCurrent ? "#0A853F" : isComplete ? "#D9D9D9" : "#FFFFFF",
    color: isCurrent ? "#FFFFFF" : "#000000",
    border: isCurrent ? "2px solid #0A853F" : "2px solid #D9D9D9",
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

  const currentQuestion = questions[currentQuestionIndex];

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
          <div style={pageSubtitleStyle}>
            <span>
              {currentLanguage === "en" ? "Creating Quiz in In-class assignments" : "Tạo Quiz trong Bài tập trên lớp"}
            </span>
            <span style={gearIconStyle} onClick={() => {
              setTempNumQuestions(numQuestions);
              setShowNumQuestionsDialog(true);
            }}>
              ⚙️
            </span>
          </div>

          {/* Number of Questions */}
          <div style={numQuestionsContainerStyle}>
            <label style={labelStyle}>
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

          {/* Text Description */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>
              {currentLanguage === "en" ? "Text description" : "Mô tả văn bản"}
            </label>
            <textarea
              value={currentQuestion.textDescription}
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[currentQuestionIndex].textDescription = e.target.value;
                setQuestions(newQuestions);
              }}
              style={textareaStyle}
              placeholder={currentLanguage === "en" ? "Enter text description..." : "Nhập mô tả văn bản..."}
            />
          </div>

          {/* Image Upload */}
          <div style={formGroupStyle}>
            <label style={labelStyle}>
              {currentLanguage === "en" ? "Image" : "Hình ảnh"}
            </label>
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={imageUploadBoxStyle}
                onClick={() => fileInputRef.current?.click()}
              >
                {currentQuestion.imagePreview ? (
                  <img src={currentQuestion.imagePreview} alt="Preview" style={imagePreviewStyle} />
                ) : (
                  <>
                    <div style={{ fontSize: "2rem", color: "#2C8B85" }}>+</div>
                    <div style={{ color: "#2C8B85", marginTop: "0.5rem" }}>
                      {currentLanguage === "en" ? "Add" : "Thêm"}
                    </div>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* Answers Section */}
          <div style={answersSectionStyle}>
            <div style={answersHeaderStyle}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold" }}>
                {currentLanguage === "en" ? "Answers" : "Câu trả lời"}
              </h3>
              <div style={correctAnswerBoxStyle} onClick={handleCorrectAnswerClick} />
              <span style={{ fontSize: "0.9rem", color: "#565656" }}>
                {currentLanguage === "en" ? "Correct answer" : "Câu trả lời đúng"}
              </span>
            </div>

            {isAnswerMode ? (
              <div style={choicesContainerStyle}>
                {currentQuestion.choices.map((choice, index) => (
                  <button
                    key={index}
                    style={choiceButtonStyle(currentQuestion.correctAnswer === index, true)}
                    onClick={() => handleChoiceSelect(index)}
                  >
                    {String.fromCharCode(65 + index)}. {choice || `Choice ${String.fromCharCode(65 + index)}`}
                  </button>
                ))}
              </div>
            ) : (
              <div style={choicesContainerStyle}>
                {currentQuestion.choices.map((choice, index) => (
                  <input
                    key={index}
                    type="text"
                    value={choice}
                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                    style={choiceInputStyle}
                    placeholder={`${currentLanguage === "en" ? "Insert" : "Nhập"} ${String.fromCharCode(65 + index)} ${currentLanguage === "en" ? "choice here" : "lựa chọn"}`}
                  />
                ))}
              </div>
            )}
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
        </div>

        {/* Mini Board */}
        <div style={rightPanelStyle}>
          <div style={miniBoardStyle}>
            {Array.from({ length: numQuestions }, (_, i) => (
              <div
                key={i}
                style={miniBoardItemStyle(i === currentQuestionIndex, isQuestionComplete(i))}
                onClick={() => handleQuestionClick(i)}
              >
                {i + 1}
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

      {/* Number of Questions Dialog */}
      {showNumQuestionsDialog && (
        <div style={dialogOverlayStyle} onClick={() => setShowNumQuestionsDialog(false)}>
          <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>
              {currentLanguage === "en" ? "Change Number of Questions" : "Thay đổi số câu hỏi"}
            </h3>
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>
                {currentLanguage === "en" ? "Number of questions" : "Số câu hỏi"}
              </label>
              <input
                type="number"
                value={tempNumQuestions}
                onChange={(e) => {
                  const num = parseInt(e.target.value);
                  if (!isNaN(num) && num > 0) {
                    setTempNumQuestions(num);
                  }
                }}
                style={numQuestionsInputStyle}
                min="1"
                autoFocus
              />
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                style={dialogButtonStyle}
                onClick={() => {
                  handleNumQuestionsChange(tempNumQuestions);
                  setShowNumQuestionsDialog(false);
                }}
              >
                {currentLanguage === "en" ? "OK" : "Đồng ý"}
              </button>
              <button
                style={{ ...dialogButtonStyle, backgroundColor: "#D9D9D9", color: "#000000" }}
                onClick={() => setShowNumQuestionsDialog(false)}
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
