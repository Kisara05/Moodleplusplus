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

// Get registered courses for a student
export async function getRegisteredCourses(userId: string) {
  console.log("Course Service: Getting registered courses for user", userId);
  try {
    const { data, error } = await supabase
      .from('enrollment')
      .select(`
        enrollment_id,
        section_id,
        section (
          section_id,
          class_name,
          schedule,
          max_students,
          current_students,
          course (
            course_id,
            course_name,
            credits
          )
        )
      `)
      .eq('student_id', userId)
      .eq('status', 'registered');
    
    if (error) {
      console.error("Error fetching registered courses:", error);
      // Return empty array if table doesn't exist or query fails
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Exception in getRegisteredCourses:", err);
    return [];
  }
}

// Get available courses (sections that student hasn't enrolled in)
export async function getAvailableCourses(userId: string, filters?: { year?: string; semester?: string; program?: string }) {
  console.log("Course Service: Getting available courses", userId, filters);
  
  try {
    // First get enrolled section IDs
    const { data: enrolledData } = await supabase
      .from('enrollment')
      .select('section_id')
      .eq('student_id', userId)
      .eq('status', 'registered');
    
    const enrolledSectionIds = enrolledData?.map(e => e.section_id) || [];
    
    // Get all sections, excluding enrolled ones
    let query = supabase
      .from('section')
      .select(`
        section_id,
        class_name,
        schedule,
        max_students,
        current_students,
        course (
          course_id,
          course_name,
          credits,
          year,
          semester,
          program
        )
      `);
    
    // Exclude enrolled sections if any
    if (enrolledSectionIds.length > 0) {
      query = query.not('section_id', 'in', `(${enrolledSectionIds.join(',')})`);
    }
    
    // Apply filters if provided
    if (filters?.year) {
      query = query.eq('course.year', filters.year);
    }
    if (filters?.semester) {
      query = query.eq('course.semester', filters.semester);
    }
    if (filters?.program) {
      query = query.eq('course.program', filters.program);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching available courses:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Exception in getAvailableCourses:", err);
    return [];
  }
}

// Enroll in a course (section)
export async function enrollInCourse(userId: string, sectionId: string) {
  console.log("Course Service: Enrolling user", userId, "in section", sectionId);
  
  // Check if already enrolled
  const { data: existing } = await supabase
    .from('enrollment')
    .select('enrollment_id')
    .eq('student_id', userId)
    .eq('section_id', sectionId)
    .single();
  
  if (existing) {
    return { success: false, error: "Already enrolled in this course" };
  }
  
  // Check capacity
  const { data: section } = await supabase
    .from('section')
    .select('max_students, current_students')
    .eq('section_id', sectionId)
    .single();
  
  if (section && section.current_students >= section.max_students) {
    return { success: false, error: "Course is full" };
  }
  
  // Insert enrollment
  const { data, error } = await supabase
    .from('enrollment')
    .insert({
      student_id: userId,
      section_id: sectionId,
      status: 'registered',
      enrolled_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  // Update section current_students count
  await supabase
    .from('section')
    .update({ current_students: (section.current_students || 0) + 1 })
    .eq('section_id', sectionId);
  
  return { success: true, data };
}

// Cancel enrollment (multiple courses)
export async function cancelEnrollments(userId: string, sectionIds: string[]) {
  console.log("Course Service: Canceling enrollments for user", userId, "sections", sectionIds);
  
  if (!sectionIds || sectionIds.length === 0) {
    return { success: false, error: "No courses selected" };
  }
  
  // Delete enrollments
  const { error } = await supabase
    .from('enrollment')
    .delete()
    .eq('student_id', userId)
    .in('section_id', sectionIds);
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  // Update section current_students count for each section
  for (const sectionId of sectionIds) {
    const { data: section } = await supabase
      .from('section')
      .select('current_students')
      .eq('section_id', sectionId)
      .single();
    
    if (section) {
      await supabase
        .from('section')
        .update({ current_students: Math.max(0, (section.current_students || 0) - 1) })
        .eq('section_id', sectionId);
    }
  }
  
  return { success: true };
}

// Enroll in multiple courses
export async function enrollInCourses(userId: string, sectionIds: string[]) {
  console.log("Course Service: Enrolling user", userId, "in sections", sectionIds);
  
  if (!sectionIds || sectionIds.length === 0) {
    return { success: false, error: "No courses selected" };
  }
  
  const results = [];
  for (const sectionId of sectionIds) {
    const result = await enrollInCourse(userId, sectionId);
    results.push({ sectionId, ...result });
  }
  
  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    return { success: false, error: `Failed to enroll in ${failed.length} course(s)`, details: failed };
  }
  
  return { success: true, results };
}