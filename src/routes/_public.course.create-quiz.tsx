import { Form, useLoaderData, useActionData, useNavigate, useParams } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { useState, useRef } from "react";
import { getSectionById } from "~/services/course.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const signed_in = url.searchParams.get("signed_in") === "1";
  const user_flag = parseInt(url.searchParams.get("user_flag") || "0");
  const language = (url.searchParams.get("lang") as "en" | "vi") || "en";
  const quizId = url.searchParams.get("quizId"); // For editing existing quiz
  const sectionId = params.courseID;

  if (!signed_in) {
    throw new Response(null, {
      status: 302,
      headers: { Location: "/login" },
    });
  }

  // Only teachers/admins can create quizzes
  if (user_flag !== 0) {
    throw new Response(null, {
      status: 302,
      headers: { Location: `/?signed_in=1&user_flag=${user_flag}` },
    });
  }

  try {
    const section = await getSectionById(sectionId || "");
    
    // TODO: If quizId exists, load quiz data from backend
    // const quiz = quizId ? await getQuizById(quizId) : null;

    return json({
      signed_in,
      user_flag,
      language,
      sectionId,
      section,
      quizId,
      // quiz: quiz || null,
    });
  } catch (error) {
    console.error("Error loading quiz data:", error);
    return json({
      signed_in,
      user_flag,
      language,
      sectionId,
      section: null,
      quizId: null,
      error: error instanceof Error ? error.message : "Failed to load data",
    });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const quizName = formData.get("quizName") as string;
  const description = formData.get("description") as string;
  const displayDescription = formData.get("displayDescription") === "on";
  const answerType = formData.get("answerType") as string; // "free_response" or "multiple_choice"
  const selectFiles = formData.get("selectFiles") as string; // "yes" or "no"
  const publishDate = formData.get("publishDate") as string;
  const publishHour = formData.get("publishHour") as string;
  const publishMinute = formData.get("publishMinute") as string;
  const publishSecond = formData.get("publishSecond") as string;
  const durationDate = formData.get("durationDate") as string;
  const durationHour = formData.get("durationHour") as string;
  const durationMinute = formData.get("durationMinute") as string;
  const durationSecond = formData.get("durationSecond") as string;
  const setTimeLimit = formData.get("setTimeLimit") === "on";
  const timeLimitHour = formData.get("timeLimitHour") as string;
  const timeLimitMinute = formData.get("timeLimitMinute") as string;
  const timeLimitSecond = formData.get("timeLimitSecond") as string;
  const sectionId = params.courseID;
  const quizId = formData.get("quizId") as string | null;

  // TODO: Save quiz data to backend
  // const result = quizId 
  //   ? await updateQuiz({ quizId, ...quizData })
  //   : await createQuiz({ ...quizData, sectionId });

  // For now, just return the data structure for backend implementation
  const quizData = {
    quizName,
    description,
    displayDescription,
    answerType,
    selectFiles,
    publishTime: {
      date: publishDate,
      hour: publishHour,
      minute: publishMinute,
      second: publishSecond,
    },
    duration: {
      date: durationDate,
      hour: durationHour,
      minute: durationMinute,
      second: durationSecond,
    },
    timeLimit: setTimeLimit ? {
      hour: timeLimitHour,
      minute: timeLimitMinute,
      second: timeLimitSecond,
    } : null,
    sectionId,
    quizId,
  };

  // Determine navigation based on answer type and file selection
  const answerFlag = answerType === "multiple_choice" ? 1 : 0;
  const uploadFileFlag = selectFiles === "yes" ? 1 : 0;

  if (answerFlag === 0) {
    // Free response - return to main screen
    return redirect(`/?signed_in=1&user_flag=0`);
  } else {
    // Multiple choice
    if (uploadFileFlag === 0) {
      return redirect(`/courses/${sectionId}/create-quiz-multiplechoice1?signed_in=1&user_flag=0`);
    } else {
      return redirect(`/courses/${sectionId}/create-quiz-multiplechoice2?signed_in=1&user_flag=0`);
    }
  }
}

