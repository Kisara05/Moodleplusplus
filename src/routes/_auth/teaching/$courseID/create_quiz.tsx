import { 
  json, 
  redirect, 
  unstable_composeUploadHandlers, 
  unstable_createMemoryUploadHandler, 
  unstable_parseMultipartFormData, 
  type ActionFunctionArgs, 
  type LoaderFunctionArgs 
} from "@remix-run/node";
import { Form, useLoaderData, useActionData, useNavigate, useParams, useNavigation } from "@remix-run/react";
import { createClient } from "@supabase/supabase-js";
import { useState, useRef } from "react";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { getSectionWithCourseDetails } from "~/services/course.server";

// --- HELPER: Parse Aiken Format ---
function parseAiken(text: string) {
  const blocks = text.replace(/\r\n/g, "\n").trim().split(/\n\s*\n/);
  return blocks.map(block => {
    const lines = block.split("\n").map(l => l.trim()).filter(l => l);
    const answerLine = lines.pop();
    if (!answerLine?.startsWith("ANSWER: ")) return null;
    
    const correctLetter = answerLine.replace("ANSWER:", "").trim();
    const questionText = lines.shift() || "Untitled Question";
    
    const options = lines.map(line => {
      const match = line.match(/^([A-Z])[\.\)]\s+(.*)/);
      return match ? { id: match[1], text: match[2] } : null;
    }).filter(Boolean) as { id: string, text: string }[];

    return { questionText, options, correctLetter };
  }).filter(Boolean);
}

// --- LOADER ---
export async function loader({ request, params }: LoaderFunctionArgs) {
  const sectionId = params.courseID;
  if (!sectionId) throw new Response("Section ID is missing", { status: 400 });
  
  const section = await getSectionWithCourseDetails(sectionId);
  if (!section) throw new Response("Section not found", { status: 404 });

  const url = new URL(request.url);
  const signed_in = url.searchParams.get("signed_in") === "1";
  const user_flag = parseInt(url.searchParams.get("user_flag") || "0");
  const language = (url.searchParams.get("lang") as "en" | "vi") || "en";
  const quizId = url.searchParams.get("quizId");

  return json({ signed_in, user_flag, language, sectionId, section, quizId });
}

