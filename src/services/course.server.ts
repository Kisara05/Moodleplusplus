import { supabase } from "./supabase.server";
import { requireUserId } from "./auth.server";
import { json } from "@remix-run/node";

// // File này sẽ chứa logic backend (CRUD) cho Khóa học

export async function loader({ request, params }: LoaderArgs) {
    // Backend logic để load dữ liệu Course cho trang Course Detail
    // Step 0: Get Params & User ID
    if (!params.id || isNaN(Number(params.id))) {
        throw new Response("Invalid or missing course ID", { status: 400 });
    }
    const sectionId = Number(params.id);
    const userId = await requireUserId(request);
    type Row = { section_id: number };

    // Step 1: Fetch Enrollment Data
    // tạm thời data chỉ mới trả về section_id, về sau sẽ bổ sung thêm các trường thông tin khác để load trong Course
    const [r1, r2] = await Promise.all([
        supabase.from<Row>("gradereport").select("section_id").eq("student_id", userId).eq("section_id", sectionId"),
        supabase.from<Row>("teaching").select("section_id").eq("instructor_id", userId).eq("section_id", sectionId"),
    ]);

    if (r1.error) throw r1.error;
    if (r2.error) throw r2.error;

    const studentRecord = r1.data?.[0];
    const instructorRecord = r2.data?.[0];

    // Step 2: Check Enrollment & Role
    if (!studentRecord && !instructorRecord) {
        throw new Response("You are not enrolled in this course", { status: 403 }); // If they aren't enrolled, kick them out
    }

    const enrollment = {
        role: studentRecord ? "student" : "editingteacher",
        courseData: studentRecord ?? instructorRecord,
    };

    // Step 4: Return data to the Frontend
    return json({
        course: enrollment.courseData,
        user: {
            id: userId,
            isTeacher: enrollment.role === "editingteacher" // Pass this so frontend can show "Edit" buttons
        }
    });
}

export async function getCourseContent(sectionId: number) {
    // Backend logic để lấy nội dung course (modules, lessons, v.v.)
    console.log("Course Service: Getting content for section");
    // Giả sử trả về sample data 
    return {
        modules: [
            { id: "module1", title: "Module 1", lessons: [
                { id: "lesson1", title: "Lesson 1" },
                { id: "lesson2", title: "Lesson 2" },  
            ]},
            { id: "module2", title: "Module 2", lessons: [
                { id: "lesson3", title: "Lesson 3" },
                { id: "lesson4", title: "Lesson 4" },
            ]},
        ]
    };
}

export async function getStudentGrades(sectionId: number, userId: string) {
  // Backend logic để lấy điểm số của sinh viên trong một course cụ thể
  console.log("Course Service: Getting grades for section and user");
  // 1. Construct the Query
  const { data, error } = await supabase
    .from('gradereport')  // Select the table
    .select('grade_100, grade_ABC').eq('section_id', sectionId) // WHERE section_id = ...
    .eq('student_id', userId);    // AND user_id = ...
  //const { data, error } = await supabase
    //.from('grades')  // Select the table grades, should be implemented in Supabase in the future.
    //.select(`
      //id,
      //activity_name,
      //score,
      //max_score,
      //feedback,
      //percentage
    //`) // Select specific columns (don't over-fetch!)
    //.eq('section_id', sectionId) // WHERE section_id = ...
    //.eq('user_id', userId);    // AND user_id = ...

  // 2. Handle Database Errors
if (error) {
    if (process.env.NODE_ENV === "production") {
        // Replace with your error tracking service, e.g., Sentry.captureException(error)
        // Sentry.captureException(error);
    } else {
        console.error("Supabase Error:", error);
    }
    throw new Error("Database query failed");
}

  // 3. Return the clean array
  return data;
}

export async function getCourseGrades(sectionId: number) {
  // Backend logic để lấy điểm số của tất cả sinh viên trong một course cụ thể
  console.log("Course Service: Getting all grades for section");
    // 1. Construct the Query
    const { data, error } = await supabase
        .from('gradereport')  // Select the table
        .select('student_id, grade_100, grade_ABC') // WHERE section_id = ...
        .eq('section_id', sectionId); // WHERE section_id = ...
    // 2. Handle Database Errors
    if (error) {
        console.error("Supabase Error:", error);
        throw new Error("Database query failed");
    }
    // 3. Return the clean array
    return data;
}

export async function action({ request, params }: ActionArgs){
    // Backend logic để xử lý các form action từ trang Course Detail
    const sectionId = Number(params.id);
    const userId = await requireUserId(request);
    // ... xử lý các action như cập nhật thông tin course, thêm/sửa/xóa nội dung, v.v.
    console.log("Course Service: Action on course by user");
    return null;
}

export async function getCourseList(userId: string) {
    type CourseRow = {
        section_id: number;
        course_name: string;
        semester: string;
        school_year: string;
    };

    const { data, error } = await supabase.rpc<CourseRow>("get_user_courses", {
        p_user_id: userId,
    });

    if (error) {
            if (process.env.NODE_ENV === "production") {
                // Replace with your error tracking service, e.g., Sentry.captureException(error)
                // Sentry.captureException(error);
            } else {
                console.error("Supabase Error:", error);
            }
            throw new Error("Failed to fetch course list");
        }

    // If no data is returned or an error occurs, return an empty array to prevent frontend crashes or rendering issues.
    return data ?? [];
}

// export async function getCourseById(courseId: string) {
//   // const { data, error } = await supabase
//   //   .from("courses")
//   //   .select("*")
//   //   .eq("id", courseId)
//   //   .single();
//   // if (error) throw error;
//   // return data;
//   console.log("Course Service: Getting course by ID", courseId);
//   return {
//     id: courseId,
//     title: "Software Engineering",
//     description: "Mô tả chi tiết...",
//   };
// }
