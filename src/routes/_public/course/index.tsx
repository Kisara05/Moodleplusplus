import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { useState } from "react";

import { getSectionList } from "~/services/course.server";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";

/* =========================
   Loader (BACKEND)
========================= */
export async function loader({ request }: LoaderFunctionArgs) {
  const courses = await getSectionList();

  // Flatten backend response
  const flatSections = courses.map((item: any) => ({
    section_id: item.section_id,
    course_id: item.course_id,
    course_name: Array.isArray(item.course)
      ? item.course[0]?.course_name
      : item.course?.course_name,
    // TEMP placeholder (replace later)
    teachers: ["Nguyễn Hải Đăng", "Nguyễn Ngọc Thảo", "Nguyễn Thanh Tình"],
  }));

  // TEMP session-like data (until session is enforced everywhere)
  const signed_in = true;
  const user_flag = 1;
  const language: "en" | "vi" = "en";
  const userId = "123";

  return json({
    courses: flatSections,
    signed_in,
    user_flag,
    language,
    userId,
  });
}

/* =========================
   Component (UI)
========================= */
export default function CoursesList() {
  const { courses, signed_in, user_flag, language, userId } =
    useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentLanguage, setCurrentLanguage] =
    useState<"en" | "vi">(language);
  const [searchQuery, setSearchQuery] = useState("");

  /* =========================
     Handlers
  ========================= */
  const toggleLanguage = () => {
    const newLang = currentLanguage === "en" ? "vi" : "en";
    setCurrentLanguage(newLang);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("lang", newLang);
    setSearchParams(newParams);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching:", searchQuery);
  };

  const handleCourseClick = (sectionId: string) => {
    navigate(`/courses/${sectionId}?user_flag=${user_flag}`);
  };

  const handleCategoryClick = (category: string) => {
    console.log("Filter category:", category);
  };

  /* =========================
     Styles (unchanged)
  ========================= */
  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: "2rem",
  };

  const searchBarStyle: React.CSSProperties = {
    width: "100%",
    padding: "1rem",
    fontSize: "1rem",
    border: "2px solid #D9D9D9",
    borderRadius: "25px",
    marginBottom: "2rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  };

  const searchInputStyle: React.CSSProperties = {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "1rem",
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: "3rem",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "1.5rem",
  };

  const courseCardStyle: React.CSSProperties = {
    backgroundColor: "#D9D9D9",
    borderRadius: "25px",
    padding: "1.5rem",
    cursor: "pointer",
  };

  /* =========================
     Render
  ========================= */
  return (
    <div style={containerStyle}>
      {/* Header */}
      <Header
        signed_in={signed_in}
        user_flag={user_flag}
        language={currentLanguage}
        onLanguageChange={toggleLanguage}
        userId={userId}
      />

      {/* Main */}
      <main style={mainStyle}>
        <form onSubmit={handleSearch} style={searchBarStyle}>
          <input
            type="text"
            placeholder={
              currentLanguage === "en"
                ? "Search course"
                : "Tìm kiếm khóa học"
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={searchInputStyle}
          />
          <span style={{ cursor: "pointer" }}>🔍</span>
        </form>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            {currentLanguage === "en"
              ? "All courses"
              : "Tất cả khóa học"}
          </h2>

          {courses.map((course) => (
            <div
              key={course.section_id}
              style={courseCardStyle}
              onClick={() => handleCourseClick(course.section_id)}
            >
              <div style={{ fontWeight: "bold" }}>
                {course.course_name}
              </div>
              {course.teachers.map((t, i) => (
                <div key={i} style={{ fontSize: "0.9rem" }}>
                  Teacher: {t}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            {currentLanguage === "en"
              ? "Course categories"
              : "Danh mục khóa học"}
          </h2>

          <button onClick={() => handleCategoryClick("2023-2024")}>
            &gt; 2023 - 2024
          </button>
        </div>
      </main>

      {/* Footer */}
      <Footer language={currentLanguage} />
    </div>
  );
}
