import * as React from "react";
import { Link, useNavigate, useLocation, Form, useRouteLoaderData } from "@remix-run/react";
import type { AuthUser } from "~/types/models/user";

type HeaderProps = {
  signed_in?: boolean;
  user_flag?: number; // 1 = student, 0 = teacher/admin
  language?: "en" | "vi";
  onLanguageChange?: () => void;
  userId?: string; // User ID for navigation
};

export function Header({
  signed_in = false,
  user_flag = 1,
  language = "en",
  onLanguageChange,
  userId = "123"
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine which nav link should be active based on current pathname
  const isDashboard = location.pathname === "/dashboard" || location.pathname.startsWith("/dashboard");
  const isMyCourses = location.pathname === "/courses" || location.pathname === "/" || location.pathname.startsWith("/courses/");
  const isCourseRegistration = location.pathname === "/course-registration" || location.pathname.startsWith("/course-registration");

  const [showHelp, setShowHelp] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showMessages, setShowMessages] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  // Get user data when signed in (safely get from route loader)
  // Check both auth and public layouts for user data
  type AuthLayoutData = { user: AuthUser };
  type PublicLayoutData = { user: AuthUser | null };
  const authData = useRouteLoaderData<AuthLayoutData>("routes/_auth/_layout");
  const publicData = useRouteLoaderData<PublicLayoutData>("routes/_public/_layout");
  const user = signed_in && (authData?.user || publicData?.user) ? (authData?.user || publicData?.user) : null;

  /* =========================
     SHARED STYLES (RECTANGULAR)
     ========================= */

  const headerStyle: React.CSSProperties = {
    backgroundColor: "#2c7a7b",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "white",
  };

  const logoStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    textDecoration: "none",
    color: "white",
  };

  const navStyle: React.CSSProperties = {
    display: "flex",
    gap: "2rem",
    alignItems: "center",
  };

  const navLinkStyle: React.CSSProperties = {
    color: "white",
    textDecoration: "none",
    fontSize: "1rem",
    padding: "0.25rem 0",
  };

  const activeNavLinkStyle: React.CSSProperties = {
    ...navLinkStyle,
    borderBottom: "2px solid white",
  };

  const rightSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
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

  const avatarStyle: React.CSSProperties = {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "white",
    cursor: "pointer",
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

  /* =========================
     NOT SIGNED IN HEADER
     ========================= */

  if (!signed_in) {
    return (
      <header style={headerStyle}>
        <Link to="/" style={logoStyle}>
          Moodle++
        </Link>
        <div style={rightSectionStyle}>
          <span style={{ cursor: "pointer" }} onClick={onLanguageChange}>
            {language === "en" ? "English" : "Tiếng Việt"}
          </span>
          <div
            style={{ position: "relative" }}
            onClick={() => setShowHelp(!showHelp)}
          >
            <div style={iconStyle}>?</div>
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

  /* =========================
     SIGNED IN HEADER
     ========================= */

  return (
    <header style={headerStyle}>
      <div style={logoStyle}>
        <Link to={`/courses?signed_in=1&user_flag=${user_flag}`} style={logoStyle}>
          Moodle++
        </Link>
      </div>

      <nav style={navStyle}>
        <Link to="/dashboard?signed_in=1" style={isDashboard ? activeNavLinkStyle : navLinkStyle}>
          {language === "en" ? "Dashboard" : "Trang tổng quan"}
        </Link>
        <Link to="/courses" style={isMyCourses ? activeNavLinkStyle : navLinkStyle}>
          {language === "en" ? "My courses" : "Khóa học của tôi"}
        </Link>
        {user_flag === 1 && (
          <Link 
            to={`/course-registration`}  
            style={isCourseRegistration ? activeNavLinkStyle : navLinkStyle}>
            {language === "en" ? "Course registration" : "Đăng kí học phần"}
          </Link>
        )}
      </nav>

      <div style={rightSectionStyle}>
        {/* Help */}
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

        {/* Notifications */}
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

        {/* Messages */}
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

        {/* Avatar + Menu */}
        <div style={{ position: "relative" }}>
          <div
            style={avatarStyle}
            onClick={() => setShowUserMenu(!showUserMenu)}
          />
          {showUserMenu && (
            <div style={dropdownStyle}>
              <div
                style={dropdownItemStyle}
                onClick={() => {
                  onLanguageChange?.();
                  setShowUserMenu(false);
                }}
              >
                {language === "en" ? "Tiếng Việt" : "English"}
              </div>
              <Link to="/logout">
                <button
                  type="submit"
                  style={{
                    ...dropdownItemStyle,
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    backgroundColor: "transparent",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(false);
                  }}
                >
                  {language === "en" ? "Logout" : "Đăng xuất"}
                </button>
              </Link>
            </div>
          )}
        </div>

        <div
          style={{ 
            position: "relative",
            cursor: "pointer",
          }}
          onClick={() => {
            setShowUserMenu(!showUserMenu);
            setShowHelp(false);
            setShowNotifications(false);
            setShowMessages(false);
          }}
        >
          <span style={{
            color: "white",
            fontSize: "1rem",
            padding: "0.5rem 1rem",
            borderRadius: "25px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            border: "2px solid #FFFFFF",
          }}>
            {user?.full_name || "User"}
          </span>
        </div>
      </div>
    </header>
  );
}