export default function CreateQuiz() {
  const {
    signed_in,
    user_flag,
    language,
    section,
    quizId,
    sectionId,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const params = useParams();
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "vi">(language);
  const [generalExpanded, setGeneralExpanded] = useState(true);
  const [commonExpanded, setCommonExpanded] = useState(true);
  const [answerType, setAnswerType] = useState<"free_response" | "multiple_choice">("free_response");
  const [selectFiles, setSelectFiles] = useState<"yes" | "no">("no");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [setTimeLimit, setSetTimeLimit] = useState(true);
  const [timeValidationError, setTimeValidationError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleLanguage = () => {
    const newLang = currentLanguage === "en" ? "vi" : "en";
    setCurrentLanguage(newLang);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setFileName(file.name);
      setSelectFiles("yes");
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileName("");
    setSelectFiles("no");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateTimeRange = () => {
    const publishDateInput = document.querySelector('input[name="publishDate"]') as HTMLInputElement;
    const publishHourInput = document.querySelector('input[name="publishHour"]') as HTMLInputElement;
    const publishMinuteInput = document.querySelector('input[name="publishMinute"]') as HTMLInputElement;
    const durationDateInput = document.querySelector('input[name="durationDate"]') as HTMLInputElement;
    const durationHourInput = document.querySelector('input[name="durationHour"]') as HTMLInputElement;
    const durationMinuteInput = document.querySelector('input[name="durationMinute"]') as HTMLInputElement;

    if (!publishDateInput || !durationDateInput) return;

    const publishDate = new Date(publishDateInput.value);
    publishDate.setHours(parseInt(publishHourInput?.value || "0"), parseInt(publishMinuteInput?.value || "0"), 0);

    const durationDate = new Date(durationDateInput.value);
    durationDate.setHours(parseInt(durationHourInput?.value || "0"), parseInt(durationMinuteInput?.value || "0"), 0);

    if (durationDate < publishDate) {
      setTimeValidationError(currentLanguage === "en" 
        ? "Duration time must be after publish time" 
        : "Thời lượng phải sau thời gian xuất bản");
      return false;
    } else {
      setTimeValidationError("");
      return true;
    }
  };

  const handleTimeChange = () => {
    // Validate when time inputs change
    setTimeout(validateTimeRange, 100);
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

  const sectionHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem",
    backgroundColor: "#F5F5F5",
    borderRadius: "25px",
    marginBottom: "1rem",
    cursor: "pointer",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#000000",
  };

  const chevronStyle: React.CSSProperties = {
    fontSize: "1.2rem",
    color: "#565656",
    transition: "transform 0.2s",
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "2px solid #D9D9D9",
    borderRadius: "25px",
    outline: "none",
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: "150px",
    resize: "vertical",
  };

  const checkboxStyle: React.CSSProperties = {
    width: "20px",
    height: "20px",
    borderRadius: "25px",
    border: "2px solid #565656",
    cursor: "pointer",
    marginRight: "0.5rem",
  };

  const radioGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "2rem",
    alignItems: "center",
  };

  const radioOptionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
  };

  const radioButtonStyle: React.CSSProperties = {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    border: "2px solid #565656",
    position: "relative",
  };

  const radioButtonCheckedStyle: React.CSSProperties = {
    ...radioButtonStyle,
    backgroundColor: "#0A853F",
    borderColor: "#0A853F",
  };

  const timeInputGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  };

  const timeInputStyle: React.CSSProperties = {
    width: "60px",
    padding: "0.5rem",
    border: "2px solid #D9D9D9",
    borderRadius: "25px",
    textAlign: "center",
    fontSize: "1rem",
  };

  const dateInputStyle: React.CSSProperties = {
    padding: "0.5rem",
    border: "2px solid #D9D9D9",
    borderRadius: "25px",
    fontSize: "1rem",
    marginLeft: "0.5rem",
  };

  const fileUploadAreaStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginTop: "1rem",
  };

  const fileIconStyle: React.CSSProperties = {
    width: "48px",
    height: "48px",
    backgroundColor: "#FF0000",
    borderRadius: "25px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontSize: "1.5rem",
  };

  const addButtonStyle: React.CSSProperties = {
    width: "48px",
    height: "48px",
    backgroundColor: "#D9D9D9",
    borderRadius: "25px",
    border: "none",
    fontSize: "2rem",
    color: "#000000",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "1rem",
    marginTop: "2rem",
  };

  const saveButtonStyle: React.CSSProperties = {
    backgroundColor: "#0A853F",
    color: "#FFFFFF",
    borderRadius: "25px",
    padding: "1rem 2rem",
    border: "none",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  };

  const cancelButtonStyle: React.CSSProperties = {
    backgroundColor: "#FFFFFF",
    color: "#000000",
    borderRadius: "25px",
    padding: "1rem 2rem",
    border: "2px solid #D9D9D9",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  };

  const expandAllStyle: React.CSSProperties = {
    color: "#2C8B85",
    textDecoration: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
  };

  return (
    <div style={containerStyle}>
      <Header
        signed_in={signed_in}
        user_flag={user_flag}
        language={currentLanguage}
        onLanguageChange={toggleLanguage}
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
          {quizId 
            ? (currentLanguage === "en" ? "Updating Quiz 1 in In-class assignments" : "Cập nhật Quiz 1 trong Bài tập trên lớp")
            : (currentLanguage === "en" ? "Creating Quiz in In-class assignments" : "Tạo Quiz trong Bài tập trên lớp")
          }
        </p>
        <div style={{ textAlign: "right", marginBottom: "1rem" }}>
          <a
            href="#"
            style={expandAllStyle}
            onClick={(e) => {
              e.preventDefault();
              const allExpanded = generalExpanded && commonExpanded;
              setGeneralExpanded(!allExpanded);
              setCommonExpanded(!allExpanded);
            }}
          >
            {generalExpanded && commonExpanded
              ? (currentLanguage === "en" ? "Collapse all" : "Thu gọn toàn bộ")
              : (currentLanguage === "en" ? "Expand all" : "Mở rộng tất cả")}
          </a>
        </div>

        <Form method="post">
          <input type="hidden" name="quizId" value={quizId || ""} />

          {/* General Section */}
          <div style={{ marginBottom: "2rem" }}>
            <div
              style={sectionHeaderStyle}
              onClick={() => setGeneralExpanded(!generalExpanded)}
            >
              <h2 style={sectionTitleStyle}>
                {currentLanguage === "en" ? "General" : "Chung"}
              </h2>
              <span style={chevronStyle}>
                {generalExpanded ? "▼" : "▶"}
              </span>
            </div>

            {generalExpanded && (
              <div style={{ padding: "0 1rem" }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {currentLanguage === "en" ? "Name" : "Tên"}
                  </label>
                  <input
                    type="text"
                    name="quizName"
                    defaultValue="Quiz 1"
                    style={inputStyle}
                    required
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {currentLanguage === "en" ? "Description" : "Mô tả"}
                  </label>
                  <textarea
                    name="description"
                    style={textareaStyle}
                    placeholder={currentLanguage === "en" ? "Enter description..." : "Nhập mô tả..."}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={{ ...radioOptionStyle, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      name="displayDescription"
                      style={checkboxStyle}
                    />
                    <span>
                      {currentLanguage === "en" 
                        ? "Display description on course page" 
                        : "Hiển thị mô tả trên trang khóa học"}
                    </span>
                  </label>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {currentLanguage === "en" ? "Answers" : "Câu trả lời"}
                  </label>
                  <div style={radioGroupStyle}>
                    <label style={radioOptionStyle}>
                      <div style={answerType === "free_response" ? radioButtonCheckedStyle : radioButtonStyle}>
                        {answerType === "free_response" && (
                          <div style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: "#FFFFFF",
                          }} />
                        )}
                      </div>
                      <input
                        type="radio"
                        name="answerType"
                        value="free_response"
                        checked={answerType === "free_response"}
                        onChange={(e) => setAnswerType("free_response")}
                        style={{ display: "none" }}
                      />
                      <span>{currentLanguage === "en" ? "Free response" : "Tự do trả lời"}</span>
                    </label>
                    <label style={radioOptionStyle}>
                      <div style={answerType === "multiple_choice" ? radioButtonCheckedStyle : radioButtonStyle}>
                        {answerType === "multiple_choice" && (
                          <div style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: "#FFFFFF",
                          }} />
                        )}
                      </div>
                      <input
                        type="radio"
                        name="answerType"
                        value="multiple_choice"
                        checked={answerType === "multiple_choice"}
                        onChange={(e) => setAnswerType("multiple_choice")}
                        style={{ display: "none" }}
                      />
                      <span>{currentLanguage === "en" ? "Multiple choice" : "Trắc nghiệm"}</span>
                    </label>
                  </div>
                </div>

                {/* File Upload Section */}
                {answerType === "free_response" && (
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>
                      {currentLanguage === "en" ? "Select files" : "Chọn tệp"}
                    </label>
                    <div style={fileUploadAreaStyle}>
                      {uploadedFile ? (
                        <>
                          <div style={fileIconStyle}>📄</div>
                          <span style={{ flex: 1, color: "#565656" }}>
                            {fileName.length > 30 ? fileName.substring(0, 30) + "..." : fileName}
                          </span>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            style={{
                              ...addButtonStyle,
                              backgroundColor: "#FF0000",
                              color: "#FFFFFF",
                              fontSize: "1rem",
                            }}
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={addButtonStyle}
                          >
                            +
                          </button>
                          <span style={{ color: "#565656" }}>
                            {currentLanguage === "en" ? "Add" : "Thêm"}
                          </span>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>
                )}

                {answerType === "multiple_choice" && (
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>
                      {currentLanguage === "en" ? "Select files" : "Chọn tệp"}
                    </label>
                    <div style={radioGroupStyle}>
                      <label style={radioOptionStyle}>
                        <div style={selectFiles === "yes" ? radioButtonCheckedStyle : radioButtonStyle}>
                          {selectFiles === "yes" && (
                            <div style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: "#FFFFFF",
                            }} />
                          )}
                        </div>
                        <input
                          type="radio"
                          name="selectFiles"
                          value="yes"
                          checked={selectFiles === "yes"}
                          onChange={(e) => setSelectFiles("yes")}
                          style={{ display: "none" }}
                        />
                        <span>{currentLanguage === "en" ? "Yes" : "Có"}</span>
                      </label>
                      <label style={radioOptionStyle}>
                        <div style={selectFiles === "no" ? radioButtonCheckedStyle : radioButtonStyle}>
                          {selectFiles === "no" && (
                            <div style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: "#FFFFFF",
                            }} />
                          )}
                        </div>
                        <input
                          type="radio"
                          name="selectFiles"
                          value="no"
                          checked={selectFiles === "no"}
                          onChange={(e) => {
                            setSelectFiles("no");
                            handleRemoveFile();
                          }}
                          style={{ display: "none" }}
                        />
                        <span>{currentLanguage === "en" ? "No" : "Không"}</span>
                      </label>
                    </div>
                    {selectFiles === "yes" && (
                      <div style={fileUploadAreaStyle}>
                        {uploadedFile ? (
                          <>
                            <div style={fileIconStyle}>📄</div>
                            <span style={{ flex: 1, color: "#565656" }}>
                              {fileName.length > 30 ? fileName.substring(0, 30) + "..." : fileName}
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveFile}
                              style={{
                                ...addButtonStyle,
                                backgroundColor: "#FF0000",
                                color: "#FFFFFF",
                                fontSize: "1rem",
                              }}
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              style={addButtonStyle}
                            >
                              +
                            </button>
                            <span style={{ color: "#565656" }}>
                              {currentLanguage === "en" ? "Add" : "Thêm"}
                            </span>
                          </>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileUpload}
                          style={{ display: "none" }}
                          required={selectFiles === "yes"}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Common Module Settings Section */}
          <div style={{ marginBottom: "2rem" }}>
            <div
              style={sectionHeaderStyle}
              onClick={() => setCommonExpanded(!commonExpanded)}
            >
              <h2 style={sectionTitleStyle}>
                {currentLanguage === "en" ? "Common module settings" : "Cài đặt module chung"}
              </h2>
              <span style={chevronStyle}>
                {commonExpanded ? "▼" : "▶"}
              </span>
            </div>

            {commonExpanded && (
              <div style={{ padding: "0 1rem" }}>
                {/* Publish Time */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {currentLanguage === "en" ? "Publish time" : "Thời gian xuất bản"}
                  </label>
                  <div style={timeInputGroupStyle}>
                    <input
                      type="number"
                      name="publishHour"
                      defaultValue="16"
                      min="0"
                      max="23"
                      style={timeInputStyle}
                      onChange={handleTimeChange}
                    />
                    <span>:</span>
                    <input
                      type="number"
                      name="publishMinute"
                      defaultValue="00"
                      min="0"
                      max="59"
                      style={timeInputStyle}
                      onChange={handleTimeChange}
                    />
                    <span>:</span>
                    <input
                      type="number"
                      name="publishSecond"
                      defaultValue="00"
                      min="0"
                      max="59"
                      style={timeInputStyle}
                      onChange={handleTimeChange}
                    />
                    <input
                      type="date"
                      name="publishDate"
                      defaultValue="2025-12-12"
                      style={dateInputStyle}
                      onChange={handleTimeChange}
                    />
                  </div>
                </div>

                {/* Duration */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {currentLanguage === "en" ? "Duration" : "Thời lượng"}
                  </label>
                  <div style={timeInputGroupStyle}>
                    <input
                      type="number"
                      name="durationHour"
                      defaultValue="23"
                      min="0"
                      max="23"
                      style={timeInputStyle}
                      onChange={handleTimeChange}
                    />
                    <span>:</span>
                    <input
                      type="number"
                      name="durationMinute"
                      defaultValue="59"
                      min="0"
                      max="59"
                      style={timeInputStyle}
                      onChange={handleTimeChange}
                    />
                    <span>:</span>
                    <input
                      type="number"
                      name="durationSecond"
                      defaultValue="59"
                      min="0"
                      max="59"
                      style={timeInputStyle}
                      onChange={handleTimeChange}
                    />
                    <input
                      type="date"
                      name="durationDate"
                      defaultValue="2025-12-12"
                      style={dateInputStyle}
                      onChange={handleTimeChange}
                    />
                  </div>
                  {timeValidationError && (
                    <div style={{ color: "#FF0000", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                      {timeValidationError}
                    </div>
                  )}
                </div>

                {/* Time Limit */}
                <div style={formGroupStyle}>
                  <label style={{ ...radioOptionStyle, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      name="setTimeLimit"
                      checked={setTimeLimit}
                      onChange={(e) => setSetTimeLimit(e.target.checked)}
                      style={checkboxStyle}
                    />
                    <span>
                      {currentLanguage === "en" ? "Set time limit" : "Đặt giới hạn thời gian"}
                    </span>
                  </label>
                  {setTimeLimit && (
                    <div style={{ ...timeInputGroupStyle, marginTop: "0.5rem" }}>
                      <input
                        type="number"
                        name="timeLimitHour"
                        defaultValue="00"
                        min="0"
                        max="23"
                        style={timeInputStyle}
                      />
                      <span>:</span>
                      <input
                        type="number"
                        name="timeLimitMinute"
                        defaultValue="45"
                        min="0"
                        max="59"
                        style={timeInputStyle}
                      />
                      <span>:</span>
                      <input
                        type="number"
                        name="timeLimitSecond"
                        defaultValue="00"
                        min="0"
                        max="59"
                        style={timeInputStyle}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={buttonGroupStyle}>
            <button 
              type="submit" 
              style={saveButtonStyle}
              onClick={(e) => {
                if (!validateTimeRange()) {
                  e.preventDefault();
                }
              }}
            >
              {answerType === "multiple_choice"
                ? (currentLanguage === "en" ? "Next" : "Tiếp theo")
                : (currentLanguage === "en" ? "Save and return to course" : "Lưu và quay lại khóa học")
              }
            </button>
            <button
              type="button"
              onClick={() => navigate(`/courses/${sectionId}?signed_in=1&user_flag=${user_flag}`)}
              style={cancelButtonStyle}
            >
              {currentLanguage === "en" ? "Cancel" : "Hủy"}
            </button>
          </div>
        </Form>
      </main>
      <Footer language={currentLanguage} />
    </div>
  );
}
