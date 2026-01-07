import * as React from "react";
import { Footer } from "~/components/layout/footer";
import { Header } from "~/components/layout/header";
import type { Route } from "~/types/index";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Course View - Moodle++" },
    { name: "description", content: "Course details" },
  ];
}

export default function CourseView() {
  const tealColor = "#2c7a7b";
  const [expandedSections, setExpandedSections] = React.useState({
    general: true,
    syllabus: true,
    lectures: true,
    lab: true,
    project: true,
  });

  const [expandAllText, setExpandAllText] = React.useState("Collapse all");

  // Update expand all text based on section states
  React.useEffect(() => {
    const allExpanded =
      expandedSections.general &&
      expandedSections.syllabus &&
      expandedSections.lectures &&
      expandedSections.lab &&
      expandedSections.project;
    setExpandAllText(allExpanded ? "Collapse all" : "Expand all");
  }, [expandedSections]);

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
    gap: "0.75rem",
    borderBottom: "1px solid #f0f0f0",
  };

  const itemIconStyle: React.CSSProperties = {
    fontSize: "1.25rem",
    width: "24px",
    textAlign: "center",
  };

  const folderHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 0",
    marginBottom: "0.5rem",
  };

  const downloadButtonStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    backgroundColor: tealColor,
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
  };

  return (
    <div style={containerStyle}>
      <Header signed_in={true} />
      <div style={topButtonsStyle}>
        <button style={topButtonStyle}></button>
        <button style={topButtonStyle}></button>
      </div>
      <main style={mainStyle}>
        <div style={filterButtonsStyle}>
          <button style={filterButtonStyle}>2025-2026</button>
          <button style={filterButtonStyle}>Semester 1</button>
          <button style={filterButtonStyle}>Advanced Program (APCS)</button>
        </div>

        <h1 style={courseTitleStyle}>Element of Software Engineering - 23TT1</h1>

        <div style={tabsContainerStyle}>
          <div style={tabsStyle}>
            <button style={activeTabStyle}>Course</button>
            <button style={tabStyle}>Participants</button>
            <button style={tabStyle}>Grades</button>
          </div>
          <button style={expandAllButtonStyle} onClick={toggleAllSections}>
            {expandAllText}
          </button>
        </div>

        {/* General Section */}
        <div style={sectionStyle}>
          <div
            style={getSectionHeaderStyle(expandedSections.general)}
            onClick={() => toggleSection("general")}
          >
            <div style={sectionTitleStyle}>General</div>
            <button style={toggleButtonStyle}>
              {expandedSections.general ? "▼" : "▶"}
            </button>
          </div>
          {expandedSections.general && (
            <div style={sectionContentStyle}>
              <div style={itemStyle}>
                <span style={itemIconStyle}>💬</span>
                <span>Announcement</span>
              </div>
            </div>
          )}
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
          {expandedSections.syllabus && (
            <div style={sectionContentStyle}>
              <div style={itemStyle}>
                <span style={itemIconStyle}>📄</span>
                <span>CS300-F2025-Syllabus</span>
              </div>
            </div>
          )}
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
          {expandedSections.lectures && (
            <div style={sectionContentStyle}>
              <div style={folderHeaderStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={itemIconStyle}>📁</span>
                  <span>Lectures</span>
                </div>
                <button style={downloadButtonStyle}>Download folder</button>
              </div>
              <div style={itemStyle}>
                <span style={itemIconStyle}>📄</span>
                <span>LN01 - Introduction</span>
              </div>
              <div style={itemStyle}>
                <span style={itemIconStyle}>📄</span>
                <span>LN02 - Software Processes</span>
              </div>
              <div style={itemStyle}>
                <span style={itemIconStyle}>📄</span>
                <span>LN03 - Project Assignments</span>
              </div>
              <div style={itemStyle}>
                <span style={itemIconStyle}>📄</span>
                <span>LN03 - Project Management</span>
              </div>
              <div style={itemStyle}>
                <span style={itemIconStyle}>📄</span>
                <span>LN04 - Agile Methods</span>
              </div>
              <div style={itemStyle}>
                <span style={itemIconStyle}>📄</span>
                <span>LN05 - Software Requirements</span>
              </div>
              <div style={itemStyle}>
                <span style={itemIconStyle}>📄</span>
                <span>LN06 - Requirements Engineering</span>
              </div>
              <div style={itemStyle}>
                <span style={itemIconStyle}>📄</span>
                <span>LN01 - Introduction</span>
              </div>
              <div style={itemStyle}>
                <span style={itemIconStyle}>📄</span>
                <span>LN01 - Introduction</span>
              </div>
            </div>
          )}
        </div>

        {/* Lab Section */}
        <div style={sectionStyle}>
          <div style={getSectionHeaderStyle(expandedSections.lab)} onClick={() => toggleSection("lab")}>
            <div style={sectionTitleStyle}>Lab</div>
            <button style={toggleButtonStyle}>
              {expandedSections.lab ? "▼" : "▶"}
            </button>
          </div>
          {expandedSections.lab && (
            <div style={sectionContentStyle}>
              <div style={itemStyle}>
                <span style={itemIconStyle}>🌐</span>
                <span>CS300-23TT1-TeamRegistration</span>
              </div>
              <div style={itemStyle}>
                <span style={itemIconStyle}>⬆</span>
                <span>PA01 Submission</span>
              </div>
              <div style={itemStyle}>
                <span style={itemIconStyle}>☑</span>
                <span>Lab check-in quiz</span>
              </div>
            </div>
          )}
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
          {expandedSections.project && (
            <div style={sectionContentStyle}>
              {/* Project content can be added here */}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

