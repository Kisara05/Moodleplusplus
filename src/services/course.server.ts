import { supabase } from "./supabase.server";

// File này sẽ chứa logic backend (CRUD) cho Khóa học

export async function getCourseList() {
  // const { data, error } = await supabase.from("courses").select("id, title");
  // if (error) throw error;
  // return data;
  console.log("Course Service: Getting course list");
  return [
    { id: "1", title: "Lập trình Web 101" },
    { id: "2", title: "Cơ sở dữ liệu 102" },
  ];
}

export async function getCourseById(courseId: string) {
  console.log("Course Service: Getting course by ID", courseId);
  const { data, error } = await supabase
    .from("course")
    .select("*")
    .eq("course_id", courseId)
    .single();
  console.log(data);
  if (error) throw error;
  return data;
  
  return {
    id: courseId,
    title: "Software Engineering",
    description: "Mô tả chi tiết...",
  };
}
