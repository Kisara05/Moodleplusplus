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
  const type = parseInt(url.searchParams.get("type") || "1"); // 1=assignment, 2=file, 3=folder
  const resourceId = url.searchParams.get("resourceId") || null;

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
      type,
      resourceId,
    });
  } catch (error) {
    console.error("Error loading section data:", error);
    return json({
      signed_in,
      user_flag,
      language,
      sectionId,
      section: null,
      type,
      resourceId: null,
    });
  }
}

interface UploadedItem {
  file: File;
  name: string;
  type: 'file' | 'folder';
}

export default function UploadResource() {
  const { signed_in, user_flag, language, sectionId, section, type, resourceId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "vi">(language);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
  const [publishImmediate, setPublishImmediate] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDurationCalendar, setShowDurationCalendar] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Publish time state
  const [publishHour, setPublishHour] = useState(16);
  const [publishMinute, setPublishMinute] = useState(0);
  const [publishSecond, setPublishSecond] = useState(0);
  const [publishDate, setPublishDate] = useState(new Date());

  // Duration time state
  const [durationHour, setDurationHour] = useState(23);
  const [durationMinute, setDurationMinute] = useState(59);
  const [durationSecond, setDurationSecond] = useState(59);
  const [durationDate, setDurationDate] = useState(new Date());

  const getResourceTypeLabel = () => {
    switch (type) {
      case 1:
        return currentLanguage === "en" ? "Assignment" : "Bài tập";
      case 2:
        return currentLanguage === "en" ? "File" : "Tệp";
      case 3:
        return currentLanguage === "en" ? "Folder" : "Thư mục";
      default:
        return "";
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newItems: UploadedItem[] = Array.from(files).map(file => ({
        file,
        name: file.name,
        type: 'file'
      }));
      setUploadedItems([...uploadedItems, ...newItems]);
    }
  };

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newItems: UploadedItem[] = Array.from(files).map(file => ({
        file,
        name: file.webkitRelativePath || file.name,
        type: 'folder'
      }));
      setUploadedItems([...uploadedItems, ...newItems]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setUploadedItems(uploadedItems.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = () => {
    // TODO: Save to backend - collect all form data
    const formData = {
      type,
      name,
      description,
      uploadedItems,
      publishImmediate,
      publishTime: publishImmediate ? null : {
        hour: publishHour,
        minute: publishMinute,
        second: publishSecond,
        date: publishDate
      },
      duration: type === 1 ? {
        hour: durationHour,
        minute: durationMinute,
        second: durationSecond,
        date: durationDate
      } : null
    };
    console.log("Form data to be sent to backend:", formData);
    
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

  const incrementTime = (setter: (value: number) => void, value: number, max: number) => {
    setter(value >= max ? 0 : value + 1);
  };

  const decrementTime = (setter: (value: number) => void, value: number, max: number) => {
    setter(value <= 0 ? max : value - 1);
  };

  const formatTime = (value: number) => {
    return value.toString().padStart(2, '0');
  };

  const renderCalendar = (selectedDate: Date, onDateSelect: (date: Date) => void) => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const days = [];
    // Adjust for Monday as first day of week
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(<div key={`empty-${i}`} style={calendarDayEmptyStyle}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === today.toDateString();
      days.push(
        <div
          key={day}
          style={calendarDayStyle(isSelected, isToday)}
          onClick={() => onDateSelect(date)}
        >
          {day}
        </div>
      );
    }

    return (
      <div style={calendarContainerStyle}>
        <div style={calendarHeaderStyle}>
          <button
            type="button"
            style={calendarNavButtonStyle}
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() - 1);
              onDateSelect(newDate);
            }}
          >
            ◀
          </button>
          <span style={calendarMonthYearStyle}>
            {selectedDate.toLocaleString(currentLanguage === "en" ? "en-US" : "vi-VN", { month: 'long', year: 'numeric' })}
          </span>
          <button
            type="button"
            style={calendarNavButtonStyle}
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setMonth(newDate.getMonth() + 1);
              onDateSelect(newDate);
            }}
          >
            ▶
          </button>
        </div>
        <div style={calendarWeekHeaderStyle}>
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
            <div key={day} style={calendarWeekDayStyle}>{day}</div>
          ))}
        </div>
        <div style={calendarGridStyle}>
          {days}
        </div>
      </div>
    );
  };

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
    maxWidth: "1000px",
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
    backgroundColor: "#2C8B85",
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

  const sectionStyle: React.CSSProperties = {
    marginBottom: "1.5rem",
  };

  const sectionHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1rem",
    cursor: "pointer",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#2C8B85",
    margin: 0,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#000000",
    marginBottom: "0.5rem",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "2px solid #D9D9D9",
    borderRadius: "8px",
    outline: "none",
    fontFamily: "inherit",
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: "100px",
    resize: "vertical",
  };

  const fileUploadAreaStyle: React.CSSProperties = {
    border: "2px solid #D9D9D9",
    borderRadius: "8px",
    padding: "1rem",
    minHeight: "150px",
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    alignItems: "flex-start",
    alignContent: "flex-start",
  };

  const addButtonStyle: React.CSSProperties = {
    width: "100px",
    height: "100px",
    border: "2px dashed #2C8B85",
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    color: "#2C8B85",
    fontSize: "3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexDirection: "column",
  };

  const fileItemStyle: React.CSSProperties = {
    width: "100px",
    height: "100px",
    border: "2px solid #2C8B85",
    borderRadius: "8px",
    backgroundColor: "#F5F5F5",
    padding: "0.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  };

  const removeButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "0.25rem",
    right: "0.25rem",
    backgroundColor: "#FF0000",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "bold",
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
    borderRadius: "4px",
    border: "2px solid #565656",
    position: "relative",
    backgroundColor: "#FFFFFF",
  };

  const radioButtonCheckedStyle: React.CSSProperties = {
    ...radioButtonStyle,
    backgroundColor: "#2C8B85",
    borderColor: "#2C8B85",
  };

  const timeInputGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    marginTop: "0.5rem",
  };

  const timeInputContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.25rem",
  };

  const chevronButtonStyle: React.CSSProperties = {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    color: "#2C8B85",
    padding: "0",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const timeDisplayStyle: React.CSSProperties = {
    width: "60px",
    padding: "0.5rem",
    textAlign: "center",
    fontSize: "1rem",
    border: "2px solid #D9D9D9",
    borderRadius: "8px",
  };

  const dateInputStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    border: "2px solid #D9D9D9",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "#FFFFFF",
  };

  const calendarIconStyle: React.CSSProperties = {
    fontSize: "1.2rem",
  };

  const calendarContainerStyle: React.CSSProperties = {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    border: "2px solid #D9D9D9",
    borderRadius: "8px",
    padding: "1rem",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    zIndex: 100,
    marginTop: "0.5rem",
  };

  const calendarHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  };

  const calendarNavButtonStyle: React.CSSProperties = {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    color: "#2C8B85",
    padding: "0.5rem",
  };

  const calendarMonthYearStyle: React.CSSProperties = {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#2C8B85",
  };

  const calendarWeekHeaderStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "0.25rem",
    marginBottom: "0.5rem",
  };

  const calendarWeekDayStyle: React.CSSProperties = {
    textAlign: "center",
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#565656",
    padding: "0.25rem",
  };

  const calendarGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "0.25rem",
  };

  const calendarDayStyle = (isSelected: boolean, isToday: boolean): React.CSSProperties => ({
    textAlign: "center",
    padding: "0.5rem",
    cursor: "pointer",
    borderRadius: "4px",
    fontSize: "0.9rem",
    backgroundColor: isSelected ? "#2C8B85" : isToday ? "#E0F2F1" : "transparent",
    color: isSelected ? "#FFFFFF" : "#000000",
    fontWeight: isToday ? "600" : "400",
  });

  const calendarDayEmptyStyle: React.CSSProperties = {
    padding: "0.5rem",
  };

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
    borderRadius: "12px",
    maxWidth: "500px",
    width: "90%",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
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
          <button style={activeFilterButtonStyle}>
            {currentLanguage === "en" ? "Semester 1" : "Học kỳ 1"}
          </button>
          <button style={activeFilterButtonStyle}>
            {currentLanguage === "en" ? "Advanced Program (APCS)" : "Chương trình tiên tiến (APCS)"}
          </button>
        </div>

        {/* Course Title */}
        <h1 style={courseTitleStyle}>
          {section?.course?.course_name || "Element of Software Engineering"} - {section?.class_name || "23TT1"}
        </h1>
        <div style={pageSubtitleStyle}>
          {resourceId
            ? `${currentLanguage === "en" ? "Updating" : "Cập nhật"} ${getResourceTypeLabel()} ${currentLanguage === "en" ? "in Lab" : "trong Lab"}`
            : `${currentLanguage === "en" ? "Creating" : "Tạo"} ${getResourceTypeLabel()} ${currentLanguage === "en" ? "in Lab" : "trong Lab"}`
          }
        </div>

        {/* General Section */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <span style={{ fontSize: "1.2rem" }}>▼</span>
            <h3 style={sectionTitleStyle}>
              {currentLanguage === "en" ? "General" : "Chung"}
            </h3>
          </div>

          {/* Name */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>
              {currentLanguage === "en" ? "Name" : "Tên"}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              placeholder={currentLanguage === "en" ? "Enter name..." : "Nhập tên..."}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>
              {currentLanguage === "en" ? "Description" : "Mô tả"}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={textareaStyle}
              placeholder={currentLanguage === "en" ? "Enter description..." : "Nhập mô tả..."}
            />
          </div>

          {/* Select files */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>
              {currentLanguage === "en" ? "Select files" : "Chọn tệp"}
            </label>
            <div style={fileUploadAreaStyle}>
              {uploadedItems.map((item, index) => (
                <div key={index} style={fileItemStyle}>
                  <button
                    type="button"
                    style={removeButtonStyle}
                    onClick={() => handleRemoveItem(index)}
                  >
                    ×
                  </button>
                  <div style={{ fontSize: "2rem" }}>
                    {item.type === 'folder' ? '📁' : '📄'}
                  </div>
                  <div style={{ fontSize: "0.7rem", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                    {item.name.length > 15 ? item.name.substring(0, 12) + "..." : item.name}
                  </div>
                </div>
              ))}
              <div
                style={addButtonStyle}
                onClick={() => {
                  if (type === 2) {
                    fileInputRef.current?.click();
                  } else if (type === 3) {
                    folderInputRef.current?.click();
                  } else {
                    // For assignment, show both options
                    fileInputRef.current?.click();
                  }
                }}
              >
                <span>+</span>
                <span style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                  {currentLanguage === "en" ? "Add" : "Thêm"}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{ display: "none" }}
                {...(type !== 3 ? {} : { disabled: true })}
              />
              <input
                ref={folderInputRef}
                type="file"
                {...({ webkitdirectory: "", directory: "" } as any)}
                multiple
                onChange={handleFolderUpload}
                style={{ display: "none" }}
                {...(type === 2 ? { disabled: true } : {})}
              />
            </div>
          </div>
        </div>

        {/* Common Module Settings */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <span style={{ fontSize: "1.2rem" }}>▼</span>
            <h3 style={sectionTitleStyle}>
              {currentLanguage === "en" ? "Common module settings" : "Cài đặt module chung"}
            </h3>
          </div>

          {/* Publish immediate */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>
              {currentLanguage === "en" ? "Publish immediate" : "Xuất bản ngay"}
            </label>
            <div style={radioGroupStyle}>
              <label style={radioOptionStyle}>
                <div
                  style={publishImmediate ? radioButtonCheckedStyle : radioButtonStyle}
                  onClick={() => setPublishImmediate(true)}
                >
                  {publishImmediate && (
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
                <span>{currentLanguage === "en" ? "Yes" : "Có"}</span>
              </label>
              <label style={radioOptionStyle}>
                <div
                  style={!publishImmediate ? radioButtonCheckedStyle : radioButtonStyle}
                  onClick={() => setPublishImmediate(false)}
                >
                  {!publishImmediate && (
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
                <span>{currentLanguage === "en" ? "No" : "Không"}</span>
              </label>
            </div>
          </div>

          {/* Publish time - only show if not publishing immediately */}
          {!publishImmediate && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>
                {currentLanguage === "en" ? "Publish time" : "Thời gian xuất bản"}
              </label>
              <div style={timeInputGroupStyle}>
                <div style={timeInputContainerStyle}>
                  <button
                    type="button"
                    style={chevronButtonStyle}
                    onClick={() => incrementTime(setPublishHour, publishHour, 23)}
                  >
                    ▲
                  </button>
                  <input
                    type="text"
                    value={formatTime(publishHour)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 0 && val <= 23) setPublishHour(val);
                    }}
                    style={timeDisplayStyle}
                  />
                  <button
                    type="button"
                    style={chevronButtonStyle}
                    onClick={() => decrementTime(setPublishHour, publishHour, 23)}
                  >
                    ▼
                  </button>
                </div>
                <span>:</span>
                <div style={timeInputContainerStyle}>
                  <button
                    type="button"
                    style={chevronButtonStyle}
                    onClick={() => incrementTime(setPublishMinute, publishMinute, 59)}
                  >
                    ▲
                  </button>
                  <input
                    type="text"
                    value={formatTime(publishMinute)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 0 && val <= 59) setPublishMinute(val);
                    }}
                    style={timeDisplayStyle}
                  />
                  <button
                    type="button"
                    style={chevronButtonStyle}
                    onClick={() => decrementTime(setPublishMinute, publishMinute, 59)}
                  >
                    ▼
                  </button>
                </div>
                <span>:</span>
                <div style={timeInputContainerStyle}>
                  <button
                    type="button"
                    style={chevronButtonStyle}
                    onClick={() => incrementTime(setPublishSecond, publishSecond, 59)}
                  >
                    ▲
                  </button>
                  <input
                    type="text"
                    value={formatTime(publishSecond)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 0 && val <= 59) setPublishSecond(val);
                    }}
                    style={timeDisplayStyle}
                  />
                  <button
                    type="button"
                    style={chevronButtonStyle}
                    onClick={() => decrementTime(setPublishSecond, publishSecond, 59)}
                  >
                    ▼
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    style={dateInputStyle}
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    <span>{publishDate.toLocaleDateString(currentLanguage === "en" ? "en-US" : "vi-VN")}</span>
                    <span style={calendarIconStyle}>📅</span>
                  </button>
                  {showCalendar && (
                    <div>
                      {renderCalendar(publishDate, (date) => {
                        setPublishDate(date);
                        setShowCalendar(false);
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Duration - only show for type 1 (assignment) */}
          {type === 1 && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>
                {currentLanguage === "en" ? "Duration" : "Thời hạn"}
              </label>
              <div style={timeInputGroupStyle}>
                <div style={timeInputContainerStyle}>
                  <button
                    type="button"
                    style={chevronButtonStyle}
                    onClick={() => incrementTime(setDurationHour, durationHour, 23)}
                  >
                    ▲
                  </button>
                  <input
                    type="text"
                    value={formatTime(durationHour)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 0 && val <= 23) setDurationHour(val);
                    }}
                    style={timeDisplayStyle}
                  />
                  <button
                    type="button"
                    style={chevronButtonStyle}
                    onClick={() => decrementTime(setDurationHour, durationHour, 23)}
                  >
                    ▼
                  </button>
                </div>
                <span>:</span>
                <div style={timeInputContainerStyle}>
                  <button
                    type="button"
                    style={chevronButtonStyle}
                    onClick={() => incrementTime(setDurationMinute, durationMinute, 59)}
                  >
                    ▲
                  </button>
                  <input
                    type="text"
                    value={formatTime(durationMinute)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 0 && val <= 59) setDurationMinute(val);
                    }}
                    style={timeDisplayStyle}
                  />
                  <button
                    type="button"
                    style={chevronButtonStyle}
                    onClick={() => decrementTime(setDurationMinute, durationMinute, 59)}
                  >
                    ▼
                  </button>
                </div>
                <span>:</span>
                <div style={timeInputContainerStyle}>
                  <button
                    type="button"
                    style={chevronButtonStyle}
                    onClick={() => incrementTime(setDurationSecond, durationSecond, 59)}
                  >
                    ▲
                  </button>
                  <input
                    type="text"
                    value={formatTime(durationSecond)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 0 && val <= 59) setDurationSecond(val);
                    }}
                    style={timeDisplayStyle}
                  />
                  <button
                    type="button"
                    style={chevronButtonStyle}
                    onClick={() => decrementTime(setDurationSecond, durationSecond, 59)}
                  >
                    ▼
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    style={dateInputStyle}
                    onClick={() => setShowDurationCalendar(!showDurationCalendar)}
                  >
                    <span>{durationDate.toLocaleDateString(currentLanguage === "en" ? "en-US" : "vi-VN")}</span>
                    <span style={calendarIconStyle}>📅</span>
                  </button>
                  {showDurationCalendar && (
                    <div>
                      {renderCalendar(durationDate, (date) => {
                        setDurationDate(date);
                        setShowDurationCalendar(false);
                      })}
                    </div>
                  )}
                </div>
              </div>
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
      </main>

      {/* Confirm Save Dialog */}
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
