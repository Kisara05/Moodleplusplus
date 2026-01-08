import * as React from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { getSectionById } from "~/services/course.server";
import { getAllPosts } from "~/services/post.server";
import { getUserById } from "~/services/auth/auth.server";
import { getUserId } from "~/services/auth/session.server";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";

export async function loader({ request, params }: LoaderFunctionArgs) {
  // Get user from session
  const userId = await getUserId(request);
  if (!userId) {
    return redirect("/login");
  }

  const user = await getUserById(userId);
  if (!user) {
    return redirect("/login");
  }

  console.log(params);
  const courseId = params.courseID;
  const url = new URL(request.url);
  const language = (url.searchParams.get("lang") as "en" | "vi") || "en";
  const user_flag = user.role === "student" ? 1 : 0;
  
  console.log(courseId);
  if (!courseId) {
    throw new Response("Course ID is missing", { status: 400 });
  }
  const course = await getSectionById(courseId);
  const posts = await getAllPosts(courseId);
  console.log(course);
  console.log(posts);
  if (!course) {
    throw new Response("Course not found", { status: 404 });
  }
  if (!posts) {
    throw new Response("Invalid post return type", {status: 404});
  }
  return json({ 
    course: course, 
    posts: posts,
    user_flag,
    language,
    userId: user.id,
    user,
  });
}

