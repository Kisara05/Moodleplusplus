import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher, useSearchParams, useNavigate, useRevalidator } from "@remix-run/react";
import { useState, useEffect } from "react";
import { 
    enroll, 
    unregister,
    getAllEnrollablesforStudent, 
    getEnrolledOpenSections
} from "~/services/course/enroll.server"; 
import { getUserId } from "~/services/auth/session.server";
import { getRoleandID, getName } from "~/services/user/user.server";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";

// --- 1. LOADER ---
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (!userId) return redirect("/login");
  
  const { role, id } = await getRoleandID(userId);
  if (role !== 'student') return redirect("/dashboard");

  // Get language from URL params, default to "en"
  const url = new URL(request.url);
  const language = (url.searchParams.get("lang") as "en" | "vi") || "en";

  // Fetch the two distinct lists
  const availableRaw = await getAllEnrollablesforStudent(id);
  const enrolledRaw = await getEnrolledOpenSections(id);

  // Get user name for header
  let userName = "";
  try {
    userName = await getName(userId);
  } catch (error) {
    console.error("Error fetching user name:", error);
  }

  return json({ 
    userId,
    userFlag: "student", // For header compatibility
    language,
    userName,
    availableSections: availableRaw || [], 
    enrolledSections: enrolledRaw || []
  });
}

// --- 2. ACTION ---
export async function action({ request }: ActionFunctionArgs) {
  const userId = await getUserId(request);
  if (!userId) return redirect("/login");
  
  const { role, id } = await getRoleandID(userId);
  if (role !== 'student') return redirect("/dashboard");

  const formData = await request.formData();
  
  const sectionId = String(formData.get("sectionId"));
  const intent = formData.get("intent"); // Check if we are enrolling or dropping

  if (!sectionId) {
    return json({ success: false, error: "Missing section ID" }, { status: 400 });
  }

  try {
    if (intent === "unregister") {
      await unregister(id, sectionId);
      return json({ success: true, message: "Successfully unenrolled from course!" });
    } else {
      await enroll(id, sectionId);
      return json({ success: true, message: "Successfully enrolled in course!" });
    }
  } catch (error: any) {
    console.error("Action Failed:", error);
    return json({ 
      success: false, 
      error: error.message || "Database operation failed" 
    }, { status: 500 });
  }
}

