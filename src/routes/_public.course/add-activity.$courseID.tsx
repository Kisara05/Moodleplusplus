import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useState } from "react";
import { getSectionById } from "~/services/course.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const signed_in = url.searchParams.get("signed_in") === "1";
  const user_flag = parseInt(url.searchParams.get("user_flag") || "0");
  const language = (url.searchParams.get("lang") as "en" | "vi") || "en";
  const sectionId = params.courseID;

  if (!signed_in) {
    throw new Response(null, {
      status: 302,
      headers: { Location: "/login" },
    });
  }

  try {
    const section = await getSectionById(sectionId || "");
    return json({
      signed_in,
      user_flag,
      language,
      sectionId,
      section,
    });
  } catch (error) {
    console.error("Error loading section data:", error);
    return json({
      signed_in,
      user_flag,
      language,
      sectionId,
      section: null,
    });
  }
}

export default function AddActivity() {
  const { signed_in, user_flag, language, sectionId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "vi">(language);

  const handleActivityClick = (type: number) => {
    if (type === 4) {
      // Quiz - navigate to quiz creation
      navigate(`/courses/${sectionId}/create-quiz/?signed_in=1&user_flag=${user_flag}`);
    } else {
      // Assignment (1), File (2), Folder (3) - navigate to upload resource
      navigate(`/courses/${sectionId}/upload-resource/?signed_in=1&user_flag=${user_flag}&type=${type}`);
    }
  };

  const handleClose = () => {
    navigate(`/courses/${sectionId}?signed_in=1&user_flag=${user_flag}`);
  };

  // Styles
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const dialogStyle: React.CSSProperties = {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    maxWidth: "900px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
    position: "relative",
  };

  const headerStyle: React.CSSProperties = {
    padding: "2rem",
    borderBottom: "1px solid #E0E0E0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "2rem",
    fontWeight: "600",
    color: "#2C8B85",
    margin: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "2rem",
    color: "#999999",
    cursor: "pointer",
    padding: "0",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
  };

  const contentStyle: React.CSSProperties = {
    padding: "2rem",
    backgroundColor: "#F5F5F5",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "2rem",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    minHeight: "200px",
  };

  const iconContainerStyle: React.CSSProperties = {
    width: "120px",
    height: "120px",
    borderRadius: "16px",
    backgroundColor: "#2C8B85",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1rem",
  };

  const iconStyle: React.CSSProperties = {
    fontSize: "4rem",
    color: "#FFFFFF",
  };

  const cardLabelStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: "500",
    color: "#2C8B85",
    marginTop: "0.5rem",
  };

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>
            {currentLanguage === "en" ? "Add an activity or resource" : "Thêm hoạt động hoặc tài nguyên"}
          </h2>
          <button
            style={closeButtonStyle}
            onClick={handleClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F0F0F0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            ✕
          </button>
        </div>

        <div style={contentStyle}>
          <div style={gridStyle}>
            {/* Assignment Card */}
            <div
              style={cardStyle}
              onClick={() => handleActivityClick(1)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={iconContainerStyle}>
                <div style={iconStyle}>📤</div>
              </div>
              <div style={cardLabelStyle}>
                {currentLanguage === "en" ? "Assignment" : "Bài tập"}
              </div>
            </div>

            {/* File Card */}
            <div
              style={cardStyle}
              onClick={() => handleActivityClick(2)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={iconContainerStyle}>
                <div style={iconStyle}>📄</div>
              </div>
              <div style={cardLabelStyle}>
                {currentLanguage === "en" ? "File" : "Tệp"}
              </div>
            </div>

            {/* Folder Card */}
            <div
              style={cardStyle}
              onClick={() => handleActivityClick(3)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={iconContainerStyle}>
                <div style={iconStyle}>📁</div>
              </div>
              <div style={cardLabelStyle}>
                {currentLanguage === "en" ? "Folder" : "Thư mục"}
              </div>
            </div>

            {/* Quiz Card */}
            <div
              style={cardStyle}
              onClick={() => handleActivityClick(4)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={iconContainerStyle}>
                <div style={iconStyle}>✓</div>
              </div>
              <div style={cardLabelStyle}>
                {currentLanguage === "en" ? "Quiz" : "Bài kiểm tra"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
