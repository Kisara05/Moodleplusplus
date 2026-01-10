import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { useState, useEffect } from "react";
import { getAllEnrollablesforStudent, enroll, getEnrolledOpenSections, unregister } from "~/services/course/enroll.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const signed_in = url.searchParams.get("signed_in") === "1";
  const user_flag = url.searchParams.get("user_flag") || "student";
  const language = (url.searchParams.get("lang") as "en" | "vi") || "en";
  const userId = url.searchParams.get("userId");

  // If not signed in, redirect to login
  if (!signed_in || !userId) {
    throw new Response(null, {
      status: 302,
      headers: { Location: "/login" },
    });
  }

  try {
    // Get available courses and enrolled courses
    const availableSections = await getAllEnrollablesforStudent(userId);
    const enrolledSections = await getEnrolledOpenSections(userId);

    return json({
      signed_in,
      user_flag,
      language,
      userId,
      availableSections: availableSections || [],
      enrolledSections: enrolledSections || [],
    });
  } catch (error) {
    console.error("Error loading course registration data:", error);
    return json({
      signed_in,
      user_flag,
      language,
      userId,
      availableSections: [],
      enrolledSections: [],
      error: "Failed to load courses",
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("_action");
  const userId = formData.get("userId") as string;
  const sectionIds = formData.get("sectionIds") as string;

  if (!userId || !sectionIds) {
    return json({ success: false, error: "Missing required fields" }, { status: 400 });
  }

  const sectionIdArray = sectionIds.split(",").filter(id => id.trim());

  try {
    if (action === "enroll") {
      // Batch enroll
      for (const sectionId of sectionIdArray) {
        await enroll(userId, sectionId);
      }
      return json({ success: true, message: `Successfully enrolled in ${sectionIdArray.length} course(s)!` });
    } else if (action === "unenroll") {
      // Batch unenroll
      for (const sectionId of sectionIdArray) {
        await unregister(userId, sectionId);
      }
      return json({ success: true, message: `Successfully unenrolled from ${sectionIdArray.length} course(s)!` });
    }
    return json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error processing enrollment:", error);
    return json({ 
      success: false, 
      error: error.message || "An error occurred" 
    }, { status: 500 });
  }
}

export default function CourseRegistration() {
  const loaderData = useLoaderData<typeof loader>();
  const { signed_in, user_flag, language, userId, availableSections: initialAvailable, enrolledSections: initialEnrolled } = loaderData;
  const error = (loaderData as any).error;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "vi">(language);
  
  // State for filters
  const [schoolYear, setSchoolYear] = useState("2025 - 2026");
  const [semester, setSemester] = useState("Semester 1");
  const [program, setProgram] = useState("Advanced Program (APCS)");
  
  // State for courses - now managed locally
  const [enrolledSections, setEnrolledSections] = useState<any[]>(initialEnrolled);
  const [availableSections, setAvailableSections] = useState<any[]>(initialAvailable);
  
  // State for messages
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Determine if semester is open for registration
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);

  const toggleLanguage = () => {
    const newLang = currentLanguage === "en" ? "vi" : "en";
    setCurrentLanguage(newLang);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("lang", newLang);
    setSearchParams(newParams);
  };

  // Handle checkbox toggle - moves courses between tables
  const handleCourseToggle = async (sectionId: string, isEnrolled: boolean) => {
    if (isEnrolled) {
      // Move from enrolled to available
      const courseToMove = enrolledSections.find(s => s.section_id === sectionId);
      if (courseToMove) {
        setEnrolledSections(prev => prev.filter(s => s.section_id !== sectionId));
        // Transform the course to match available format if needed
        const transformedCourse = {
          ...courseToMove,
          course: courseToMove.course_id ? [{
            course_id: courseToMove.course_id,
            course_name: courseToMove.course_name
          }] : courseToMove.course
        };
        setAvailableSections(prev => [...prev, transformedCourse]);
        
        // TODO: Backend call to unenroll
        // Store action for later backend implementation: unenroll(userId, sectionId)
      }
    } else {
      // Move from available to enrolled
      const courseToMove = availableSections.find(s => s.section_id === sectionId);
      if (courseToMove) {
        setAvailableSections(prev => prev.filter(s => s.section_id !== sectionId));
        // Transform the course to match enrolled format
        const transformedCourse = {
          ...courseToMove,
          course_id: courseToMove.course?.[0]?.course_id || courseToMove.course?.course_id || courseToMove.course_id,
          course_name: courseToMove.course?.[0]?.course_name || courseToMove.course?.course_name || courseToMove.course_name
        };
        setEnrolledSections(prev => [...prev, transformedCourse]);
        
        // TODO: Backend call to enroll
        // Store action for later backend implementation: enroll(userId, sectionId)
      }
    }
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f0f4f8",
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: "1.5rem 2rem",
    maxWidth: "1600px",
    margin: "0 auto",
    width: "100%",
  };

  const filterBarStyle: React.CSSProperties = {
    display: "flex",
    gap: "1.5rem",
    marginBottom: "1.5rem",
    padding: "0.8rem 1rem",
    backgroundColor: "white",
    borderRadius: "8px",
    alignItems: "center",
  };

  const filterButtonStyle: React.CSSProperties = {
    padding: "0.5rem 1.2rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    backgroundColor: "#f8f9fa",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#495057",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "1.3rem",
    fontWeight: "600",
    marginBottom: "0.8rem",
    color: "#2c6975",
  };

  const tableContainerStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "1rem",
    tableLayout: "fixed",
  };

  const thStyle: React.CSSProperties = {
    padding: "0.65rem 0.5rem",
    textAlign: "left",
    borderBottom: "2px solid #e9ecef",
    fontWeight: "600",
    fontSize: "0.85rem",
    color: "#495057",
    backgroundColor: "#f8f9fa",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const tdStyle: React.CSSProperties = {
    padding: "0.65rem 0.5rem",
    borderBottom: "1px solid #f1f3f5",
    fontSize: "0.85rem",
    color: "#495057",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const tdCenterStyle: React.CSSProperties = {
    ...tdStyle,
    textAlign: "center",
  };

  // Column width styles
  const colCourseIdStyle: React.CSSProperties = { width: "10%" };
  const colCourseNameStyle: React.CSSProperties = { width: "32%" };
  const colClassStyle: React.CSSProperties = { width: "12%" };
  const colCreditsStyle: React.CSSProperties = { width: "8%" };
  const colScheduleStyle: React.CSSProperties = { width: "15%" };
  const colRegisteredStyle: React.CSSProperties = { width: "11%" };
  const colActionStyle: React.CSSProperties = { width: "8%", textAlign: "center" };

  const confirmButtonStyle: React.CSSProperties = {
    padding: "0.7rem 2.5rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "1rem",
    backgroundColor: "#2c7a7b",
    color: "white",
    float: "right",
    transition: "background-color 0.2s",
  };

  const messageStyle: React.CSSProperties = {
    padding: "1rem 1.5rem",
    borderRadius: "6px",
    marginBottom: "1.5rem",
    fontWeight: "500",
    fontSize: "0.95rem",
  };

  const successMessageStyle: React.CSSProperties = {
    ...messageStyle,
    backgroundColor: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
  };

  const errorMessageStyle: React.CSSProperties = {
    ...messageStyle,
    backgroundColor: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
  };

  const checkboxStyle: React.CSSProperties = {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    accentColor: "#28a745", // Green color for checkboxes
  };

  return (
    <div style={containerStyle}>
      <Header 
        signed_in={signed_in} 
        language={currentLanguage} 
        onLanguageChange={toggleLanguage} 
        user_flag={user_flag === "student" ? 1 : 0}
        userId={userId}
      />
      
      <main style={mainStyle}>
        {/* Filter Bar */}
        <div style={filterBarStyle}>
          <button style={filterButtonStyle}>{schoolYear}</button>
          <button style={filterButtonStyle}>{semester}</button>
          <button style={filterButtonStyle}>{program}</button>
        </div>

        {/* Messages */}
        {message && (
          <div style={message.type === 'success' ? successMessageStyle : errorMessageStyle}>
            {message.text}
          </div>
        )}

        {error && (
          <div style={errorMessageStyle}>
            {error}
          </div>
        )}

        {/* Registered Courses Table */}
        <h2 style={sectionTitleStyle}>Registered Courses</h2>
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...thStyle, ...colCourseIdStyle }}>Course ID</th>
                <th style={{ ...thStyle, ...colCourseNameStyle }}>Course name</th>
                <th style={{ ...thStyle, ...colClassStyle }}>Class</th>
                <th style={{ ...thStyle, ...colCreditsStyle }}>Credits</th>
                <th style={{ ...thStyle, ...colScheduleStyle }}>Schedule</th>
                <th style={{ ...thStyle, ...colRegisteredStyle }}>Registered</th>
                {isRegistrationOpen && <th style={{ ...thStyle, ...colActionStyle }}>Cancel</th>}
              </tr>
            </thead>
            <tbody>
              {enrolledSections.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...tdStyle, textAlign: "center", fontStyle: "italic", color: "#868e96" }}>
                    No registered courses
                  </td>
                </tr>
              ) : (
                enrolledSections.map((section: any) => {
                  const courseId = section.course_id || 'N/A';
                  const courseName = section.course_name || 'N/A';
                  const classCode = section.section_id || 'N/A';
                  
                  return (
                    <tr key={section.section_id}>
                      <td style={{ ...tdStyle, ...colCourseIdStyle }}>{courseId}</td>
                      <td style={{ ...tdStyle, ...colCourseNameStyle }} title={courseName}>{courseName}</td>
                      <td style={{ ...tdStyle, ...colClassStyle }}>{classCode}</td>
                      <td style={{ ...tdCenterStyle, ...colCreditsStyle }}>4</td>
                      <td style={{ ...tdStyle, ...colScheduleStyle }}>-</td>
                      <td style={{ ...tdCenterStyle, ...colRegisteredStyle }}>-</td>
                      {isRegistrationOpen && (
                        <td style={{ ...tdCenterStyle, ...colActionStyle }}>
                          <input
                            type="checkbox"
                            style={checkboxStyle}
                            checked={true}
                            onChange={() => handleCourseToggle(section.section_id, true)}
                          />
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div style={{ clear: "both" }}></div>
        </div>

        {/* Available Courses Table - Only show if registration is open */}
        {isRegistrationOpen && (
          <>
            <h2 style={sectionTitleStyle}>Available Courses</h2>
            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, ...colCourseIdStyle }}>Course ID</th>
                    <th style={{ ...thStyle, ...colCourseNameStyle }}>Course name</th>
                    <th style={{ ...thStyle, ...colClassStyle }}>Class</th>
                    <th style={{ ...thStyle, ...colCreditsStyle }}>Credits</th>
                    <th style={{ ...thStyle, ...colScheduleStyle }}>Schedule</th>
                    <th style={{ ...thStyle, ...colRegisteredStyle }}>Registered</th>
                    <th style={{ ...thStyle, ...colActionStyle }}>Enroll</th>
                  </tr>
                </thead>
                <tbody>
                  {availableSections.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ ...tdStyle, textAlign: "center", fontStyle: "italic", color: "#868e96" }}>
                        No available courses
                      </td>
                    </tr>
                  ) : (
                    availableSections.map((section: any) => {
                      const courseId = section.course?.[0]?.course_id || section.course?.course_id || 'N/A';
                      const courseName = section.course?.[0]?.course_name || section.course?.course_name || 'N/A';
                      const classCode = section.section_id || 'N/A';
                      
                      return (
                        <tr key={section.section_id}>
                          <td style={{ ...tdStyle, ...colCourseIdStyle }}>{courseId}</td>
                          <td style={{ ...tdStyle, ...colCourseNameStyle }} title={courseName}>{courseName}</td>
                          <td style={{ ...tdStyle, ...colClassStyle }}>{classCode}</td>
                          <td style={{ ...tdCenterStyle, ...colCreditsStyle }}>4</td>
                          <td style={{ ...tdStyle, ...colScheduleStyle }}>-</td>
                          <td style={{ ...tdCenterStyle, ...colRegisteredStyle }}>-</td>
                          <td style={{ ...tdCenterStyle, ...colActionStyle }}>
                            <input
                              type="checkbox"
                              style={checkboxStyle}
                              checked={false}
                              onChange={() => handleCourseToggle(section.section_id, false)}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <div style={{ clear: "both" }}></div>
            </div>
          </>
        )}
      </main>

      <Footer language={currentLanguage} />
    </div>
  );
}
