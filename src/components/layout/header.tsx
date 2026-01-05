import * as React from "react";
import { Link, useNavigate } from "@remix-run/react";

type HeaderProps = {
  signed_in?: boolean;
  user_flag?: number; // 1 = student, 0 = teacher/admin
  language?: "en" | "vi";
  onLanguageChange?: () => void;
};

export function Header({ 
  signed_in = false, 
  user_flag = 1,
  language = "en",
  onLanguageChange
}: HeaderProps) {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showMessages, setShowMessages] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const headerStyle: React.CSSProperties = {
    backgroundColor: signed_in ? "#2C8B85" : "#2C8B85",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: signed_in ? "0 0 25px 25px" : "0",
    color: "#FFFFFF",
  };

  const logoSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  };

  const logoStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#FFFFFF",
    textDecoration: "none",
    backgroundColor: signed_in ? "#0A853F" : "transparent",
    padding: signed_in ? "0.5rem 1rem" : "0",
    borderRadius: signed_in ? "25px" : "0",
  };

  const navStyle: React.CSSProperties = {
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
  };

  const navLinkStyle: React.CSSProperties = {
    color: "#FFFFFF",
    textDecoration: "none",
    fontSize: "1rem",
    cursor: "pointer",
    padding: "0.5rem 1rem",
    borderRadius: "25px",
    transition: "background-color 0.2s",
  };

  const iconStyle: React.CSSProperties = {
    width: "32px",
    height: "32px",
    borderRadius: "25px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#FFFFFF",
    fontSize: "1.2rem",
    border: "2px solid #FFFFFF",
    overflow: "hidden",
  };

  const iconImageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: "6px",
  };

  const userAvatarStyle: React.CSSProperties = {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "#D9D9D9",
    cursor: "pointer",
    border: "2px solid #FFFFFF",
  };

  const dropdownStyle: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    right: "0",
    marginTop: "0.5rem",
    backgroundColor: "#FFFFFF",
    borderRadius: "25px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    padding: "1rem",
    minWidth: "200px",
    zIndex: 1000,
  };

  const dropdownItemStyle: React.CSSProperties = {
    padding: "0.75rem",
    cursor: "pointer",
    borderRadius: "25px",
    marginBottom: "0.5rem",
    color: "#000000",
  };

  const notificationBoxStyle: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    right: "0",
    marginTop: "0.5rem",
    backgroundColor: "#FFFFFF",
    borderRadius: "25px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    padding: "1rem",
    minWidth: "300px",
    maxHeight: "400px",
    overflowY: "auto",
    zIndex: 1000,
  };

  if (!signed_in) {
    // Type 2: Not signed in (Login page header)
    return (
      <header style={headerStyle}>
        <div style={logoSectionStyle}>
          <Link to="/" style={logoStyle}>
            Moodle++
          </Link>
        </div>
        <div style={navStyle}>
          <span style={{ cursor: "pointer" }} onClick={onLanguageChange}>
            {language === "en" ? "English" : "Tiếng Việt"}
          </span>
          <div
            style={{ ...iconStyle, position: "relative" }}
            onClick={() => setShowHelp(!showHelp)}
          >
            <img 
              src="/icons/help.png" 
              alt="Help" 
              style={iconImageStyle}
              onError={(e) => {
                // Fallback to text if image not found
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) parent.textContent = "?";
              }}
            />
            {showHelp && (
              <div style={notificationBoxStyle}>
                <h3 style={{ margin: "0 0 1rem 0", color: "#000000" }}>
                  {language === "en" ? "Instructions" : "Hướng dẫn"}
                </h3>
                <p style={{ color: "#565656", fontSize: "0.9rem" }}>
                  {language === "en"
                    ? "Welcome to Moodle++. Please enter your User ID and Password to login."
                    : "Chào mừng đến với Moodle++. Vui lòng nhập User ID và Mật khẩu để đăng nhập."}
                </p>
                <button
                  onClick={() => setShowHelp(false)}
                  style={{
                    marginTop: "1rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "25px",
                    backgroundColor: "#2C8B85",
                    color: "#FFFFFF",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {language === "en" ? "Close" : "Đóng"}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Type 1: Signed in (Main screen header)
  return (
    <header style={headerStyle}>
      <div style={logoSectionStyle}>
        <div style={logoStyle}>Moodle++</div>
      </div>
      <div style={navStyle}>
        <Link to="/" style={navLinkStyle}>
          Dashboard
        </Link>
        <Link to="/courses" style={navLinkStyle}>
          My courses
        </Link>
        {user_flag === 1 && (
          <Link to="/course-registration" style={navLinkStyle}>
            Course registration
          </Link>
        )}
        {user_flag !== 1 && (
          <span
            style={{
              ...navLinkStyle,
              opacity: 0.5,
              cursor: "not-allowed",
              pointerEvents: "none",
            }}
          >
            Course registration
          </span>
        )}
        <div style={{ position: "relative" }}>
          <div
            style={iconStyle}
            onClick={() => {
              setShowHelp(!showHelp);
              setShowNotifications(false);
              setShowMessages(false);
            }}
          >
            <img 
              src="/icons/help.png" 
              alt="Help" 
              style={iconImageStyle}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) parent.textContent = "?";
              }}
            />
            {showHelp && (
              <div style={notificationBoxStyle}>
                <h3 style={{ margin: "0 0 1rem 0", color: "#000000" }}>
                  {language === "en" ? "Instructions" : "Hướng dẫn"}
                </h3>
                <p style={{ color: "#565656", fontSize: "0.9rem" }}>
                  {language === "en"
                    ? "This is the main dashboard. You can navigate to courses, register for new courses, and manage your account."
                    : "Đây là bảng điều khiển chính. Bạn có thể điều hướng đến các khóa học, đăng ký khóa học mới và quản lý tài khoản của mình."}
                </p>
                <button
                  onClick={() => setShowHelp(false)}
                  style={{
                    marginTop: "1rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "25px",
                    backgroundColor: "#2C8B85",
                    color: "#FFFFFF",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {language === "en" ? "Close" : "Đóng"}
                </button>
              </div>
            )}
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div
            style={iconStyle}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowHelp(false);
              setShowMessages(false);
            }}
          >
            <img 
              src="/icons/bell.png" 
              alt="Notifications" 
              style={iconImageStyle}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) parent.textContent = "🔔";
              }}
            />
            {showNotifications && (
              <div style={notificationBoxStyle}>
                <h3 style={{ margin: "0 0 1rem 0", color: "#000000" }}>
                  {language === "en" ? "Announcements" : "Thông báo"}
                </h3>
                <div style={{ color: "#565656", fontSize: "0.9rem" }}>
                  {language === "en"
                    ? "No new announcements."
                    : "Không có thông báo mới."}
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div
            style={iconStyle}
            onClick={() => {
              setShowMessages(!showMessages);
              setShowHelp(false);
              setShowNotifications(false);
            }}
          >
            <img 
              src="/icons/message.png" 
              alt="Messages" 
              style={iconImageStyle}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) parent.textContent = "💬";
              }}
            />
            {showMessages && (
              <div style={notificationBoxStyle}>
                <h3 style={{ margin: "0 0 1rem 0", color: "#000000" }}>
                  {language === "en" ? "Messages" : "Tin nhắn"}
                </h3>
                <div style={{ color: "#565656", fontSize: "0.9rem" }}>
                  {language === "en"
                    ? "No new messages."
                    : "Không có tin nhắn mới."}
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div
            style={userAvatarStyle}
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowHelp(false);
              setShowNotifications(false);
              setShowMessages(false);
            }}
          />
          {showUserMenu && (
            <div style={dropdownStyle}>
              <div
                style={dropdownItemStyle}
                onClick={() => {
                  if (onLanguageChange) onLanguageChange();
                  setShowUserMenu(false);
                }}
              >
                {language === "en" ? "Tiếng Việt" : "English"}
              </div>
              <div
                style={dropdownItemStyle}
                onClick={() => {
                  // Handle logout
                  navigate("/login");
                  setShowUserMenu(false);
                }}
              >
                {language === "en" ? "Logout" : "Đăng xuất"}
              </div>
            </div>
          )}
        </div>
        <div
          style={{ ...iconStyle }}
          onClick={() => {
            setShowUserMenu(!showUserMenu);
            setShowHelp(false);
            setShowNotifications(false);
            setShowMessages(false);
          }}
        >
          <img 
            src="/icons/chevron-down.png" 
            alt="Menu" 
            style={iconImageStyle}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) parent.textContent = "▼";
            }}
          />
        </div>
      </div>
    </header>
  );
}
