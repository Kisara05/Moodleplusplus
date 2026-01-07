import * as React from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const signed_in = url.searchParams.get("signed_in") === "1";
  const user_flag = parseInt(url.searchParams.get("user_flag") || "1");
  const language = (url.searchParams.get("lang") as "en" | "vi") || "en";
  const userId = url.searchParams.get("userId") || "123";

  return json({
    signed_in,
    user_flag,
    language,
    userId,
  });
}

export default function Dashboard() {
  const { signed_in, user_flag, language, userId } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentLanguage, setCurrentLanguage] = React.useState<"en" | "vi">(language);
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const tealColor = "#2c7a7b";
  const today = new Date();
  
  const toggleLanguage = () => {
    const newLang = currentLanguage === "en" ? "vi" : "en";
    setCurrentLanguage(newLang);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("lang", newLang);
    setSearchParams(newParams);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getMonthName = (date: Date) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[date.getMonth()];
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // Convert Sunday (0) to 6, Monday (1) to 0, etc. to make Monday the first day
    return day === 0 ? 6 : day - 1;
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const calendarDays: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }

    return (
      <div>
        <div style={calendarGridStyle}>
          {days.map((day) => (
            <div key={day} style={dayHeaderStyle}>
              {day}
            </div>
          ))}
        </div>
        <div style={calendarGridStyle}>
          {calendarDays.map((day, index) => (
            <div
              key={index}
              style={
                day === null
                  ? emptyDayStyle
                  : isToday(day)
                  ? todayDayStyle
                  : dayStyle
              }
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    );
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
    width: "100%",
    margin: "0 auto",
  };

  const dashboardTitleStyle: React.CSSProperties = {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#0A853F",
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

  const calendarContainerStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  };

  const calendarHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  };

  const monthNavigationStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flex: 1,
  };

  const navButtonStyle: React.CSSProperties = {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    color: "#666",
    padding: "0.5rem",
  };

  const monthYearStyle: React.CSSProperties = {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: tealColor,
    flex: 1,
    textAlign: "center",
  };

  const calendarGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "0.5rem",
  };

  const dayHeaderStyle: React.CSSProperties = {
    padding: "0.75rem",
    textAlign: "center",
    fontWeight: "600",
    color: "#666",
    fontSize: "0.9rem",
  };

  const dayStyle: React.CSSProperties = {
    padding: "0.75rem",
    textAlign: "center",
    cursor: "pointer",
    borderRadius: "4px",
    fontSize: "0.9rem",
    color: "#333",
  };

  const todayDayStyle: React.CSSProperties = {
    ...dayStyle,
    backgroundColor: tealColor,
    color: "white",
    fontWeight: "bold",
  };

  const emptyDayStyle: React.CSSProperties = {
    padding: "0.75rem",
  };

  const placeholderStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    textAlign: "center",
    color: "#666",
    fontSize: "1rem",
  };

  return (
    <div style={containerStyle}>
      <Header
        signed_in={true} // REMINDER: Change this to {signed_in}
        user_flag={user_flag}
        language={currentLanguage}
        onLanguageChange={toggleLanguage}
        userId={userId}
      />
      <main style={mainStyle}>
        <h1 style={dashboardTitleStyle}>
          {language === "en" ? "Dashboard" : "Trang tổng quan"}
        </h1>

        {/* Calendar Section */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            {language === "en" ? "Calendar" : "Lịch"}
          </h2>
          <div style={calendarContainerStyle}>
            <div style={calendarHeaderStyle}>
              <div style={monthNavigationStyle}>
                <button style={navButtonStyle} onClick={goToPreviousMonth}>
                  &lt;&lt; {getMonthName(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                </button>
                <div style={monthYearStyle}>
                  {getMonthName(currentDate)} {currentDate.getFullYear()}
                </div>
                <button style={navButtonStyle} onClick={goToNextMonth}>
                  {getMonthName(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} &gt;&gt;
                </button>
              </div>
            </div>
            {renderCalendar()}
          </div>
        </div>

        {/* Recently accessed courses Section */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            {language === "en" ? "Recently accessed courses" : "Khóa học truy cập gần đây"}
          </h2>
          <div style={placeholderStyle}>
            {language === "en" ? "This feature will be implemented later" : "Tính năng này sẽ được thực hiện sau"}
          </div>
        </div>

        {/* Timeline Section */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            {language === "en" ? "Timeline" : "Mốc thời gian"}
          </h2>
          <div style={placeholderStyle}>
            {language === "en" ? "This feature will be implemented later" : "Tính năng này sẽ được thực hiện sau"}
          </div>
        </div>
      </main>
      <Footer language={currentLanguage} />
    </div>
  );
}

