import { useLoaderData, useActionData, useNavigate, useSearchParams, Form } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { useState } from "react";
import { 
  getRegisteredCourses, 
  getAvailableCourses, 
  cancelEnrollments, 
  enrollInCourses 
} from "~/services/course.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const signed_in = url.searchParams.get("signed_in") === "1";
  const user_flag = parseInt(url.searchParams.get("user_flag") || "1");
  const language = (url.searchParams.get("lang") as "en" | "vi") || "en";
  const userId = url.searchParams.get("userId") || "123"; // TODO: Get from session

  // If not signed in, redirect to login
  if (!signed_in) {
    throw new Response(null, {
      status: 302,
      headers: { Location: "/login" },
    });
  }

  // Only students can access course registration
  if (user_flag !== 1) {
    throw new Response(null, {
      status: 302,
      headers: { Location: "/?signed_in=1&user_flag=" + user_flag },
    });
  }

  // Get filters from URL
  const year = url.searchParams.get("year") || "";
  const semester = url.searchParams.get("semester") || "";
  const program = url.searchParams.get("program") || "";
  const searchQuery = url.searchParams.get("search") || "";

  try {
    // Fetch registered and available courses
    const registeredCourses = await getRegisteredCourses(userId);
    const availableCourses = await getAvailableCourses(userId, {
      year: year || undefined,
      semester: semester || undefined,
      program: program || undefined,
    });

    // Filter by search query if provided
    let filteredAvailable = availableCourses;
    if (searchQuery) {
      filteredAvailable = availableCourses.filter((course: any) => {
        const courseName = course.course?.course_name || "";
        const courseId = course.course?.course_id || "";
        const className = course.class_name || "";
        return (
          courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          courseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          className.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    return json({
      signed_in,
      user_flag,
      language,
      userId,
      registeredCourses: registeredCourses || [],
      availableCourses: filteredAvailable || [],
      filters: { year, semester, program, search: searchQuery },
    });
  } catch (error) {
    console.error("Error loading courses:", error);
    return json({
      signed_in,
      user_flag,
      language,
      userId,
      registeredCourses: [],
      availableCourses: [],
      filters: { year, semester, program, search: searchQuery },
      error: error instanceof Error ? error.message : "Failed to load courses",
    });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string; // "cancel" or "enroll"
  const userId = formData.get("userId") as string;
  const sectionIds = formData.getAll("sectionIds") as string[];

  if (!userId || !sectionIds || sectionIds.length === 0) {
    return json({ success: false, error: "No courses selected" });
  }

  try {
    if (actionType === "cancel") {
      const result = await cancelEnrollments(userId, sectionIds);
      return json(result);
    } else if (actionType === "enroll") {
      const result = await enrollInCourses(userId, sectionIds);
      return json(result);
    } else {
      return json({ success: false, error: "Invalid action type" });
    }
  } catch (error) {
    console.error("Error processing enrollment:", error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to process enrollment",
    });
  }
}

export default function CourseRegistration() {
  const {
    signed_in,
    user_flag,
    language,
    userId,
    registeredCourses,
    availableCourses,
    filters,
    error: loadError,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "vi">(language);
  const [selectedCancel, setSelectedCancel] = useState<Set<string>>(new Set());
  const [selectedEnroll, setSelectedEnroll] = useState<Set<string>>(new Set());

  const toggleLanguage = () => {
    const newLang = currentLanguage === "en" ? "vi" : "en";
    setCurrentLanguage(newLang);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("lang", newLang);
    setSearchParams(newParams);
  };

  const handleFilterClick = (filterType: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (newParams.get(filterType) === value) {
      newParams.delete(filterType);
    } else {
      newParams.set(filterType, value);
    }
    setSearchParams(newParams);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    const newParams = new URLSearchParams(searchParams);
    if (search) {
      newParams.set("search", search);
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  };

  const handleCheckboxChange = (sectionId: string, type: "cancel" | "enroll") => {
    if (type === "cancel") {
      const newSet = new Set(selectedCancel);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      setSelectedCancel(newSet);
    } else {
      const newSet = new Set(selectedEnroll);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      setSelectedEnroll(newSet);
    }
  };

  const handleConfirmCancel = () => {
    if (selectedCancel.size === 0) return;
    // Form submission will be handled by Remix action
  };

  const handleConfirmEnroll = () => {
    if (selectedEnroll.size === 0) return;
    // Form submission will be handled by Remix action
  };

  // Redirect on success
  if (actionData?.success) {
    // Reload the page to show updated courses
    window.location.reload();
  }

  if (!signed_in || user_flag !== 1) {
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

  const filterBarStyle: React.CSSProperties = {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
    flexWrap: "wrap",
  };

  const filterButtonStyle: React.CSSProperties = {
    backgroundColor: "#D9D9D9",
    borderRadius: "25px",
    padding: "0.5rem 1rem",
    border: "none",
    cursor: "pointer",
    fontSize: "0.9rem",
    color: "#000000",
    fontWeight: "500",
  };

  const activeFilterButtonStyle: React.CSSProperties = {
    ...filterButtonStyle,
    backgroundColor: "#2C8B85",
    color: "#FFFFFF",
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
    color: "#2C8B85",
    marginBottom: "1.5rem",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 0.5rem",
  };

  const tableHeaderStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "1rem",
    color: "#000000",
    fontWeight: "bold",
    fontSize: "0.9rem",
  };

  const tableRowStyle: React.CSSProperties = {
    backgroundColor: "#D9D9D9",
    borderRadius: "25px",
  };

  const tableCellStyle: React.CSSProperties = {
    padding: "1rem",
    borderRadius: "25px",
  };

  const checkboxContainerStyle: React.CSSProperties = {
    width: "24px",
    height: "24px",
    borderRadius: "25px",
    border: "2px solid #565656",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    backgroundColor: "#FFFFFF",
  };

  const checkboxCheckedStyle: React.CSSProperties = {
    ...checkboxContainerStyle,
    backgroundColor: "#2C8B85",
    borderColor: "#2C8B85",
  };

  const confirmButtonStyle: React.CSSProperties = {
    backgroundColor: "#0A853F",
    color: "#FFFFFF",
    borderRadius: "25px",
    padding: "1rem 2rem",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    marginTop: "1.5rem",
    width: "100%",
    maxWidth: "300px",
  };

  const errorStyle: React.CSSProperties = {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "1rem",
    borderRadius: "25px",
    marginBottom: "1rem",
    textAlign: "center",
  };

  const successStyle: React.CSSProperties = {
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    padding: "1rem",
    borderRadius: "25px",
    marginBottom: "1rem",
    textAlign: "center",
  };

  // Format registered courses data
  const formattedRegistered = registeredCourses.map((enrollment: any) => {
    const section = enrollment.section;
    const course = section?.course;
    return {
      enrollmentId: enrollment.enrollment_id,
      sectionId: section?.section_id,
      courseId: course?.course_id || "",
      courseName: course?.course_name || "",
      className: section?.class_name || "",
      credits: course?.credits || 0,
      schedule: section?.schedule || "",
      registered: `${section?.current_students || 0}/${section?.max_students || 0}`,
    };
  });

  // Format available courses data
  const formattedAvailable = availableCourses.map((section: any) => {
    const course = section.course;
    return {
      sectionId: section.section_id,
      courseId: course?.course_id || "",
      courseName: course?.course_name || "",
      className: section.class_name || "",
      credits: course?.credits || 0,
      schedule: section.schedule || "",
      registered: `${section.current_students || 0}/${section.max_students || 0}`,
    };
  });

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
        {/* Filter Bar */}
        <div style={filterBarStyle}>
          <button
            style={filters.year === "2025-2026" ? activeFilterButtonStyle : filterButtonStyle}
            onClick={() => handleFilterClick("year", "2025-2026")}
          >
            2025 - 2026
          </button>
          <button
            style={filters.semester === "1" ? activeFilterButtonStyle : filterButtonStyle}
            onClick={() => handleFilterClick("semester", "1")}
          >
            Semester 1
          </button>
          <button
            style={filters.program === "APCS" ? activeFilterButtonStyle : filterButtonStyle}
            onClick={() => handleFilterClick("program", "APCS")}
          >
            Advanced Program (APCS)
          </button>
        </div>

        {/* Search Bar */}
        <Form method="get" onSubmit={handleSearch} style={searchBarStyle}>
          <input
            type="text"
            name="search"
            placeholder={currentLanguage === "en" ? "Search course" : "Tìm kiếm khóa học"}
            defaultValue={filters.search}
            style={searchInputStyle}
          />
          <img
            src="/icons/search.png"
            alt="Search"
            style={{ width: "24px", height: "24px", cursor: "pointer" }}
            onClick={(e) => {
              e.preventDefault();
              (e.currentTarget.closest("form") as HTMLFormElement)?.requestSubmit();
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </Form>

        {loadError && <div style={errorStyle}>{loadError}</div>}
        {actionData?.error && <div style={errorStyle}>{actionData.error}</div>}
        {actionData?.success && (
          <div style={successStyle}>
            {currentLanguage === "en" ? "Operation completed successfully!" : "Thao tác hoàn tất thành công!"}
          </div>
        )}

        {/* Registered Courses Section */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            {currentLanguage === "en" ? "Registered Courses" : "Khóa học đã đăng ký"}
          </h2>
          {formattedRegistered.length === 0 ? (
            <p style={{ color: "#565656" }}>
              {currentLanguage === "en" ? "No registered courses." : "Chưa có khóa học nào được đăng ký."}
            </p>
          ) : (
            <>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>
                      {currentLanguage === "en" ? "Course ID" : "Mã khóa học"}
                    </th>
                    <th style={tableHeaderStyle}>
                      {currentLanguage === "en" ? "Course name" : "Tên khóa học"}
                    </th>
                    <th style={tableHeaderStyle}>
                      {currentLanguage === "en" ? "Class" : "Lớp"}
                    </th>
                    <th style={tableHeaderStyle}>
                      {currentLanguage === "en" ? "Credits" : "Tín chỉ"}
                    </th>
                    <th style={tableHeaderStyle}>
                      {currentLanguage === "en" ? "Schedule" : "Lịch học"}
                    </th>
                    <th style={tableHeaderStyle}>
                      {currentLanguage === "en" ? "Registered" : "Đã đăng ký"}
                    </th>
                    <th style={tableHeaderStyle}>
                      {currentLanguage === "en" ? "Cancel" : "Hủy"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formattedRegistered.map((course) => (
                    <tr key={course.enrollmentId} style={tableRowStyle}>
                      <td style={tableCellStyle}>{course.courseId}</td>
                      <td style={tableCellStyle}>{course.courseName}</td>
                      <td style={tableCellStyle}>{course.className}</td>
                      <td style={tableCellStyle}>{course.credits}</td>
                      <td style={tableCellStyle}>{course.schedule}</td>
                      <td style={tableCellStyle}>{course.registered}</td>
                      <td style={tableCellStyle}>
                        <div
                          style={
                            selectedCancel.has(course.sectionId)
                              ? checkboxCheckedStyle
                              : checkboxContainerStyle
                          }
                          onClick={() => handleCheckboxChange(course.sectionId, "cancel")}
                        >
                          {selectedCancel.has(course.sectionId) && (
                            <span style={{ color: "#FFFFFF", fontSize: "0.8rem" }}>✓</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Form method="post">
                <input type="hidden" name="actionType" value="cancel" />
                <input type="hidden" name="userId" value={userId} />
                {Array.from(selectedCancel).map((sectionId) => (
                  <input key={sectionId} type="hidden" name="sectionIds" value={sectionId} />
                ))}
                <button
                  type="submit"
                  style={confirmButtonStyle}
                  disabled={selectedCancel.size === 0}
                  onClick={handleConfirmCancel}
                >
                  {currentLanguage === "en" ? "Confirm" : "Xác nhận"}
                </button>
              </Form>
            </>
          )}
        </div>

        {/* Available Courses Section */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            {currentLanguage === "en" ? "Available Courses" : "Khóa học có sẵn"}
          </h2>
          {formattedAvailable.length === 0 ? (
            <p style={{ color: "#565656" }}>
              {currentLanguage === "en" ? "No available courses." : "Không có khóa học nào có sẵn."}
            </p>
          ) : (
            <>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>
                      {currentLanguage === "en" ? "Course ID" : "Mã khóa học"}
                    </th>
                    <th style={tableHeaderStyle}>
                      {currentLanguage === "en" ? "Course name" : "Tên khóa học"}
                    </th>
                    <th style={tableHeaderStyle}>
                      {currentLanguage === "en" ? "Class" : "Lớp"}
                    </th>
                    <th style={tableHeaderStyle}>
                      {currentLanguage === "en" ? "Credits" : "Tín chỉ"}
                    </th>
                    <th style={tableHeaderStyle}>
                      {currentLanguage === "en" ? "Schedule" : "Lịch học"}
                    </th>
                    <th style={tableHeaderStyle}>
                      {currentLanguage === "en" ? "Registered" : "Đã đăng ký"}
                    </th>
                    <th style={tableHeaderStyle}>
                      {currentLanguage === "en" ? "Enroll" : "Đăng ký"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formattedAvailable.map((course) => (
                    <tr key={course.sectionId} style={tableRowStyle}>
                      <td style={tableCellStyle}>{course.courseId}</td>
                      <td style={tableCellStyle}>{course.courseName}</td>
                      <td style={tableCellStyle}>{course.className}</td>
                      <td style={tableCellStyle}>{course.credits}</td>
                      <td style={tableCellStyle}>{course.schedule}</td>
                      <td style={tableCellStyle}>{course.registered}</td>
                      <td style={tableCellStyle}>
                        <div
                          style={
                            selectedEnroll.has(course.sectionId)
                              ? checkboxCheckedStyle
                              : checkboxContainerStyle
                          }
                          onClick={() => handleCheckboxChange(course.sectionId, "enroll")}
                        >
                          {selectedEnroll.has(course.sectionId) && (
                            <span style={{ color: "#FFFFFF", fontSize: "0.8rem" }}>✓</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Form method="post">
                <input type="hidden" name="actionType" value="enroll" />
                <input type="hidden" name="userId" value={userId} />
                {Array.from(selectedEnroll).map((sectionId) => (
                  <input key={sectionId} type="hidden" name="sectionIds" value={sectionId} />
                ))}
                <button
                  type="submit"
                  style={confirmButtonStyle}
                  disabled={selectedEnroll.size === 0}
                  onClick={handleConfirmEnroll}
                >
                  {currentLanguage === "en" ? "Confirm" : "Xác nhận"}
                </button>
              </Form>
            </>
          )}
        </div>
      </main>
      <Footer language={currentLanguage} />
    </div>
  );
}
