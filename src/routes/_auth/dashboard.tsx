import * as React from "react";
import { useSearchParams } from "@remix-run/react";
import { useAuth } from "~/hooks/useAuth";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";

export default function DashboardPage() {
  const { user, isStudent, isTeacher, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentLanguage, setCurrentLanguage] = React.useState<"en" | "vi">(
    (searchParams.get("lang") as "en" | "vi") || "en"
  );

  const user_flag = isStudent ? 1 : 0;

  const toggleLanguage = () => {
    const newLang = currentLanguage === "en" ? "vi" : "en";
    setCurrentLanguage(newLang);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("lang", newLang);
    setSearchParams(newParams);
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
    width: "100%",
  };

  const dashboardTitleStyle: React.CSSProperties = {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#0A853F",
    marginBottom: "2rem",
  };

  const welcomeTextStyle: React.CSSProperties = {
    fontSize: "1.25rem",
    color: "#666",
    marginBottom: "2rem",
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: "3rem",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#0A853F",
    marginBottom: "1.5rem",
  };

  const statsGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  };

  const statCardStyle = (color: string): React.CSSProperties => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
      green: { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
      purple: { bg: "#FAF5FF", text: "#6B21A8", border: "#E9D5FF" },
      yellow: { bg: "#FEFCE8", text: "#854D0E", border: "#FDE047" },
    };
    const colors = colorMap[color] || colorMap.blue;
    return {
      padding: "1.5rem",
      borderRadius: "8px",
      border: `2px solid ${colors.border}`,
      backgroundColor: colors.bg,
    };
  };

  const statTitleStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: "500",
    opacity: 0.75,
    color: "#333",
    marginBottom: "0.5rem",
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "0.25rem",
  };

  const statDescriptionStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    opacity: 0.75,
    color: "#333",
  };

  const profileCardStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  };

  const profileTitleStyle: React.CSSProperties = {
    fontSize: "1.25rem",
    fontWeight: "600",
    marginBottom: "1.5rem",
    color: "#333",
  };

  const infoRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.75rem 0",
    borderBottom: "1px solid #e0e0e0",
  };

  const infoLabelStyle: React.CSSProperties = {
    color: "#666",
    fontSize: "0.95rem",
  };

  const infoValueStyle: React.CSSProperties = {
    fontWeight: "500",
    color: "#333",
    fontSize: "0.95rem",
  };

  return (
    <div style={containerStyle}>
      <Header
        signed_in={true}
        user_flag={user_flag}
        language={currentLanguage}
        onLanguageChange={toggleLanguage}
        userId={user.id}
      />
      <main style={mainStyle}>
        <h1 style={dashboardTitleStyle}>
          {currentLanguage === "en" ? "Dashboard" : "Trang tổng quan"}
        </h1>
        <p style={welcomeTextStyle}>
          {currentLanguage === "en"
            ? `Welcome back, ${user.full_name}!`
            : `Chào mừng trở lại, ${user.full_name}!`}
        </p>

        {/* Stats Grid */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            {currentLanguage === "en" ? "Statistics" : "Thống kê"}
          </h2>
          <div style={statsGridStyle}>
            {isStudent && (
              <>
                <div style={statCardStyle("blue")}>
                  <p style={statTitleStyle}>
                    {currentLanguage === "en" ? "Enrolled Courses" : "Khóa học đã đăng ký"}
                  </p>
                  <p style={statValueStyle}>5</p>
                  <p style={statDescriptionStyle}>
                    {currentLanguage === "en" ? "Active courses" : "Khóa học đang học"}
                  </p>
                </div>
                <div style={statCardStyle("green")}>
                  <p style={statTitleStyle}>
                    {currentLanguage === "en" ? "Completed" : "Hoàn thành"}
                  </p>
                  <p style={statValueStyle}>12</p>
                  <p style={statDescriptionStyle}>
                    {currentLanguage === "en" ? "Courses finished" : "Khóa học đã hoàn thành"}
                  </p>
                </div>
                <div style={statCardStyle("purple")}>
                  <p style={statTitleStyle}>
                    {currentLanguage === "en" ? "Certificates" : "Chứng chỉ"}
                  </p>
                  <p style={statValueStyle}>8</p>
                  <p style={statDescriptionStyle}>
                    {currentLanguage === "en" ? "Earned certificates" : "Chứng chỉ đã đạt được"}
                  </p>
                </div>
              </>
            )}

            {isTeacher && (
              <>
                <div style={statCardStyle("blue")}>
                  <p style={statTitleStyle}>
                    {currentLanguage === "en" ? "My Courses" : "Khóa học của tôi"}
                  </p>
                  <p style={statValueStyle}>8</p>
                  <p style={statDescriptionStyle}>
                    {currentLanguage === "en" ? "Published courses" : "Khóa học đã xuất bản"}
                  </p>
                </div>
                <div style={statCardStyle("green")}>
                  <p style={statTitleStyle}>
                    {currentLanguage === "en" ? "Students" : "Học sinh"}
                  </p>
                  <p style={statValueStyle}>156</p>
                  <p style={statDescriptionStyle}>
                    {currentLanguage === "en" ? "Total enrolled" : "Tổng số đã đăng ký"}
                  </p>
                </div>
                <div style={statCardStyle("yellow")}>
                  <p style={statTitleStyle}>
                    {currentLanguage === "en" ? "Reviews" : "Đánh giá"}
                  </p>
                  <p style={statValueStyle}>4.8</p>
                  <p style={statDescriptionStyle}>
                    {currentLanguage === "en" ? "Average rating" : "Đánh giá trung bình"}
                  </p>
                </div>
              </>
            )}

            {isAdmin && (
              <>
                <div style={statCardStyle("blue")}>
                  <p style={statTitleStyle}>
                    {currentLanguage === "en" ? "Total Users" : "Tổng số người dùng"}
                  </p>
                  <p style={statValueStyle}>1,234</p>
                  <p style={statDescriptionStyle}>
                    {currentLanguage === "en" ? "Registered users" : "Người dùng đã đăng ký"}
                  </p>
                </div>
                <div style={statCardStyle("green")}>
                  <p style={statTitleStyle}>
                    {currentLanguage === "en" ? "Courses" : "Khóa học"}
                  </p>
                  <p style={statValueStyle}>89</p>
                  <p style={statDescriptionStyle}>
                    {currentLanguage === "en" ? "Published courses" : "Khóa học đã xuất bản"}
                  </p>
                </div>
                <div style={statCardStyle("purple")}>
                  <p style={statTitleStyle}>
                    {currentLanguage === "en" ? "Revenue" : "Doanh thu"}
                  </p>
                  <p style={statValueStyle}>$45,678</p>
                  <p style={statDescriptionStyle}>
                    {currentLanguage === "en" ? "This month" : "Tháng này"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* User Info Card */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            {currentLanguage === "en" ? "Your Profile" : "Hồ sơ của bạn"}
          </h2>
          <div style={profileCardStyle}>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>
                {currentLanguage === "en" ? "Name" : "Tên"}
              </span>
              <span style={infoValueStyle}>{user.full_name}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>
                {currentLanguage === "en" ? "Email" : "Email"}
              </span>
              <span style={infoValueStyle}>{user.email}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={infoLabelStyle}>
                {currentLanguage === "en" ? "Role" : "Vai trò"}
              </span>
              <span style={infoValueStyle}>
                {currentLanguage === "en"
                  ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  : user.role === "student"
                  ? "Học sinh"
                  : user.role === "teacher"
                  ? "Giáo viên"
                  : "Quản trị viên"}
              </span>
            </div>
            <div style={{ ...infoRowStyle, borderBottom: "none" }}>
              <span style={infoLabelStyle}>
                {currentLanguage === "en" ? "Member since" : "Thành viên từ"}
              </span>
              <span style={infoValueStyle}>
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer language={currentLanguage} />
    </div>
  );
}
