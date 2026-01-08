import { supabase } from "../supabase.server";

// File này sẽ chứa logic backend (CRUD) cho User (Profile, etc.)
export async function getUserProfile(userId: string) {
  console.log("User Service: Getting profile", userId);
  return { id: userId, name: "A student" };
}

export async function getRoleandID(userId: string) {
  console.log("User Service: Getting role and ID for", userId);
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();
  if (error) throw error;
  const role = data.role;
  if (role === 'student') {
    const { data: roleData, error: roleError } = await supabase
      .from('student')
      .select('student_id')
      .eq('userID', userId)
      .single();
    if (roleError) throw roleError;
    return { role, id: roleData.student_id};
  }
  if (role === 'teacher') {
    const { data: roleData, error: roleError } = await supabase
      .from('instructor')
      .select('instructor_id')
      .eq('userID', userId)
      .single();
    if (roleError) throw roleError;
    return { role, id: roleData.instructor_id };
  }
  return { role, id: null };
}