// --- ACTION (Only runs for File Upload or Free Response) ---
export async function action({ request, params }: ActionFunctionArgs) {
  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createMemoryUploadHandler({ maxPartSize: 5_000_000 }), 
  );
  const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  const sectionId = params.courseID;

  // Basic Info
  const title = String(formData.get("quizName"));
  const description = String(formData.get("description"));
  const displayDescription = formData.get("displayDescription") === "on";


  if (displayDescription && !description.trim()) {
    return json({ error: "Description is required if 'Display description' is checked." });
  }

  const answerType = String(formData.get("answerType"));
  const selectFiles = String(formData.get("selectFiles"));

  // Time Parsing (UTC+7 Enforcement)
  const pad = (n: any) => String(n).padStart(2, '0');
  
  const pDate = formData.get("publishDate");
  const pHour = formData.get("publishHour") || "00";
  const pMin = formData.get("publishMinute") || "00";
  const pSec = formData.get("publishSecond") || "00";
  const openTime = pDate ? `${pDate}T${pad(pHour)}:${pad(pMin)}:${pad(pSec)}+07:00` : null;

  const dDate = formData.get("durationDate");
  const dHour = formData.get("durationHour") || "23";
  const dMin = formData.get("durationMinute") || "59";
  const dSec = formData.get("durationSecond") || "59";
  const deadline = dDate ? `${dDate}T${pad(dHour)}:${pad(dMin)}:${pad(dSec)}+07:00` : null;

  let timeLimitSeconds = null;
  if (formData.get("setTimeLimit") === "on") {
    const limitH = Number(formData.get("timeLimitHour") || 0);
    const limitM = Number(formData.get("timeLimitMinute") || 0);
    const limitS = Number(formData.get("timeLimitSecond") || 0);
    timeLimitSeconds = (limitH * 3600) + (limitM * 60) + limitS;
  }

  // Validation

  if (openTime && deadline) {
    const start = new Date(openTime).getTime();
    const end = new Date(deadline).getTime();
    if (end <= start) return json({ error: "The Close time (Deadline) must be set after the Publish time." });
  }

  const file = formData.get("question_file") as File;
  const isFileEmpty = !file || file.size === 0;

  if (selectFiles === "yes" && isFileEmpty) {
    return json({ error: "You selected 'Upload File' but no file was added." });
  }
  if (answerType === "free_response" && isFileEmpty) {
    return json({ error: "For Free Response, you must upload a text file." });
  }

  // --- DB Insertions (Only if NOT intercepting Manual Entry) ---
  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({ section_id: sectionId, title: title, post_type: 'quiz' })
    .select("post_id").single();

  if (postError) return json({ error: postError.message });

  const { data: quizData, error: quizError } = await supabase
    .from("quiz")
    .insert({
      post_id: post.post_id, 
      title, description, display_description: displayDescription,
      open_time: openTime, deadline, time_limit: timeLimitSeconds, grade: 0 
    })
    .select("quiz_id").single();

  if (quizError) return json({ error: quizError.message });
  const realQuizId = quizData.quiz_id; 

  // File Processing
  if (selectFiles === "yes" && file && file.size > 0) {
      const textContent = await file.text();
      let totalQuestions = 0;

      if (answerType === "multiple_choice") {
        const parsedQuestions = parseAiken(textContent);
        totalQuestions = parsedQuestions.length;
        for (const q of parsedQuestions) {
          if (!q) continue;
          const { data: qData } = await supabase.from("question").insert({
            quiz_id: realQuizId, html_content: q.questionText, is_multiple_choice: true, grade: 1.0 
          }).select().single();
          if (qData) {
            const choices = q.options.map(opt => ({
              question_id: qData.question_id, html_content: opt.text, is_correct: opt.id === q.correctLetter, grade: opt.id === q.correctLetter ? 1 : 0
            }));
            await supabase.from("choice_multiple_question").insert(choices);
          }
        }
      } else {
        const blocks = textContent.replace(/\r\n/g, "\n").trim().split(/\n\s*\n/);
        const questionsToInsert = blocks.map(b => b.trim()).filter(b => b.length > 0)
          .map(b => ({ quiz_id: realQuizId, html_content: b, is_multiple_choice: false, grade: 1.0 }));
        totalQuestions = questionsToInsert.length;
        if (questionsToInsert.length > 0) await supabase.from("question").insert(questionsToInsert);
      }

      if (totalQuestions > 0) {
        await supabase.from("quiz").update({ grade: totalQuestions }).eq("quiz_id", realQuizId);
      }
      return redirect(`/courses/${sectionId}`);
  } 

  return redirect(`/courses/${sectionId}`);
}