export default function CourseDetail() {
  const { course, posts, user_flag, language, userId, user } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentLanguage, setCurrentLanguage] = React.useState<"en" | "vi">(language);
  const [showModal, setShowModal] = React.useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = React.useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = React.useState<"all" | "activities" | "resources">("all");
  
  const tealColor = "#2c7a7b";
  const isTeacher = user_flag === 0;
  
  const toggleLanguage = () => {
    const newLang = currentLanguage === "en" ? "vi" : "en";
    setCurrentLanguage(newLang);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("lang", newLang);
    setSearchParams(newParams);
  };

  const toggleSettingsMenu = (sectionKey: string) => {
    setShowSettingsMenu(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const [expandedSections, setExpandedSections] = React.useState({
    general: true,
    syllabus: false,
    lectures: false,
    lab: false,
    project: false,
  });

  const [expandAllText, setExpandAllText] = React.useState("Expand all");

  // Update expand all text based on section states and language
  React.useEffect(() => {
    const allExpanded =
      expandedSections.general &&
      expandedSections.syllabus &&
      expandedSections.lectures &&
      expandedSections.lab &&
      expandedSections.project;
    if (currentLanguage === "vi") {
      setExpandAllText(allExpanded ? "Thu gọn toàn bộ" : "Mở rộng tất cả");
    } else {
      setExpandAllText(allExpanded ? "Collapse all" : "Expand all");
    }
  }, [expandedSections, currentLanguage]);

  // Close settings menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowSettingsMenu({});
    };
    if (Object.keys(showSettingsMenu).length > 0) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showSettingsMenu]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleAllSections = () => {
    const allExpanded =
      expandedSections.general &&
      expandedSections.syllabus &&
      expandedSections.lectures &&
      expandedSections.lab &&
      expandedSections.project;

    setExpandedSections({
      general: !allExpanded,
      syllabus: !allExpanded,
      lectures: !allExpanded,
      lab: !allExpanded,
      project: !allExpanded,
    });
  };

  // Get course name - handle both direct field and relation
  const courseName = Array.isArray(course.course) 
    ? course.course[0]?.course_name 
    : course.course?.course_name || course.course_name || course.course_id || "Course";

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f5f5f5",
  };

  const topButtonsStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    padding: "1rem 2rem",
    backgroundColor: "white",
    borderBottom: "1px solid #e0e0e0",
  };

  const topButtonStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    backgroundColor: "#f0f0f0",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: "2rem",
    maxWidth: "1200px",
    width: "100%",
    margin: "0 auto",
  };

  const filterButtonsStyle: React.CSSProperties = {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  };

  const filterButtonStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
  };

  const courseTitleStyle: React.CSSProperties = {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "1.5rem",
  };

  const tabsContainerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    borderBottom: "2px solid #e0e0e0",
  };

  const tabsStyle: React.CSSProperties = {
    display: "flex",
    gap: "2rem",
  };

  const tabStyle: React.CSSProperties = {
    padding: "0.75rem 1rem",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "3px solid transparent",
    cursor: "pointer",
    fontSize: "1rem",
    color: "#666",
    fontWeight: "500",
  };

  const activeTabStyle: React.CSSProperties = {
    ...tabStyle,
    borderBottom: `3px solid ${tealColor}`,
    color: tealColor,
  };

  const expandAllButtonStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
    color: tealColor,
    textDecoration: "underline",
  };

  const sectionStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "4px",
    marginBottom: "1rem",
    border: "1px solid #e0e0e0",
  };

  const getSectionHeaderStyle = (isExpanded: boolean): React.CSSProperties => ({
    padding: "1rem 1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    borderBottom: isExpanded ? "1px solid #e0e0e0" : "none",
  });

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#333",
  };

  const toggleButtonStyle: React.CSSProperties = {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "1.2rem",
    color: "#666",
    padding: "0.25rem 0.5rem",
  };

  const sectionContentStyle: React.CSSProperties = {
    padding: "1rem 1.5rem",
  };

  const itemStyle: React.CSSProperties = {
    padding: "0.75rem 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
    borderBottom: "1px solid #f0f0f0",
  };

  const itemLinkStyle: React.CSSProperties = {
    color: "#333",
    textDecoration: "none",
    fontSize: "1rem",
    cursor: "pointer",
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  };

  const itemLinkHoverStyle: React.CSSProperties = {
    color: tealColor,
    textDecoration: "underline",
  };

  const threeDotsButtonStyle: React.CSSProperties = {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "1.2rem",
    color: "#666",
    padding: "0.25rem 0.5rem",
    position: "relative",
  };

  const settingsMenuStyle: React.CSSProperties = {
    position: "absolute",
    right: "0",
    top: "100%",
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    zIndex: 1000,
    minWidth: "200px",
    marginTop: "0.5rem",
  };

  const settingsMenuItemStyle: React.CSSProperties = {
    padding: "0.75rem 1rem",
    cursor: "pointer",
    fontSize: "0.9rem",
    color: "#333",
    borderBottom: "1px solid #f0f0f0",
  };

  const addButtonStyle: React.CSSProperties = {
    marginTop: "1rem",
    padding: "0.75rem 1rem",
    backgroundColor: "transparent",
    border: "1px dashed #ccc",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
    color: "#666",
    width: "100%",
    textAlign: "center",
  };

  // Modal styles
  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: showModal ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "2rem",
    maxWidth: "800px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
    position: "relative",
  };

  const modalHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  };

  const modalTitleStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: tealColor,
  };

  const closeButtonStyle: React.CSSProperties = {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "1.5rem",
    color: "#666",
    padding: "0.25rem 0.5rem",
  };

  const modalTabsStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "2rem",
  };

  const modalTabStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    border: "1px solid #ccc",
    borderRadius: "20px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "0.9rem",
    color: "#666",
  };

  const activeModalTabStyle: React.CSSProperties = {
    ...modalTabStyle,
    backgroundColor: tealColor,
    color: "white",
    borderColor: tealColor,
  };

  const activityGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1.5rem",
  };

  const activityButtonStyle: React.CSSProperties = {
    padding: "2rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
    backgroundColor: "white",
    transition: "transform 0.2s",
  };

  const activityIconStyle: React.CSSProperties = {
    fontSize: "3rem",
    color: tealColor,
  };

  const activityLabelStyle: React.CSSProperties = {
    fontSize: "1rem",
    color: tealColor,
    fontWeight: "600",
  };

  const renderSectionContent = (sectionKey: string, items: any[]) => {
    return (
      <div style={sectionContentStyle}>
        {items.length > 0 ? (
          items.map((item: any) => (
            <div key={item.post_id || item.id} style={itemStyle}>
              <Link 
                to={`/post/${item.post_id}`}
                style={itemLinkStyle}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, itemLinkHoverStyle);
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, itemLinkStyle);
                }}
              >
                <span style={{ fontSize: "1.25rem", width: "24px", textAlign: "center" }}>💬</span>
                <span>{item.title}</span>
              </Link>
              {isTeacher && (
                <div style={{ position: "relative" }}>
                  <button 
                    style={threeDotsButtonStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSettingsMenu(`${sectionKey}-${item.post_id || item.id}`);
                    }}
                  >
                    ⋮
                  </button>
                  {showSettingsMenu[`${sectionKey}-${item.post_id || item.id}`] && (
                    <div style={settingsMenuStyle}>
                      <div style={settingsMenuItemStyle}>Edit settings</div>
                      <div style={settingsMenuItemStyle}>Move</div>
                      <div style={settingsMenuItemStyle}>Hide</div>
                      <div style={settingsMenuItemStyle}>Duplicate</div>
                      <div style={settingsMenuItemStyle}>Assign roles</div>
                      <div style={settingsMenuItemStyle}>Delete</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={itemStyle}>
            <span>No items available</span>
          </div>
        )}
        {isTeacher && (
          <button style={addButtonStyle} onClick={() => setShowModal(true)}>
            + Add an activity or resource
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <Header 
        signed_in={true}
        user_flag={user_flag}
        language={currentLanguage}
        onLanguageChange={toggleLanguage}
        userId={userId}
      />
      <div style={topButtonsStyle}>
        <button style={topButtonStyle}></button>
        <button style={topButtonStyle}></button>
      </div>
      <main style={mainStyle}>
        <div style={filterButtonsStyle}>
          <button style={filterButtonStyle}>2025-2026</button>
          <button style={filterButtonStyle}>
            {language === "en" ? "Semester 1" : "Học kỳ 1"}
          </button>
          <button style={filterButtonStyle}>Advanced Program (APCS)</button>
        </div>

        <h1 style={courseTitleStyle}>{courseName}</h1>

        <div style={tabsContainerStyle}>
          <div style={tabsStyle}>
            <button style={activeTabStyle}>
              {language === "en" ? "Course" : "Khóa học"}
            </button>
            <button style={tabStyle}>
              {language === "en" ? "Settings" : "Cài đặt"}
            </button>
            <button style={tabStyle}>
              {language === "en" ? "Grades" : "Điểm"}
            </button>
            <button style={tabStyle}>
              {language === "en" ? "Participants" : "Danh sách thành viên"}
            </button>
            <button style={tabStyle}>
              {language === "en" ? "Reports" : "Báo cáo"}
            </button>
            <button style={tabStyle}>
              {language === "en" ? "More" : "Thêm"}
            </button>
          </div>
          <button style={expandAllButtonStyle} onClick={toggleAllSections}>
            {expandAllText}
          </button>
        </div>

        {/* General Section - Contains all posts */}
        <div style={sectionStyle}>
          <div
            style={getSectionHeaderStyle(expandedSections.general)}
            onClick={() => toggleSection("general")}
          >
            <div style={sectionTitleStyle}>
              {language === "en" ? "General" : "Tổng quan"}
            </div>
            <button style={toggleButtonStyle}>
              {expandedSections.general ? "▼" : "▶"}
            </button>
          </div>
          {expandedSections.general && renderSectionContent("general", posts)}
        </div>

        {/* Syllabus Section */}
        <div style={sectionStyle}>
          <div
            style={getSectionHeaderStyle(expandedSections.syllabus)}
            onClick={() => toggleSection("syllabus")}
          >
            <div style={sectionTitleStyle}>Syllabus</div>
            <button style={toggleButtonStyle}>
              {expandedSections.syllabus ? "▼" : "▶"}
            </button>
          </div>
          {expandedSections.syllabus && renderSectionContent("syllabus", [])}
        </div>

        {/* Lectures Section */}
        <div style={sectionStyle}>
          <div
            style={getSectionHeaderStyle(expandedSections.lectures)}
            onClick={() => toggleSection("lectures")}
          >
            <div style={sectionTitleStyle}>Lectures</div>
            <button style={toggleButtonStyle}>
              {expandedSections.lectures ? "▼" : "▶"}
            </button>
          </div>
          {expandedSections.lectures && renderSectionContent("lectures", [])}
        </div>

        {/* Lab Section */}
        <div style={sectionStyle}>
          <div style={getSectionHeaderStyle(expandedSections.lab)} onClick={() => toggleSection("lab")}>
            <div style={sectionTitleStyle}>Lab</div>
            <button style={toggleButtonStyle}>
              {expandedSections.lab ? "▼" : "▶"}
            </button>
          </div>
          {expandedSections.lab && renderSectionContent("lab", [])}
        </div>

        {/* Project Section */}
        <div style={sectionStyle}>
          <div
            style={getSectionHeaderStyle(expandedSections.project)}
            onClick={() => toggleSection("project")}
          >
            <div style={sectionTitleStyle}>Project</div>
            <button style={toggleButtonStyle}>
              {expandedSections.project ? "▼" : "▶"}
            </button>
          </div>
          {expandedSections.project && renderSectionContent("project", [])}
        </div>
      </main>
      <Footer language={currentLanguage} />

      {/* Modal for Add an activity or resource */}
      <div style={modalOverlayStyle} onClick={() => setShowModal(false)}>
        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
          <div style={modalHeaderStyle}>
            <h2 style={modalTitleStyle}>Add an activity or resource</h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button style={closeButtonStyle}>?</button>
              <button style={closeButtonStyle} onClick={() => setShowModal(false)}>×</button>
            </div>
          </div>
          <div style={modalTabsStyle}>
            <button 
              style={activeTab === "all" ? activeModalTabStyle : modalTabStyle}
              onClick={() => setActiveTab("all")}
            >
              All
            </button>
            <button 
              style={activeTab === "activities" ? activeModalTabStyle : modalTabStyle}
              onClick={() => setActiveTab("activities")}
            >
              Activities
            </button>
            <button 
              style={activeTab === "resources" ? activeModalTabStyle : modalTabStyle}
              onClick={() => setActiveTab("resources")}
            >
              Resources
            </button>
          </div>
          <div style={activityGridStyle}>
            <button style={activityButtonStyle} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={activityIconStyle}>⬆</div>
              <div style={activityLabelStyle}>Assignment</div>
            </button>
            <button style={activityButtonStyle} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={activityIconStyle}>📄</div>
              <div style={activityLabelStyle}>File</div>
            </button>
            <button style={activityButtonStyle} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={activityIconStyle}>📁</div>
              <div style={activityLabelStyle}>Folder</div>
            </button>
            <button style={activityButtonStyle} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={activityIconStyle}>💬</div>
              <div style={activityLabelStyle}>Forum</div>
            </button>
            <button style={activityButtonStyle} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={activityIconStyle}>☑</div>
              <div style={activityLabelStyle}>Quiz</div>
            </button>
            <button style={activityButtonStyle} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={activityIconStyle}>🌐</div>
              <div style={activityLabelStyle}>URL</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}