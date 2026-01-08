import { useNavigate } from "@remix-run/react";

interface QuizConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: {
    quizId: string;
    quizName: string;
    answerType: "free_response" | "multiple_choice";
    hasFile?: boolean; // true for multiplechoice2
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
  };
  sectionId: string;
  userFlag: number;
  language: "en" | "vi";
}

export default function QuizConfirmationDialog({
  isOpen,
  onClose,
  quiz,
  sectionId,
  userFlag,
  language,
}: QuizConfirmationDialogProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const formatDateTime = (date: string, hour: string, minute: string, second: string): string => {
    if (!date || !hour || !minute || !second) return "";
    try {
      const dateObj = new Date(date);
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:${second.padStart(2, "0")} ${day}/${month}/${year}`;
    } catch {
      return `${hour}:${minute}:${second} ${date}`;
    }
  };

  const formatTimeLimit = (hour: string, minute: string, second: string): string => {
    if (!hour || !minute || !second) return "";
    return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:${second.padStart(2, "0")}`;
  };

  const getAnswerTypeText = (): string => {
    if (quiz.answerType === "free_response") {
      return language === "en" ? "Free response" : "Tự do trả lời";
    }
    return language === "en" ? "Multiple choice" : "Trắc nghiệm";
  };

  const handleConfirm = () => {
    // Determine which take-quiz route to navigate to based on quiz type
    let route = "";
    
    if (quiz.answerType === "free_response") {
      route = `/courses/${sectionId}/take-quiz-free-response`;
    } else {
      // Multiple choice
      if (quiz.hasFile) {
        route = `/courses/${sectionId}/take-quiz-2`;
      } else {
        route = `/courses/${sectionId}/take-quiz-1`;
      }
    }
    
    navigate(`${route}?signed_in=1&user_flag=${userFlag}&quizId=${quiz.quizId}&lang=${language}`);
    onClose();
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

  const titleStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#2C8B85",
    marginBottom: "1.5rem",
  };

  const infoRowStyle: React.CSSProperties = {
    marginBottom: "0.75rem",
    fontSize: "1rem",
    color: "#000000",
  };

  const questionStyle: React.CSSProperties = {
    marginTop: "1.5rem",
    marginBottom: "1.5rem",
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#000000",
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
    marginTop: "1.5rem",
  };

  const confirmButtonStyle: React.CSSProperties = {
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

  return (
    <div style={dialogOverlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyle}>
          {quiz.quizName} {language === "en" ? "in In-class assignments" : "trong Bài tập trên lớp"}
        </h2>
        
        <div style={infoRowStyle}>
          {language === "en" ? "Type of answer: " : "Loại câu trả lời: "}
          <strong>{getAnswerTypeText()}</strong>
        </div>
        
        {quiz.publishTime && (
          <div style={infoRowStyle}>
            {language === "en" ? "Publish time: " : "Thời gian xuất bản: "}
            <strong>
              {formatDateTime(
                quiz.publishTime.date,
                quiz.publishTime.hour,
                quiz.publishTime.minute,
                quiz.publishTime.second
              )}
            </strong>
          </div>
        )}
        
        {quiz.duration && (
          <div style={infoRowStyle}>
            {language === "en" ? "Duration: " : "Thời lượng: "}
            <strong>
              {formatDateTime(
                quiz.duration.date,
                quiz.duration.hour,
                quiz.duration.minute,
                quiz.duration.second
              )}
            </strong>
          </div>
        )}
        
        {quiz.timeLimit && (
          <div style={infoRowStyle}>
            {language === "en" ? "Time limit: " : "Giới hạn thời gian: "}
            <strong>
              {formatTimeLimit(
                quiz.timeLimit.hour,
                quiz.timeLimit.minute,
                quiz.timeLimit.second
              )}
            </strong>
          </div>
        )}
        
        <div style={questionStyle}>
          {language === "en" 
            ? "Do you confirm your participation in this test?" 
            : "Bạn có xác nhận tham gia bài kiểm tra này không?"}
        </div>
        
        <div style={buttonContainerStyle}>
          <button style={cancelButtonStyle} onClick={onClose}>
            {language === "en" ? "Cancel" : "Hủy"}
          </button>
          <button style={confirmButtonStyle} onClick={handleConfirm}>
            {language === "en" ? "Confirm" : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}