// --- COMPONENT ---
export default function CreateQuiz() {
  const actionData = useActionData<typeof action>();
  const { signed_in, user_flag, language, section, quizId, sectionId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [currentLanguage, setCurrentLanguage] = useState<"en" | "vi">(language);
  const [generalExpanded, setGeneralExpanded] = useState(true);
  const [commonExpanded, setCommonExpanded] = useState(true);
  const [answerType, setAnswerType] = useState<"free_response" | "multiple_choice">("free_response");
  const [selectFiles, setSelectFiles] = useState<"yes" | "no">("no");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const toggleLanguage = () => setCurrentLanguage(prev => prev === "en" ? "vi" : "en");

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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- NEW: Handle Form Submission (Pass-Through Logic) ---
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  // 1. Get current form data immediately to check validation
  const formData = new FormData(event.currentTarget);
  const desc = String(formData.get("description"));
  const disp = formData.get("displayDescription") === "on";

  // 2. UNIVERSAL VALIDATION (Runs for BOTH Manual and Server paths)
  if (disp && !desc.trim()) {
    event.preventDefault(); // Stop submission immediately
    setClientError(currentLanguage === "en" 
      ? "Description is required if 'Display description' is checked." 
      : "Mô tả là bắt buộc nếu tùy chọn hiển thị được chọn.");
    return; // Stop here
  }

  // 3. Validation passed? Clear the error so we can proceed
  setClientError(null);

  // 4. BRANCHING LOGIC
  // CASE A: Manual Multiple Choice -> We must hijack the submit to Navigate
  if (answerType === "multiple_choice" && selectFiles === "no") {
    event.preventDefault(); // Stop standard server submit
    
    // Calculate Seconds for Time Limit (Client-side calculation)
    let timeLimitSeconds = null;
    if (formData.get("setTimeLimit") === "on") {
      const h = Number(formData.get("timeLimitHour") || 0);
      const m = Number(formData.get("timeLimitMinute") || 0);
      const s = Number(formData.get("timeLimitSecond") || 0);
      timeLimitSeconds = (h * 3600) + (m * 60) + s;
    }

    // Gather Data to Pass
    const quizHeaderData = {
       title: formData.get("quizName"),
       description: formData.get("description"),
       displayDescription: formData.get("displayDescription") === "on",
       
       publishDate: formData.get("publishDate"),
       publishHour: formData.get("publishHour"),
       publishMinute: formData.get("publishMinute"),
       publishSecond: formData.get("publishSecond"),
       
       durationDate: formData.get("durationDate"),
       durationHour: formData.get("durationHour"),
       durationMinute: formData.get("durationMinute"),
       durationSecond: formData.get("durationSecond"),
       
       timeLimitSeconds: timeLimitSeconds
    };

    // Navigate
    navigate(`/courses/${sectionId}/create_quiz_multiplechoice1?signed_in=1&user_flag=${user_flag}`, {
      state: { quizHeaderData } 
    });
  }
    // Else: Let standard Action run (Free Response or File Upload)
  };

  // Styles
  const containerStyle: React.CSSProperties = { minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#FFFFFF" };
  const mainStyle: React.CSSProperties = { flex: 1, padding: "2rem", maxWidth: "1200px", margin: "0 auto", width: "100%" };
  const filterBarStyle: React.CSSProperties = { display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" };
  const filterButtonStyle: React.CSSProperties = { backgroundColor: "#D9D9D9", borderRadius: "25px", padding: "0.5rem 1rem", border: "none", fontSize: "0.9rem", color: "#000000", fontWeight: "500" };
  const activeFilterButtonStyle: React.CSSProperties = { ...filterButtonStyle, backgroundColor: "#0A853F", color: "#FFFFFF" };
  const courseTitleStyle: React.CSSProperties = { fontSize: "1.5rem", fontWeight: "bold", color: "#2C8B85", marginBottom: "0.5rem" };
  const pageSubtitleStyle: React.CSSProperties = { fontSize: "1rem", color: "#2C8B85", marginBottom: "2rem" };
  const sectionHeaderStyle: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", backgroundColor: "#F5F5F5", borderRadius: "25px", marginBottom: "1rem", cursor: "pointer" };
  const sectionTitleStyle: React.CSSProperties = { fontSize: "1.2rem", fontWeight: "bold", color: "#000000" };
  const chevronStyle: React.CSSProperties = { fontSize: "1.2rem", color: "#565656", transition: "transform 0.2s" };
  const formGroupStyle: React.CSSProperties = { marginBottom: "1.5rem" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "1rem", fontWeight: "500", color: "#000000", marginBottom: "0.5rem" };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "0.75rem", fontSize: "1rem", border: "2px solid #D9D9D9", borderRadius: "25px", outline: "none" };
  const textareaStyle: React.CSSProperties = { ...inputStyle, minHeight: "150px", resize: "vertical" };
  const checkboxStyle: React.CSSProperties = { width: "20px", height: "20px", borderRadius: "25px", border: "2px solid #565656", cursor: "pointer", marginRight: "0.5rem" };
  const radioGroupStyle: React.CSSProperties = { display: "flex", gap: "2rem", alignItems: "center" };
  const radioOptionStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" };
  const radioButtonStyle: React.CSSProperties = { width: "20px", height: "20px", borderRadius: "50%", border: "2px solid #565656", position: "relative" };
  const radioButtonCheckedStyle: React.CSSProperties = { ...radioButtonStyle, backgroundColor: "#0A853F", borderColor: "#0A853F" };
  const timeInputGroupStyle: React.CSSProperties = { display: "flex", gap: "0.5rem", alignItems: "center" };
  const timeInputStyle: React.CSSProperties = { width: "60px", padding: "0.5rem", border: "2px solid #D9D9D9", borderRadius: "25px", textAlign: "center", fontSize: "1rem" };
  const dateInputStyle: React.CSSProperties = { padding: "0.5rem", border: "2px solid #D9D9D9", borderRadius: "25px", fontSize: "1rem", marginLeft: "0.5rem" };
  const fileUploadAreaStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" };
  const fileIconStyle: React.CSSProperties = { width: "48px", height: "48px", backgroundColor: "#FF0000", borderRadius: "25px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "1.5rem" };
  const addButtonStyle: React.CSSProperties = { width: "48px", height: "48px", backgroundColor: "#D9D9D9", borderRadius: "25px", border: "none", fontSize: "2rem", color: "#000000", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
  const buttonGroupStyle: React.CSSProperties = { display: "flex", gap: "1rem", marginTop: "2rem" };
  const saveButtonStyle: React.CSSProperties = { backgroundColor: "#0A853F", color: "#FFFFFF", borderRadius: "25px", padding: "1rem 2rem", border: "none", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", opacity: isSubmitting ? 0.7 : 1 };
  const cancelButtonStyle: React.CSSProperties = { backgroundColor: "#FFFFFF", color: "#000000", borderRadius: "25px", padding: "1rem 2rem", border: "2px solid #D9D9D9", fontSize: "1rem", fontWeight: "bold", cursor: "pointer" };
  const expandAllStyle: React.CSSProperties = { color: "#2C8B85", textDecoration: "none", cursor: "pointer", fontSize: "0.9rem" };
  const errorBannerStyle: React.CSSProperties = { backgroundColor: "#FEE2E2", border: "1px solid #F87171", color: "#B91C1C", padding: "1rem", borderRadius: "15px", marginTop: "1rem", marginBottom: "1.5rem", fontWeight: "500", textAlign: "center" };

  return (
    <div style={containerStyle}>
      <Header signed_in={signed_in} user_flag={user_flag} language={currentLanguage} onLanguageChange={toggleLanguage} userId="123" />
      <main style={mainStyle}>
        
        {/* Filter Bar */}
        <div style={filterBarStyle}>
          <button style={activeFilterButtonStyle}>2025 - 2026</button>
          <button style={activeFilterButtonStyle}>Semester 1</button>
          <button style={filterButtonStyle}>Advanced Program (APCS)</button>
        </div>

        {/* Course Title */}
        <h1 style={courseTitleStyle}>
          {section?.course?.course_name || "Element of Software Engineering"}
        </h1>
        <p style={pageSubtitleStyle}>
          {quizId 
            ? (currentLanguage === "en" ? "Updating Quiz 1 in In-class assignments" : "Cập nhật Quiz 1 trong Bài tập trên lớp")
            : (currentLanguage === "en" ? "Creating Quiz in In-class assignments" : "Tạo Quiz trong Bài tập trên lớp")
          }
        </p>
        <div style={{ textAlign: "right", marginBottom: "1rem" }}>
          <a href="#" style={expandAllStyle} onClick={(e) => { e.preventDefault(); setGeneralExpanded(true); setCommonExpanded(true); }}>
            {currentLanguage === "en" ? "Expand all" : "Mở rộng tất cả"}
          </a>
        </div>

        {/* IMPORTANT: Added onSubmit handler */}
        <Form method="post" encType="multipart/form-data" onSubmit={handleSubmit}>
          <input type="hidden" name="quizId" value={quizId || ""} />

          {/* General Section */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={sectionHeaderStyle} onClick={() => setGeneralExpanded(!generalExpanded)}>
              <h2 style={sectionTitleStyle}>{currentLanguage === "en" ? "General" : "Chung"}</h2>
              <span style={chevronStyle}>{generalExpanded ? "▼" : "▶"}</span>
            </div>

            <div style={{ padding: "0 1rem", display: generalExpanded ? "block" : "none" }}>
              
              {/* Name Input */}
              <div style={formGroupStyle}>
                <label style={labelStyle}>{currentLanguage === "en" ? "Name" : "Tên"}</label>
                <input type="text" name="quizName" defaultValue="Quiz 1" style={inputStyle} required />
              </div>

              {/* Description Input */}
              <div style={formGroupStyle}>
                <label style={labelStyle}>{currentLanguage === "en" ? "Description" : "Mô tả"}</label>
                <textarea name="description" style={textareaStyle} placeholder={currentLanguage === "en" ? "Enter description..." : "Nhập mô tả..."} />
              </div>

              {/* Display Description Checkbox */}
              <div style={formGroupStyle}>
                <label style={{ ...radioOptionStyle, cursor: "pointer" }}>
                  <input type="checkbox" name="displayDescription" style={checkboxStyle} />
                  <span>{currentLanguage === "en" ? "Display description on course page" : "Hiển thị mô tả trên trang khóa học"}</span>
                </label>
              </div>

              {/* Answer Type Radios */}
              <div style={formGroupStyle}>
                <label style={labelStyle}>{currentLanguage === "en" ? "Answers" : "Câu trả lời"}</label>
                <div style={radioGroupStyle}>
                  <label style={radioOptionStyle}>
                    <div style={answerType === "free_response" ? radioButtonCheckedStyle : radioButtonStyle}>
                      {answerType === "free_response" && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#FFFFFF" }} />}
                    </div>
                    <input type="radio" name="answerType" value="free_response" checked={answerType === "free_response"} onChange={() => setAnswerType("free_response")} style={{ display: "none" }} />
                    <span>{currentLanguage === "en" ? "Free response" : "Tự do trả lời"}</span>
                  </label>
                  <label style={radioOptionStyle}>
                    <div style={answerType === "multiple_choice" ? radioButtonCheckedStyle : radioButtonStyle}>
                      {answerType === "multiple_choice" && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#FFFFFF" }} />}
                    </div>
                    <input type="radio" name="answerType" value="multiple_choice" checked={answerType === "multiple_choice"} onChange={() => setAnswerType("multiple_choice")} style={{ display: "none" }} />
                    <span>{currentLanguage === "en" ? "Multiple choice" : "Trắc nghiệm"}</span>
                  </label>
                </div>
              </div>

              {/* File Upload Logic */}
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  {currentLanguage === "en" ? "Select files (txt)" : "Chọn tệp (txt)"}
                </label>

                {answerType === "free_response" && (
                  <div style={fileUploadAreaStyle}>
                    {uploadedFile ? (
                      <>
                        <div style={fileIconStyle}>📄</div>
                        <span style={{ flex: 1, color: "#565656" }}>
                          {fileName.length > 30 ? fileName.substring(0, 30) + "..." : fileName}
                        </span>
                        <button type="button" onClick={handleRemoveFile} style={{ ...addButtonStyle, backgroundColor: "#FF0000", color: "#FFFFFF", fontSize: "1rem" }}>×</button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => fileInputRef.current?.click()} style={addButtonStyle}>+</button>
                        <span style={{ color: "#565656" }}>{currentLanguage === "en" ? "Add" : "Thêm"}</span>
                      </>
                    )}
                    <input type="hidden" name="selectFiles" value={uploadedFile ? "yes" : "no"} />
                    <input ref={fileInputRef} type="file" name="question_file" accept=".txt" onChange={handleFileUpload} style={{ display: "none" }} />
                  </div>
                )}

                {answerType === "multiple_choice" && (
                  <>
                    <div style={radioGroupStyle}>
                      <label style={radioOptionStyle}>
                        <div style={selectFiles === "yes" ? radioButtonCheckedStyle : radioButtonStyle}>
                          {selectFiles === "yes" && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#FFFFFF" }} />}
                        </div>
                        <input type="radio" name="selectFiles" value="yes" checked={selectFiles === "yes"} onChange={() => setSelectFiles("yes")} style={{ display: "none" }} />
                        <span>{currentLanguage === "en" ? "Yes" : "Có"}</span>
                      </label>
                      <label style={radioOptionStyle}>
                        <div style={selectFiles === "no" ? radioButtonCheckedStyle : radioButtonStyle}>
                          {selectFiles === "no" && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#FFFFFF" }} />}
                        </div>
                        <input type="radio" name="selectFiles" value="no" checked={selectFiles === "no"} onChange={() => { setSelectFiles("no"); handleRemoveFile(); }} style={{ display: "none" }} />
                        <span>{currentLanguage === "en" ? "No" : "Không"}</span>
                      </label>
                    </div>

                    {selectFiles === "yes" && (
                      <div style={fileUploadAreaStyle}>
                        {uploadedFile ? (
                          <>
                            <div style={fileIconStyle}>📄</div>
                            <span style={{ flex: 1, color: "#565656" }}>{fileName.length > 30 ? fileName.substring(0, 30) + "..." : fileName}</span>
                            <button type="button" onClick={handleRemoveFile} style={{ ...addButtonStyle, backgroundColor: "#FF0000", color: "#FFFFFF", fontSize: "1rem" }}>×</button>
                          </>
                        ) : (
                          <>
                            <button type="button" onClick={() => fileInputRef.current?.click()} style={addButtonStyle}>+</button>
                            <span style={{ color: "#565656" }}>{currentLanguage === "en" ? "Add" : "Thêm"}</span>
                          </>
                        )}
                        <input ref={fileInputRef} type="file" name="question_file" accept=".txt" onChange={handleFileUpload} style={{ display: "none" }} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Common Module Settings */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={sectionHeaderStyle} onClick={() => setCommonExpanded(!commonExpanded)}>
              <h2 style={sectionTitleStyle}>{currentLanguage === "en" ? "Common module settings" : "Cài đặt module chung"}</h2>
              <span style={chevronStyle}>{commonExpanded ? "▼" : "▶"}</span>
            </div>

            <div style={{ padding: "0 1rem", display: commonExpanded ? "block" : "none" }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>{currentLanguage === "en" ? "Publish time" : "Thời gian xuất bản"}</label>
                <div style={timeInputGroupStyle}>
                  <input type="number" name="publishHour" defaultValue="16" min="0" max="23" style={timeInputStyle} />
                  <span>:</span>
                  <input type="number" name="publishMinute" defaultValue="00" min="0" max="59" style={timeInputStyle} />
                  <span>:</span>
                  <input type="number" name="publishSecond" defaultValue="00" min="0" max="59" style={timeInputStyle} />
                  <input type="date" name="publishDate" defaultValue="2025-12-12" style={dateInputStyle} />
                </div>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>{currentLanguage === "en" ? "Close time (Deadline)" : "Thời gian đóng"}</label>
                <div style={timeInputGroupStyle}>
                  <input type="number" name="durationHour" defaultValue="23" min="0" max="23" style={timeInputStyle} />
                  <span>:</span>
                  <input type="number" name="durationMinute" defaultValue="59" min="0" max="59" style={timeInputStyle} />
                  <span>:</span>
                  <input type="number" name="durationSecond" defaultValue="59" min="0" max="59" style={timeInputStyle} />
                  <input type="date" name="durationDate" defaultValue="2025-12-12" style={dateInputStyle} />
                </div>
              </div>

              <div style={formGroupStyle}>
                <label style={{ ...radioOptionStyle, cursor: "pointer" }}>
                  <input type="checkbox" name="setTimeLimit" defaultChecked style={checkboxStyle} />
                  <span>{currentLanguage === "en" ? "Set time limit" : "Đặt giới hạn thời gian"}</span>
                </label>
                <div style={{ ...timeInputGroupStyle, marginTop: "0.5rem" }}>
                  <input type="number" name="timeLimitHour" defaultValue="00" min="0" max="23" style={timeInputStyle} />
                  <span>:</span>
                  <input type="number" name="timeLimitMinute" defaultValue="45" min="0" max="59" style={timeInputStyle} />
                  <span>:</span>
                  <input type="number" name="timeLimitSecond" defaultValue="00" min="0" max="59" style={timeInputStyle} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={buttonGroupStyle}>
            <button type="submit" style={saveButtonStyle} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : (
                answerType === "multiple_choice" && selectFiles === "no"
                  ? (currentLanguage === "en" ? "Next" : "Tiếp theo")
                  : (currentLanguage === "en" ? "Save and return to course" : "Lưu và quay lại khóa học")
              )}
            </button>
            <button type="button" onClick={() => navigate(`/?signed_in=1&user_flag=${user_flag}`)} style={cancelButtonStyle}>
              {currentLanguage === "en" ? "Cancel" : "Hủy"}
            </button>
          </div>
            
          {(actionData?.error || clientError) && (
            <div style={errorBannerStyle}>
              ⚠️ {actionData?.error || clientError}
            </div>
          )}
        </Form>
      </main>
      <Footer language={currentLanguage} />
    </div>
  );
}