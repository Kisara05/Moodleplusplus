import { supabase } from "./supabase.server";

// File này sẽ chứa logic backend (CRUD) cho Khóa học

export async function getSectionList() {
  const { data, error } = await supabase
    .from('section')        // 1. FROM section
    .select(`
      section_id,
      course_id,
      course (
        course_name
      )
    `);
  if (error) throw error;
  return data;
  // console.log("Course Service: Getting course list");
  // return [
  //   { id: "1", title: "Lập trình Web 101" },
  //   { id: "2", title: "Cơ sở dữ liệu 102" },
  // ];
}

export async function getCourseById(courseId: string) {
  console.log("Course Service: Getting course by ID", courseId);
  const { data, error } = await supabase
    .from("course")
    .select("*")
    .eq("course_id", courseId)
    .single();
  // console.log(data);
  if (error) throw error;
  return data;
  
  return {
    id: courseId,
    title: "Software Engineering",
    description: "Mô tả chi tiết...",
  };
}

export async function getSectionById(sectionId: string) {
  console.log("Course Service: Getting section by ID", sectionId);
  const { data, error } = await supabase
    .from('section')      // The table name
    .select('*')          // Select all columns
    .eq('section_id', sectionId)  // Where section_id equals 1
    .single();            // Optional: Use this if you expect exactly one result (returns object instead of array)
  // console.log(data);
  if (error) throw error;
  return data;
  
  // return {
  //   id: courseId,
  //   title: "Software Engineering",
  //   description: "Mô tả chi tiết...",
  // };
}
