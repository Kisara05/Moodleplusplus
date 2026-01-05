import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const signed_in = url.searchParams.get("signed_in") === "1";
  const user_flag = parseInt(url.searchParams.get("user_flag") || "1");
  const language = (url.searchParams.get("lang") as "en" | "vi") || "en";

  // If not signed in, redirect to login
  // Note: In production, check session/cookie instead of URL params
  if (!signed_in) {
    throw new Response(null, {
      status: 302,
      headers: { Location: "/login" },
    });
  }

  // Sample courses data - replace with actual data from database
  const courses = [
    {
      id: "1",
      name: "Artificial Intelligence - 23TT1",
      teachers: ["Nguyễn Hải Đăng", "Nguyễn Ngọc Thảo", "Nguyễn Thanh Tình"],
    },
    {
      id: "2",
      name: "Artificial Intelligence - 23TT1",
      teachers: ["Nguyễn Hải Đăng", "Nguyễn Ngọc Thảo", "Nguyễn Thanh Tình"],
    },
    {
      id: "3",
      name: "Artificial Intelligence - 23TT1",
      teachers: ["Nguyễn Hải Đăng", "Nguyễn Ngọc Thảo", "Nguyễn Thanh Tình"],
    },
    {
      id: "4",
      name: "Artificial Intelligence - 23TT1",
      teachers: ["Nguyễn Hải Đăng", "Nguyễn Ngọc Thảo", "Nguyễn Thanh Tình"],
    },
    {
      id: "5",
      name: "Artificial Intelligence - 23TT1",
      teachers: ["Nguyễn Hải Đăng", "Nguyễn Ngọc Thảo", "Nguyễn Thanh Tình"],
    },
    {
      id: "6",
      name: "Artificial Intelligence - 23TT1",
      teachers: ["Nguyễn Hải Đăng", "Nguyễn Ngọc Thảo", "Nguyễn Thanh Tình"],
    },
    {
      id: "7",
      name: "Artificial Intelligence - 23TT1",
      teachers: ["Nguyễn Hải Đăng", "Nguyễn Ngọc Thảo", "Nguyễn Thanh Tình"],
    },
    {
      id: "8",
      name: "Artificial Intelligence - 23TT1",
      teachers: ["Nguyễn Hải Đăng", "Nguyễn Ngọc Thảo", "Nguyễn Thanh Tình"],
    },
    {
      id: "9",
      name: "Artificial Intelligence - 23TT1",
      teachers: ["Nguyễn Hải Đăng", "Nguyễn Ngọc Thảo", "Nguyễn Thanh Tình"],
    },
    {
      id: "10",
      name: "Artificial Intelligence - 23TT1",
      teachers: ["Nguyễn Hải Đăng", "Nguyễn Ngọc Thảo", "Nguyễn Thanh Tình"],
    },
  ];

  return json({
    signed_in,
    user_flag,
    language,
    courses,
  });
}

export default function Home() {
  const { signed_in, user_flag, language, courses } = useLoaderData<typeof loader>();
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
    // Navigate to search results or filter courses
  };

  const handleCourseClick = (courseId: string) => {
    // Navigate to course page with user_flag
    navigate(`/courses/${courseId}?user_flag=${user_flag}`);
  };

  const handleDashboardClick = () => {
    // TODO: Navigate to dashboard (implement later)
    console.log("Navigate to dashboard");
  };

  const handleMyCoursesClick = () => {
    // TODO: Navigate to My courses page (implement later)
    navigate("/courses");
  };

  const handleCourseRegistrationClick = () => {
    // TODO: Navigate to Course registration page (implement later)
    console.log("Navigate to course registration");
  };

  const handleCategoryClick = (category: string) => {
    // Navigate to courses filtered by category
    handleMyCoursesClick();
  };

  // Redirect is handled in loader, but keep this as fallback
  if (!signed_in) {
    return null;
  }

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
        signed_in={signed_in}
        user_flag={user_flag}
        language={currentLanguage}
        onLanguageChange={toggleLanguage}
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
            {currentLanguage === "en" ? "My courses" : "Khóa học của tôi"}
          </h2>
          <div style={coursesListStyle}>
            {courses.map((course) => (
              <div
                key={course.id}
                style={courseCardStyle}
                onClick={() => handleCourseClick(course.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={courseNameStyle}>{course.name}</div>
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
              onClick={handleMyCoursesClick}
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
