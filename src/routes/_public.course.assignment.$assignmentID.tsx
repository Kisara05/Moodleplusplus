import * as React from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useParams, useSearchParams } from "@remix-run/react";
import { getSectionById } from "~/services/course.server";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const courseId = params.courseID;
  const assignmentId = params.assignmentID;
  const url = new URL(request.url);
  const user_flag = parseInt(url.searchParams.get("user_flag") || "1");
  const language = (url.searchParams.get("lang") as "en" | "vi") || "en";
  const userId = url.searchParams.get("userId") || "123";

  if (!courseId) {
    throw new Response("Course ID is missing", { status: 400 });
  }
  if (!assignmentId) {
    throw new Response("Assignment ID is missing", { status: 400 });
  }

  const course = await getSectionById(courseId);
  if (!course) {
    throw new Response("Course not found", { status: 404 });
  }

  // TODO: Load assignment data from backend
  // For now, using mock data
  const hasSubmitted = false; // This should come from backend
  const isGraded = false; // This should come from backend

  return json({
    course,
    assignmentId,
    user_flag,
    language,
    userId,
    hasSubmitted,
    isGraded,
  });
}

interface UploadedFile {
  id: string;
  name: string;
  file: File;
  size: number;
}

export default function AssignmentSubmission() {
  const { course, assignmentId, user_flag, language, userId, hasSubmitted: initialHasSubmitted, isGraded: initialIsGraded } = useLoaderData<typeof loader>();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentLanguage, setCurrentLanguage] = React.useState<"en" | "vi">(language);
  const [hasSubmitted, setHasSubmitted] = React.useState(initialHasSubmitted);
  const [isGraded, setIsGraded] = React.useState(initialIsGraded);
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);
  const [savedFiles, setSavedFiles] = React.useState<UploadedFile[]>([]); // Files that were saved
  const [isEditing, setIsEditing] = React.useState(false); // Whether user is in edit mode
  const [showAddSubmission, setShowAddSubmission] = React.useState(false); // Whether to show add submission form
  const [isOwnWork, setIsOwnWork] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingFile, setEditingFile] = React.useState<UploadedFile | null>(null);
  const [editingFileName, setEditingFileName] = React.useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showErrorModal, setShowErrorModal] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
  const [showCheckboxError, setShowCheckboxError] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const toggleLanguage = () => {
    const newLang = currentLanguage === "en" ? "vi" : "en";
    setCurrentLanguage(newLang);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("lang", newLang);
    setSearchParams(newParams);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (20MB = 20 * 1024 * 1024 bytes)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMessage(
        currentLanguage === "en"
          ? `The file ${file.name} is too large. The maximum size you can upload is 20MB`
          : `Tệp ${file.name} quá lớn. Kích thước tối đa bạn có thể tải lên là 20MB`
      );
      setShowErrorModal(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Check if already have 5 files
    if (uploadedFiles.length >= 5) {
      return;
    }

    const newFile: UploadedFile = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      file: file,
      size: file.size,
    };

    setUploadedFiles([...uploadedFiles, newFile]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileClick = (file: UploadedFile) => {
    setEditingFile(file);
    setEditingFileName(file.name);
    setShowEditModal(true);
  };

  const handleUpdateFile = () => {
    if (!editingFile) return;

    // Validate: cannot change extension
    const oldExt = editingFile.name.split('.').pop();
    const newExt = editingFileName.split('.').pop();
    if (oldExt !== newExt) {
      setErrorMessage(
        currentLanguage === "en"
          ? "You cannot change the file extension"
          : "Bạn không thể thay đổi phần mở rộng của tệp"
      );
      setShowErrorModal(true);
      return;
    }

    const updatedFiles = uploadedFiles.map(f =>
      f.id === editingFile.id ? { ...f, name: editingFileName } : f
    );
    setUploadedFiles(updatedFiles);
    setShowEditModal(false);
    setEditingFile(null);
    setEditingFileName("");
  };

  const handleDeleteFile = () => {
    if (!editingFile) return;
    const updatedFiles = uploadedFiles.filter(f => f.id !== editingFile.id);
    setUploadedFiles(updatedFiles);
    setShowEditModal(false);
    setShowDeleteConfirm(false);
    setEditingFile(null);
    setEditingFileName("");
  };

  const handleSaveChanges = () => {
    if (!isOwnWork) {
      setShowCheckboxError(true);
      return;
    }

    // Save files
    setSavedFiles([...uploadedFiles]);
    
    // If no files uploaded, reset submission status
    if (uploadedFiles.length === 0) {
      setHasSubmitted(false);
      setShowAddSubmission(false); // Hide the form, show button again
    } else {
      setHasSubmitted(true);
    }
    
    setIsEditing(false);
    setUploadedFiles([]);
    setIsOwnWork(false);
    setShowAddSubmission(false); // Hide the form after saving
  };

  const handleCancel = () => {
    if (uploadedFiles.length > 0 || isOwnWork) {
      setShowCancelConfirm(true);
    } else {
      // If no changes, just exit edit mode and hide form
      setIsEditing(false);
      setUploadedFiles([]);
      setShowAddSubmission(false);
    }
  };

  const handleConfirmCancel = () => {
    // Discard changes and exit edit mode
    setUploadedFiles([]);
    setIsOwnWork(false);
    setIsEditing(false);
    setShowAddSubmission(false); // Hide the form
    setShowCancelConfirm(false);
  };

  const handleEditSubmission = () => {
    setUploadedFiles([...savedFiles]);
    setIsOwnWork(true); // Assume they already checked it before
    setIsEditing(true);
    setShowAddSubmission(true); // Show the form when editing
  };

  const handleAddSubmission = () => {
    setShowAddSubmission(true);
    setUploadedFiles([]);
    setIsOwnWork(false);
  };

  const courseID = params.courseID || "";
  const courseName = Array.isArray(course.course)
    ? course.course[0]?.course_name
    : course.course?.course_name || course.course_name || course.course_id || "Course";

  // Styles
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
    width: "100%",
    margin: "0 auto",
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

  const assignmentTitleStyle: React.CSSProperties = {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#000000",
    marginBottom: "2rem",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#FFFFFF",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#2C8B85",
    marginBottom: "1rem",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
  };

  const tableRowStyle: React.CSSProperties = {
    borderBottom: "1px solid #e0e0e0",
  };

  const tableCellStyle: React.CSSProperties = {
    padding: "0.75rem 0",
    fontSize: "0.95rem",
  };

  const tableLabelStyle: React.CSSProperties = {
    ...tableCellStyle,
    fontWeight: "500",
    color: "#333",
    width: "40%",
  };

  const tableValueStyle: React.CSSProperties = {
    ...tableCellStyle,
    color: "#666",
  };

  const checkboxStyle: React.CSSProperties = {
    width: "20px",
    height: "20px",
    marginRight: "0.5rem",
    cursor: "pointer",
  };

  const fileUploadAreaStyle: React.CSSProperties = {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    marginTop: "1rem",
  };

  const fileItemStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
    padding: "0.5rem",
    borderRadius: "4px",
    transition: "background-color 0.2s",
  };

  const fileIconStyle: React.CSSProperties = {
    width: "48px",
    height: "48px",
    backgroundColor: "#FF0000",
    borderRadius: "8px",
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
    borderRadius: "8px",
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
    backgroundColor: "#2C8B85",
    color: "#FFFFFF",
    borderRadius: "8px",
    padding: "0.75rem 2rem",
    border: "none",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
  };

  const cancelButtonStyle: React.CSSProperties = {
    backgroundColor: "#FFFFFF",
    color: "#000000",
    borderRadius: "8px",
    padding: "0.75rem 2rem",
    border: "2px solid #D9D9D9",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
  };

  // Modal styles
  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    padding: "2rem",
    maxWidth: "500px",
    width: "90%",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  };

  const modalHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  };

  const modalTitleStyle: React.CSSProperties = {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#333",
  };

  const closeButtonStyle: React.CSSProperties = {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "1.5rem",
    color: "#666",
    padding: "0.25rem 0.5rem",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "2px solid #D9D9D9",
    borderRadius: "8px",
    outline: "none",
    marginBottom: "1rem",
  };

  const modalButtonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
    marginTop: "1.5rem",
  };

  const greenButtonStyle: React.CSSProperties = {
    backgroundColor: "#0A853F",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
  };

  const orangeButtonStyle: React.CSSProperties = {
    backgroundColor: "#FF6B35",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
  };

  // Determine which files to show
  const filesToShow = isEditing ? uploadedFiles : (hasSubmitted ? savedFiles : uploadedFiles);

  return (
    <div style={containerStyle}>
      <Header
        signed_in={true}
        user_flag={user_flag}
        language={currentLanguage}
        onLanguageChange={toggleLanguage}
        userId={userId}
      />
      <main style={mainStyle}>
        {/* Filter Bar */}
        <div style={filterBarStyle}>
          <button style={activeFilterButtonStyle}>2025 - 2026</button>
          <button style={activeFilterButtonStyle}>
            {currentLanguage === "en" ? "Semester 1" : "Học kỳ 1"}
          </button>
          <button style={filterButtonStyle}>Advanced Program (APCS)</button>
        </div>

        {/* Course Title */}
        <h1 style={courseTitleStyle}>{courseName}</h1>
        <h2 style={assignmentTitleStyle}>
          {currentLanguage === "en" ? "Assignment 1" : "Bài tập 1"}
        </h2>

        {/* Assignment Details */}
        <div style={cardStyle}>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>{currentLanguage === "en" ? "Opened:" : "Mở:"}</strong>{" "}
            {currentLanguage === "en" ? "Friday, 31 October 2025, 12:00 AM" : "Thứ Sáu, 31 Tháng Mười 2025, 12:00 SA"}
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>{currentLanguage === "en" ? "Due:" : "Hạn nộp:"}</strong>{" "}
            {currentLanguage === "en" ? "Thursday, 4 December 2025, 11:59 PM" : "Thứ Năm, 4 Tháng Mười Hai 2025, 11:59 CH"}
          </div>
          <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={fileIconStyle}>📄</div>
            <span style={{ fontWeight: "500" }}>
              {currentLanguage === "en" ? "PA3 - Format" : "PA3 - Định dạng"}
            </span>
          </div>
          <div style={{ marginTop: "0.5rem", color: "#666" }}>
            {currentLanguage === "en"
              ? "You must copy all documents to the directory named PA3-Group[Groped] and compressed the whole directory to zip/rear file. For example: PA3-Group01.zip"
              : "Bạn phải sao chép tất cả tài liệu vào thư mục có tên PA3-Group[Groped] và nén toàn bộ thư mục thành tệp zip/rear. Ví dụ: PA3-Group01.zip"}
          </div>
        </div>

        {/* Submission Status */}
        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>
            {currentLanguage === "en" ? "Submission status" : "Trạng thái nộp bài"}
          </h3>
          <table style={tableStyle}>
            <tbody>
              <tr style={tableRowStyle}>
                <td style={tableLabelStyle}>
                  {currentLanguage === "en" ? "Submission status:" : "Trạng thái nộp bài:"}
                </td>
                <td style={tableValueStyle}>
                  {hasSubmitted
                    ? (currentLanguage === "en" ? "Submitted for grading" : "Đã nộp để chấm điểm")
                    : (currentLanguage === "en" ? "No submissions have been made yet" : "Chưa có bài nộp nào")}
                </td>
              </tr>
              <tr style={tableRowStyle}>
                <td style={tableLabelStyle}>
                  {currentLanguage === "en" ? "Grading status:" : "Trạng thái chấm điểm:"}
                </td>
                <td style={tableValueStyle}>
                  {isGraded
                    ? (currentLanguage === "en" ? "Graded" : "Đã chấm điểm")
                    : (currentLanguage === "en" ? "Not graded" : "Chưa chấm điểm")}
                </td>
              </tr>
              <tr style={tableRowStyle}>
                <td style={tableLabelStyle}>
                  {currentLanguage === "en" ? "Time remaining:" : "Thời gian còn lại:"}
                </td>
                <td style={tableValueStyle}>
                  {currentLanguage === "en" ? "1 day remaining" : "Còn 1 ngày"}
                </td>
              </tr>
              {hasSubmitted && filesToShow.length > 0 && (
                <tr style={tableRowStyle}>
                  <td style={tableLabelStyle}>
                    {currentLanguage === "en" ? "File submissions:" : "Tệp đã nộp:"}
                  </td>
                  <td style={tableValueStyle}>
                    {filesToShow.map((file, index) => (
                      <span key={file.id}>
                        {file.name}
                        {index < filesToShow.length - 1 && ", "}
                      </span>
                    ))}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Submission Button (when not submitted and form not shown) */}
        {!hasSubmitted && !showAddSubmission && (
          <div style={cardStyle}>
            <button
              onClick={handleAddSubmission}
              style={{
                ...saveButtonStyle,
                backgroundColor: "#2C8B85",
              }}
            >
              {currentLanguage === "en" ? "Add submission" : "Thêm bài nộp"}
            </button>
          </div>
        )}

        {/* Add/Edit Submission Form (when button is clicked) */}
        {((!hasSubmitted && showAddSubmission) || (hasSubmitted && isEditing && showAddSubmission)) && (
          <div style={cardStyle}>
            <h3 style={sectionTitleStyle}>
              {isEditing
                ? (currentLanguage === "en" ? "Edit submission" : "Chỉnh sửa bài nộp")
                : (currentLanguage === "en" ? "Add submission" : "Thêm bài nộp")}
            </h3>
            <label style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={isOwnWork}
                onChange={(e) => setIsOwnWork(e.target.checked)}
                style={checkboxStyle}
              />
              <span>
                {currentLanguage === "en"
                  ? "This assignment is my own work, except where I have acknowledged the use of the works of other people."
                  : "Bài tập này là công việc của riêng tôi, ngoại trừ những nơi tôi đã thừa nhận việc sử dụng tác phẩm của người khác."}
              </span>
            </label>

            <div style={fileUploadAreaStyle}>
              {filesToShow.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  style={fileItemStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f0f0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={fileIconStyle}>📄</div>
                  <span style={{ fontSize: "0.875rem", textAlign: "center", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {file.name.length > 15 ? file.name.substring(0, 15) + "..." : file.name}
                  </span>
                </div>
              ))}
              {filesToShow.length < 5 && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={addButtonStyle}
                    disabled={filesToShow.length >= 5}
                  >
                    +
                  </button>
                  <span style={{ color: "#565656", alignSelf: "center" }}>
                    {currentLanguage === "en" ? "Add" : "Thêm"}
                  </span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />

            <div style={buttonGroupStyle}>
              <button onClick={handleSaveChanges} style={saveButtonStyle}>
                {currentLanguage === "en" ? "Save changes" : "Lưu thay đổi"}
              </button>
              <button onClick={handleCancel} style={cancelButtonStyle}>
                {currentLanguage === "en" ? "Cancel" : "Hủy"}
              </button>
            </div>
          </div>
        )}

        {/* Edit Submission Button (when already submitted and not editing) */}
        {hasSubmitted && !isEditing && !showAddSubmission && (
          <div style={cardStyle}>
            <button
              onClick={handleEditSubmission}
              style={{
                ...saveButtonStyle,
                backgroundColor: "#2C8B85",
              }}
            >
              {currentLanguage === "en" ? "Edit submission" : "Chỉnh sửa bài nộp"}
            </button>
          </div>
        )}
      </main>
      <Footer language={currentLanguage} />

      {/* Edit File Modal */}
      {showEditModal && editingFile && (
        <div style={modalOverlayStyle} onClick={() => setShowEditModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={modalTitleStyle}>
                {currentLanguage === "en" ? `Edit ${editingFile.name}` : `Chỉnh sửa ${editingFile.name}`}
              </h3>
              <button style={closeButtonStyle} onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <button style={greenButtonStyle}>
                {currentLanguage === "en" ? "Download" : "Tải xuống"}
              </button>
              <button
                style={{ ...orangeButtonStyle, marginLeft: "0.5rem" }}
                onClick={() => setShowDeleteConfirm(true)}
              >
                {currentLanguage === "en" ? "Delete" : "Xóa"}
              </button>
            </div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              {currentLanguage === "en" ? "Name" : "Tên"}
            </label>
            <input
              type="text"
              value={editingFileName}
              onChange={(e) => setEditingFileName(e.target.value)}
              style={inputStyle}
            />
            <div style={modalButtonGroupStyle}>
              <button style={greenButtonStyle} onClick={handleUpdateFile}>
                {currentLanguage === "en" ? "Update" : "Cập nhật"}
              </button>
              <button style={orangeButtonStyle} onClick={() => setShowEditModal(false)}>
                {currentLanguage === "en" ? "Cancel" : "Hủy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={modalOverlayStyle} onClick={() => setShowDeleteConfirm(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={modalTitleStyle}>
              {currentLanguage === "en" ? "Confirm Delete" : "Xác nhận xóa"}
            </h3>
            <p>
              {currentLanguage === "en"
                ? "Are you sure you want to delete this file?"
                : "Bạn có chắc chắn muốn xóa tệp này không?"}
            </p>
            <div style={modalButtonGroupStyle}>
              <button style={greenButtonStyle} onClick={handleDeleteFile}>
                {currentLanguage === "en" ? "Yes" : "Có"}
              </button>
              <button style={orangeButtonStyle} onClick={() => setShowDeleteConfirm(false)}>
                {currentLanguage === "en" ? "No" : "Không"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div style={modalOverlayStyle} onClick={() => setShowErrorModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={{ ...modalTitleStyle, color: "#FF0000" }}>
                {currentLanguage === "en" ? "Error" : "Lỗi"}
              </h3>
              <button style={closeButtonStyle} onClick={() => setShowErrorModal(false)}>
                ×
              </button>
            </div>
            <p>{errorMessage}</p>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button style={greenButtonStyle} onClick={() => setShowErrorModal(false)}>
                {currentLanguage === "en" ? "OK" : "Đồng ý"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div style={modalOverlayStyle} onClick={() => setShowCancelConfirm(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={modalTitleStyle}>
              {currentLanguage === "en" ? "Confirm Cancel" : "Xác nhận hủy"}
            </h3>
            <p>
              {currentLanguage === "en"
                ? "Are you sure you want to discard all changes?"
                : "Bạn có chắc chắn muốn hủy tất cả thay đổi không?"}
            </p>
            <div style={modalButtonGroupStyle}>
              <button style={greenButtonStyle} onClick={handleConfirmCancel}>
                {currentLanguage === "en" ? "Yes" : "Có"}
              </button>
              <button style={orangeButtonStyle} onClick={() => setShowCancelConfirm(false)}>
                {currentLanguage === "en" ? "No" : "Không"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkbox Error Modal */}
      {showCheckboxError && (
        <div style={modalOverlayStyle} onClick={() => setShowCheckboxError(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={{ ...modalTitleStyle, color: "#FF0000" }}>
                {currentLanguage === "en" ? "Error" : "Lỗi"}
              </h3>
              <button style={closeButtonStyle} onClick={() => setShowCheckboxError(false)}>
                ×
              </button>
            </div>
            <p>
              {currentLanguage === "en"
                ? "Please check the box to confirm this assignment is your own work."
                : "Vui lòng tích vào ô để xác nhận bài tập này là công việc của riêng bạn."}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button style={greenButtonStyle} onClick={() => setShowCheckboxError(false)}>
                {currentLanguage === "en" ? "OK" : "Đồng ý"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
