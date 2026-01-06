import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link, useNavigate, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { getSectionList } from "~/services/course.server";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const signed_in = url.searchParams.get("signed_in") === "1";
  const user_flag = parseInt(url.searchParams.get("user_flag") || "1");
  const language = (url.searchParams.get("lang") as "en" | "vi") || "en";
  const userId = url.searchParams.get("userId") || "123";

  // If not signed in, redirect to login
  // if (!signed_in) {
  //   throw new Response(null, {
  //     status: 302,
  //     headers: { Location: "/login" },
  //   });
  // }

  const courses = await getSectionList();
  // FLATTEN HERE using .map()
  const flatSections = courses.map((item: any) => ({
    section_id: item.section_id,
    course_id: item.course_id,
    // Safely pull the name up to the top level
    course_name: Array.isArray(item.course) 
      ? item.course[0]?.course_name 
      : item.course?.course_name,
    // TODO: Get teachers from backend - using placeholder for now
    teachers: ["Nguyễn Hải Đăng", "Nguyễn Ngọc Thảo", "Nguyễn Thanh Tình"],
  }));

  // Return the clean, flat list
  return json({ 
    courses: flatSections,
    signed_in,
    user_flag,
    language,
    userId,
  });
}

export default function CoursesList() {
  const { courses, signed_in, user_flag, language, userId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "vi">(language);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleLanguage = () => {
    const newLang = currentLanguage === "en" ? "vi" : "en";
    setCurrentLanguage(newLang);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("lang", newLang);
    setSearchParams(newParams);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  const handleCourseClick = (sectionId: string) => {
    // Navigate to course page with user_flag
    navigate(`/courses/${sectionId}?user_flag=${user_flag}`);
  };

  const handleCategoryClick = (category: string) => {
    // Navigate to courses filtered by category
    console.log("Filter by category:", category);
  };

  // Redirect is handled in loader, but keep this as fallback
  // if (!signed_in) {
  //   return null;
  // }

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

  const searchIconStyle: React.CSSProperties = {
    cursor: "pointer",
    width: "24px",
    height: "24px",
    objectFit: "contain",
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: "3rem",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#000000",
    marginBottom: "1.5rem",
  };

  const coursesListStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const courseCardStyle: React.CSSProperties = {
    backgroundColor: "#D9D9D9",
    borderRadius: "25px",
    padding: "1.5rem",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    width: "100%",
  };

  const courseNameStyle: React.CSSProperties = {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#000000",
    marginBottom: "1rem",
  };

  const teacherStyle: React.CSSProperties = {
    fontSize: "0.9rem",
    color: "#565656",
    marginBottom: "0.5rem",
  };

  const categoriesSectionStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  };

  const categoriesGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1rem",
  };

  const categoryButtonStyle: React.CSSProperties = {
    backgroundColor: "#D9D9D9",
    borderRadius: "25px",
    padding: "1.5rem",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#000000",
    textAlign: "left",
  };

  const allCoursesButtonStyle: React.CSSProperties = {
    backgroundColor: "#0A853F",
    color: "#FFFFFF",
    borderRadius: "25px",
    padding: "0.75rem 1.5rem",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
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
        <form onSubmit={handleSearch} style={searchBarStyle}>
          <input
            type="text"
            placeholder={currentLanguage === "en" ? "Search course" : "Tìm kiếm khóa học"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={searchInputStyle}
          />
          <img 
            src="/icons/search.png" 
            alt="Search" 
            style={searchIconStyle}
            onClick={handleSearch}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const span = document.createElement("span");
                span.textContent = "🔍";
                span.style.cursor = "pointer";
                span.style.fontSize = "1.2rem";
                span.style.color = "#565656";
                parent.appendChild(span);
              }
            }}
          />
        </form>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            {currentLanguage === "en" ? "All courses" : "Tất cả khóa học"}
          </h2>
          <div style={coursesListStyle}>
            {courses.map((course) => (
              <div
                key={course.section_id}
                style={courseCardStyle}
                onClick={() => handleCourseClick(course.section_id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={courseNameStyle}>{course.course_name}</div>
                {course.teachers.map((teacher, index) => (
                  <div key={index} style={teacherStyle}>
                    Teacher: {teacher}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={sectionStyle}>
          <div style={categoriesSectionStyle}>
            <h2 style={sectionTitleStyle}>
              {currentLanguage === "en" ? "Course categories" : "Danh mục khóa học"}
            </h2>
            <button
              style={allCoursesButtonStyle}
              onClick={() => navigate("/courses")}
            >
              {currentLanguage === "en" ? "All courses >>" : "Tất cả khóa học >>"}
            </button>
          </div>
          <div style={categoriesGridStyle}>
            <button
              style={categoryButtonStyle}
              onClick={() => handleCategoryClick("2023-2024")}
            >
              &gt; 2023 - 2024
            </button>
            <button
              style={categoryButtonStyle}
              onClick={() => handleCategoryClick("2024-2025")}
            >
              &gt; 2024 - 2025
            </button>
            <button
              style={categoryButtonStyle}
              onClick={() => handleCategoryClick("2023-2024")}
            >
              &gt; 2023 - 2024
            </button>
            <button
              style={categoryButtonStyle}
              onClick={() => handleCategoryClick("2024-2025")}
            >
              &gt; 2024 - 2025
            </button>
          </div>
        </div>
      </main>
      <Footer language={currentLanguage} />
    </div>
  );
}
