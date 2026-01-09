import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { getUserId } from "~/services/auth/session.server";
import { getSectionList } from "~/services/course.server";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";

/* =======================
   Loader (BACKEND – unchanged logic)
======================= */
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  const url = new URL(request.url);

  const signed_in = true; // userId exists if this loader runs
  const user_flag = parseInt(url.searchParams.get("user_flag") || "1");
  const language = (url.searchParams.get("lang") as "en" | "vi") || "en";

  const data = await getSectionList(userId!);

  const flatSections = data.map((item: any) => ({
    section_id: item.section_id,
    course_id: Array.isArray(item.course)
      ? item.course[0]?.course_id
      : item.course?.course_id,
    course_name: Array.isArray(item.course)
      ? item.course[0]?.course_name
      : item.course?.course_name,
  }));

  return json({
    courses: flatSections,
    signed_in,
    user_flag,
    language,
    userId,
  });
}

/* =======================
   UI
======================= */
export default function MyCoursesPage() {
  const { courses, signed_in, user_flag, language, userId } =
    useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "vi">(language);

  const toggleLanguage = () => {
    const newLang = currentLanguage === "en" ? "vi" : "en";
    setCurrentLanguage(newLang);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("lang", newLang);
    setSearchParams(newParams);
  };

  const handleCourseClick = (sectionId: string) => {
    navigate(`/courses/${sectionId}?user_flag=${user_flag}`);
  };

  /* =======================
     Styles
  ======================= */
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
  };

  const emptyStyle: React.CSSProperties = {
    fontSize: "1rem",
    color: "#565656",
    marginTop: "1rem",
  };

  /* =======================
     Render
  ======================= */
  return (
    <div style={containerStyle}>
      <Header
        signed_in={signed_in}
        user_flag={user_flag}
        language={currentLanguage}
        onLanguageChange={toggleLanguage}
        userId={userId}
      />

      <main style={mainStyle}>
        <h2 style={sectionTitleStyle}>
          {currentLanguage === "en"
            ? "My Courses"
            : "Khóa học của tôi"}
        </h2>

        {courses.length === 0 ? (
          <p style={emptyStyle}>
            {currentLanguage === "en"
              ? "You have enrolled in no courses."
              : "Bạn chưa đăng ký khóa học nào."}
          </p>
        ) : (
          <div style={coursesListStyle}>
            {courses.map((course) => (
              <div
                key={course.section_id}
                style={courseCardStyle}
                onClick={() => handleCourseClick(course.section_id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={courseNameStyle}>
                  {course.course_name}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer language={currentLanguage} />
    </div>
  );
}
