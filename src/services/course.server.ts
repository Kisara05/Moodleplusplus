import { get } from "http";
import { supabase } from "./supabase.server";
import { getRoleandID } from "./user/user.server";

// File này sẽ chứa logic backend (CRUD) cho Khóa học

export async function getSectionList(user_id: string) {
  const { role, id } = await getRoleandID(user_id);
  if (role === 'student') {
    const list = await student_getSectionList(id);
    return getCoursesById(list.map((item: any) => item.section_id));
  }
  if (role === 'teacher') {
    const list = await instructor_getSectionList(id);
    return getCoursesById(list.map((item: any) => item.section_id));
  }
  if (role === 'admin') 
  {
    const { data, error } = await supabase
      .from('section')        // 1. FROM section
      .select(`
        section_id
        )
      `);
    if (error) throw error;
    return getCoursesById(data.map((item: any) => item.section_id));
  }
  return [];
  // console.log("Course Service: Getting course list");
  // return [
  //   { id: "1", title: "Lập trình Web 101" },
  //   { id: "2", title: "Cơ sở dữ liệu 102" },
  // ];
}

export async function student_getSectionList(studentId: string) {
  console.log("Course Service: Getting section list for student", studentId);
  const { data, error } = await supabase
    .from('gradereport')        // 1. FROM student_section
    .select('section_id')
    .eq('student_id', studentId);
  if (error) throw error;
  return data;
}

export async function instructor_getSectionList(instructorID: string) {
  console.log("Course Service: Getting section list for instructor", instructorID);
  const { data, error } = await supabase
    .from('teaching')        // 1. FROM section
    .select('section_id')
    .eq('instructor_id', instructorID);
  if (error) throw error;
  return data;
}

export async function getCoursesById(sectionIds: string[]) {
  console.log("Course Service: Getting courses by IDs", sectionIds);
  const { data, error } = await supabase
    .from('section')              // 1. Start from Section
    .select(`
      section_id,
      course (
        course_name,
        course_id
      )
    `)
  .in('section_id', sectionIds); // 4. Filter IDs
  console.log(data);
  if (error) throw error;

  
  return data;
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
