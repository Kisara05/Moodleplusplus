import { Footer } from "~/components/layout/footer";
import { Header } from "~/components/layout/header";
// import { NewsSection } from "~/components/NewsSection";
// import { Sidebar } from "~/components/Sidebar";
import type { Route } from "~/types/index";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Moodle++" },
    { name: "description", content: "Main page of Moodle++" },
  ];
}

export default function Home() {
  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f5f5f5",
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: "2rem",
    maxWidth: "1200px",
    width: "100%",
    margin: "0 auto",
  };

  const searchBarStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "1rem",
    marginBottom: "2rem",
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  };

  const searchInputStyle: React.CSSProperties = {
    flex: 1,
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
  };

  const searchButtonStyle: React.CSSProperties = {
    padding: "0.75rem 1rem",
    backgroundColor: "#2c7a7b",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "2rem",
    marginBottom: "2rem",
    borderRadius: "4px",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "1.75rem",
    fontWeight: "bold",
    color: "#2c7a7b",
    marginBottom: "1.5rem",
  };

  const courseCardStyle: React.CSSProperties = {
    padding: "1.5rem",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    marginBottom: "1rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  };

  const courseTitleStyle: React.CSSProperties = {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "0.5rem",
  };

  const teacherStyle: React.CSSProperties = {
    fontSize: "1rem",
    color: "#666",
    marginBottom: "0.25rem",
  };

  const categoriesHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  };

  const allCoursesButtonStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    backgroundColor: "#2c7a7b",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
  };

  const categoriesGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1rem",
  };

  const categoryButtonStyle: React.CSSProperties = {
    padding: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "1rem",
    textAlign: "left",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  };

  // Sample courses data
  const courses = Array(10).fill(null).map((_, i) => ({
    title: "Artificial Intelligence - 23TT1",
    teachers: [
      "Nguyễn Hải Đăng",
      "Nguyễn Ngọc Thảo",
      "Nguyễn Thanh Tình",
    ],
  }));

  return (
    <div style={containerStyle}>
      <Header isLoggedIn={true} />
      <main style={mainStyle}>
        {/* Search Bar */}
        <div style={searchBarStyle}>
          <input
            type="text"
            placeholder="Search course"
            style={searchInputStyle}
          />
          <button style={searchButtonStyle}>🔍</button>
        </div>

        {/* My courses Section */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>My courses</h2>
          {courses.map((course, index) => (
            <div key={index} style={courseCardStyle}>
              <div style={courseTitleStyle}>{course.title}</div>
              {course.teachers.map((teacher, tIndex) => (
                <div key={tIndex} style={teacherStyle}>
                  Teacher: {teacher}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Course categories Section */}
        <div style={sectionStyle}>
          <div style={categoriesHeaderStyle}>
            <h2 style={sectionTitleStyle}>Course categories</h2>
            <button style={allCoursesButtonStyle}>All courses &gt;&gt;</button>
          </div>
          <div style={categoriesGridStyle}>
            <button style={categoryButtonStyle}>&gt; 2023 - 2024</button>
            <button style={categoryButtonStyle}>&gt; 2024 - 2025</button>
            <button style={categoryButtonStyle}>&gt; 2023 - 2024</button>
            <button style={categoryButtonStyle}>&gt; 2024 - 2025</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