// --- 3. UI COMPONENT ---
export default function CourseRegistration() {
  const loaderData = useLoaderData<typeof loader>();
  const { userId, userFlag, language: initialLanguage, userName, availableSections: initialAvailable, enrolledSections: initialEnrolled } = loaderData;
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "vi">(initialLanguage);
  
  // State for filters
  const [schoolYear, setSchoolYear] = useState("2025 - 2026");
  const [semester, setSemester] = useState("Semester 1");
  const [program, setProgram] = useState("Advanced Program (APCS)");
  
  // State for courses - managed locally but synced with backend
  const [enrolledSections, setEnrolledSections] = useState<any[]>(initialEnrolled || []);
  const [availableSections, setAvailableSections] = useState<any[]>(initialAvailable || []);
  
  // State for messages
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Determine if semester is open for registration
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);

  // Sync with loader data when it changes
  useEffect(() => {
    setEnrolledSections(initialEnrolled || []);
    setAvailableSections(initialAvailable || []);
  }, [initialEnrolled, initialAvailable]);

  const toggleLanguage = () => {
    const newLang = currentLanguage === "en" ? "vi" : "en";
    setCurrentLanguage(newLang);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("lang", newLang);
    setSearchParams(newParams);
  };

  // Handle checkbox toggle - calls backend and updates UI
  const handleCourseToggle = (sectionId: string, isEnrolled: boolean) => {
    // This will be handled by the CourseRow component using fetcher
    // We keep this function for potential future batch operations
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
    accentColor: "#28a745",
  };

  return (
    <div style={containerStyle}>
      <Header 
        signed_in={true} 
        language={currentLanguage} 
        onLanguageChange={toggleLanguage} 
        user_flag={userFlag === "student" ? 1 : 0}
        userId={userId}
      />
      
      <main style={mainStyle}>
        {/* Filter Bar */}
        <div style={filterBarStyle}>
          <button style={filterButtonStyle}>
            {currentLanguage === "en" ? schoolYear : schoolYear}
          </button>
          <button style={filterButtonStyle}>
            {currentLanguage === "en" ? semester : "Học kỳ 1"}
          </button>
          <button style={filterButtonStyle}>{program}</button>
        </div>

        {/* Messages */}
        {message && (
          <div style={message.type === 'success' ? successMessageStyle : errorMessageStyle}>
            {message.text}
          </div>
        )}

        {/* Registered Courses Table */}
        <h2 style={sectionTitleStyle}>
          {currentLanguage === "en" ? "Registered Courses" : "Khóa học đã đăng ký"}
        </h2>
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...thStyle, ...colCourseIdStyle }}>
                  {currentLanguage === "en" ? "Course ID" : "Mã khóa học"}
                </th>
                <th style={{ ...thStyle, ...colCourseNameStyle }}>
                  {currentLanguage === "en" ? "Course name" : "Tên khóa học"}
                </th>
                <th style={{ ...thStyle, ...colClassStyle }}>
                  {currentLanguage === "en" ? "Class" : "Lớp"}
                </th>
                <th style={{ ...thStyle, ...colCreditsStyle }}>
                  {currentLanguage === "en" ? "Credits" : "Tín chỉ"}
                </th>
                <th style={{ ...thStyle, ...colScheduleStyle }}>
                  {currentLanguage === "en" ? "Schedule" : "Lịch học"}
                </th>
                <th style={{ ...thStyle, ...colRegisteredStyle }}>
                  {currentLanguage === "en" ? "Registered" : "Đã đăng ký"}
                </th>
                {isRegistrationOpen && (
                  <th style={{ ...thStyle, ...colActionStyle }}>
                    {currentLanguage === "en" ? "Cancel" : "Hủy"}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {enrolledSections.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...tdStyle, textAlign: "center", fontStyle: "italic", color: "#868e96" }}>
                    {currentLanguage === "en" ? "No registered courses" : "Không có khóa học nào đã đăng ký"}
                  </td>
                </tr>
              ) : (
                enrolledSections.map((section: any) => (
                  <EnrolledRow
                    key={section.section_id}
                    section={section}
                    language={currentLanguage}
                    checkboxStyle={checkboxStyle}
                    tdStyle={tdStyle}
                    tdCenterStyle={tdCenterStyle}
                    colCourseIdStyle={colCourseIdStyle}
                    colCourseNameStyle={colCourseNameStyle}
                    colClassStyle={colClassStyle}
                    colCreditsStyle={colCreditsStyle}
                    colScheduleStyle={colScheduleStyle}
                    colRegisteredStyle={colRegisteredStyle}
                    colActionStyle={colActionStyle}
                        onUpdate={(updatedSections) => {
                          setEnrolledSections(updatedSections);
                        }}
                    onMoveToAvailable={(section) => {
                      setEnrolledSections(prev => prev.filter(s => s.section_id !== section.section_id));
                      const transformedCourse = {
                        ...section,
                        course: section.course_id ? [{
                          course_id: section.course_id,
                          course_name: section.course_name
                        }] : section.course
                      };
                      setAvailableSections(prev => [...prev, transformedCourse]);
                      // Revalidate to ensure data consistency after a brief delay
                      setTimeout(() => {
                        revalidator.revalidate();
                      }, 500);
                    }}
                    revalidator={revalidator}
                  />
                ))
              )}
            </tbody>
          </table>
          <div style={{ clear: "both" }}></div>
        </div>

        {/* Available Courses Table - Only show if registration is open */}
        {isRegistrationOpen && (
          <>
            <h2 style={sectionTitleStyle}>
              {currentLanguage === "en" ? "Available Courses" : "Khóa học có sẵn"}
            </h2>
            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, ...colCourseIdStyle }}>
                      {currentLanguage === "en" ? "Course ID" : "Mã khóa học"}
                    </th>
                    <th style={{ ...thStyle, ...colCourseNameStyle }}>
                      {currentLanguage === "en" ? "Course name" : "Tên khóa học"}
                    </th>
                    <th style={{ ...thStyle, ...colClassStyle }}>
                      {currentLanguage === "en" ? "Class" : "Lớp"}
                    </th>
                    <th style={{ ...thStyle, ...colCreditsStyle }}>
                      {currentLanguage === "en" ? "Credits" : "Tín chỉ"}
                    </th>
                    <th style={{ ...thStyle, ...colScheduleStyle }}>
                      {currentLanguage === "en" ? "Schedule" : "Lịch học"}
                    </th>
                    <th style={{ ...thStyle, ...colRegisteredStyle }}>
                      {currentLanguage === "en" ? "Registered" : "Đã đăng ký"}
                    </th>
                    <th style={{ ...thStyle, ...colActionStyle }}>
                      {currentLanguage === "en" ? "Enroll" : "Đăng ký"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {availableSections.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ ...tdStyle, textAlign: "center", fontStyle: "italic", color: "#868e96" }}>
                        {currentLanguage === "en" ? "No available courses" : "Không có khóa học nào có sẵn"}
                      </td>
                    </tr>
                  ) : (
                    availableSections.map((section: any) => (
                      <AvailableRow
                        key={section.section_id}
                        section={section}
                        language={currentLanguage}
                        checkboxStyle={checkboxStyle}
                        tdStyle={tdStyle}
                        tdCenterStyle={tdCenterStyle}
                        colCourseIdStyle={colCourseIdStyle}
                        colCourseNameStyle={colCourseNameStyle}
                        colClassStyle={colClassStyle}
                        colCreditsStyle={colCreditsStyle}
                        colScheduleStyle={colScheduleStyle}
                        colRegisteredStyle={colRegisteredStyle}
                        colActionStyle={colActionStyle}
                        onUpdate={(updatedSections) => {
                          setAvailableSections(updatedSections);
                        }}
                        onMoveToEnrolled={(section) => {
                          setAvailableSections(prev => prev.filter(s => s.section_id !== section.section_id));
                          const transformedCourse = {
                            ...section,
                            course_id: section.course?.[0]?.course_id || section.course?.course_id || section.course_id,
                            course_name: section.course?.[0]?.course_name || section.course?.course_name || section.course_name
                          };
                          setEnrolledSections(prev => [...prev, transformedCourse]);
                          // Revalidate to ensure data consistency after a brief delay
                          setTimeout(() => {
                            revalidator.revalidate();
                          }, 500);
                        }}
                        revalidator={revalidator}
                      />
                    ))
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

// --- SUB-COMPONENT 1: Enrolled Row (Unregister) ---
function EnrolledRow({ 
  section, 
  language, 
  checkboxStyle, 
  tdStyle, 
  tdCenterStyle,
  colCourseIdStyle,
  colCourseNameStyle,
  colClassStyle,
  colCreditsStyle,
  colScheduleStyle,
  colRegisteredStyle,
  colActionStyle,
  onUpdate,
  onMoveToAvailable,
  revalidator
}: {
  section: any;
  language: "en" | "vi";
  checkboxStyle: React.CSSProperties;
  tdStyle: React.CSSProperties;
  tdCenterStyle: React.CSSProperties;
  colCourseIdStyle: React.CSSProperties;
  colCourseNameStyle: React.CSSProperties;
  colClassStyle: React.CSSProperties;
  colCreditsStyle: React.CSSProperties;
  colScheduleStyle: React.CSSProperties;
  colRegisteredStyle: React.CSSProperties;
  colActionStyle: React.CSSProperties;
  onUpdate: (sections: any[]) => void;
  onMoveToAvailable: (section: any) => void;
  revalidator?: { revalidate: () => void };
}) {
  const fetcher = useFetcher();
  const isProcessing = fetcher.state === "submitting" || fetcher.state === "idle";
  const response = fetcher.data as { success?: boolean; error?: string; message?: string } | undefined;

  const [isChecked, setIsChecked] = useState(true);

  // Handle response
  useEffect(() => {
    if (fetcher.state === "idle" && response) {
      if (response.success) {
        // Move to available on success
        onMoveToAvailable(section);
      } else {
        // Revert checkbox state on error
        setIsChecked(true);
      }
    }
  }, [fetcher.state, response]);

  const courseId = section.course_id || section.course?.[0]?.course_id || section.course?.course_id || 'N/A';
  const courseName = section.course_name || section.course?.[0]?.course_name || section.course?.course_name || 'N/A';
  const classCode = section.section_id || 'N/A';

  return (
    <tr>
      <td style={{ ...tdStyle, ...colCourseIdStyle }}>{courseId}</td>
      <td style={{ ...tdStyle, ...colCourseNameStyle }} title={courseName}>{courseName}</td>
      <td style={{ ...tdStyle, ...colClassStyle }}>{classCode}</td>
      <td style={{ ...tdCenterStyle, ...colCreditsStyle }}>4</td>
      <td style={{ ...tdStyle, ...colScheduleStyle }}>-</td>
      <td style={{ ...tdCenterStyle, ...colRegisteredStyle }}>-</td>
      <td style={{ ...tdCenterStyle, ...colActionStyle }}>
        <fetcher.Form method="post">
          <input type="hidden" name="sectionId" value={section.section_id} />
          <input type="hidden" name="intent" value="unregister" />
          <input
            type="checkbox"
            style={checkboxStyle}
            checked={isChecked}
            disabled={fetcher.state === "submitting"}
            onChange={(e) => {
              const newChecked = e.target.checked;
              if (!newChecked) {
                // Unchecking = unenroll
                setIsChecked(false);
                fetcher.submit(e.currentTarget.form, { method: "post" });
              } else {
                setIsChecked(true);
              }
            }}
          />
        </fetcher.Form>
      </td>
    </tr>
  );
}

// --- SUB-COMPONENT 2: Available Row (Register) ---
function AvailableRow({ 
  section, 
  language, 
  checkboxStyle, 
  tdStyle, 
  tdCenterStyle,
  colCourseIdStyle,
  colCourseNameStyle,
  colClassStyle,
  colCreditsStyle,
  colScheduleStyle,
  colRegisteredStyle,
  colActionStyle,
  onUpdate,
  onMoveToEnrolled,
  revalidator
}: {
  section: any;
  language: "en" | "vi";
  checkboxStyle: React.CSSProperties;
  tdStyle: React.CSSProperties;
  tdCenterStyle: React.CSSProperties;
  colCourseIdStyle: React.CSSProperties;
  colCourseNameStyle: React.CSSProperties;
  colClassStyle: React.CSSProperties;
  colCreditsStyle: React.CSSProperties;
  colScheduleStyle: React.CSSProperties;
  colRegisteredStyle: React.CSSProperties;
  colActionStyle: React.CSSProperties;
  onUpdate: (sections: any[]) => void;
  onMoveToEnrolled: (section: any) => void;
  revalidator?: { revalidate: () => void };
}) {
  const fetcher = useFetcher();
  const isProcessing = fetcher.state === "submitting" || fetcher.state === "idle";
  const response = fetcher.data as { success?: boolean; error?: string; message?: string } | undefined;

  const [isChecked, setIsChecked] = useState(false);

  // Handle response
  useEffect(() => {
    if (fetcher.state === "idle" && response) {
      if (response.success) {
        // Move to enrolled on success
        onMoveToEnrolled(section);
      } else {
        // Revert checkbox state on error
        setIsChecked(false);
      }
    }
  }, [fetcher.state, response]);

  const courseId = section.course?.[0]?.course_id || section.course?.course_id || section.course_id || 'N/A';
  const courseName = section.course?.[0]?.course_name || section.course?.course_name || section.course_name || 'N/A';
  const classCode = section.section_id || 'N/A';

  return (
    <tr>
      <td style={{ ...tdStyle, ...colCourseIdStyle }}>{courseId}</td>
      <td style={{ ...tdStyle, ...colCourseNameStyle }} title={courseName}>{courseName}</td>
      <td style={{ ...tdStyle, ...colClassStyle }}>{classCode}</td>
      <td style={{ ...tdCenterStyle, ...colCreditsStyle }}>4</td>
      <td style={{ ...tdStyle, ...colScheduleStyle }}>-</td>
      <td style={{ ...tdCenterStyle, ...colRegisteredStyle }}>-</td>
      <td style={{ ...tdCenterStyle, ...colActionStyle }}>
        <fetcher.Form method="post">
          <input type="hidden" name="sectionId" value={section.section_id} />
          <input type="hidden" name="intent" value="enroll" />
          <input
            type="checkbox"
            style={checkboxStyle}
            checked={isChecked}
            disabled={fetcher.state === "submitting"}
            onChange={(e) => {
              const newChecked = e.target.checked;
              if (newChecked) {
                // Checking = enroll
                setIsChecked(true);
                fetcher.submit(e.currentTarget.form, { method: "post" });
              } else {
                setIsChecked(false);
              }
            }}
          />
        </fetcher.Form>
      </td>
    </tr>
  );
}
