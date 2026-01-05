// import { supabase } from "./supabase.server";
// File này sẽ chứa logic backend cho việc:
// 1. Đăng nhập (login)
// 2. Đăng ký (signup)
// 3. Đăng xuất (logout)
// 4. Quản lý session / cookie
// 5. Yêu cầu đăng nhập (requireUser)
// 6. Yêu cầu admin (requireAdmin)

export async function login({ userId, password }: { userId: string; password: string }) {
  // ... logic gọi Supabase auth hoặc database
  console.log("Auth Service: Logging in", userId);
  
  // TODO: Implement actual authentication logic
  // For now, this is a placeholder that accepts any userId/password
  // In production, this should:
  // 1. Query database/Supabase to verify userId and password
  // 2. Check user_flag (1 = student, 0 = teacher/admin)
  // 3. Return user information and user_flag
  
  // Placeholder validation - replace with actual database query
  if (!userId || !password) {
    return { success: false, error: "User ID and Password are required" };
  }

  // Sample response - replace with actual authentication
  // This should query your user table to check credentials
  // const { data, error } = await supabase
  //   .from('users')
  //   .select('id, user_id, user_flag')
  //   .eq('user_id', userId)
  //   .eq('password', hashedPassword) // Use proper password hashing
  
  // For now, return success for any non-empty credentials
  // In production, verify against database
  return {
    success: true,
    id: "123",
    userId: userId,
    user_flag: 1, // 1 = student, 0 = teacher/admin - should come from database
  };
}

export async function requireAdmin(request: Request) {
  // ... logic kiểm tra cookie và vai trò user
  console.log("Auth Service: Checking for Admin");
  return true; // Giả sử là admin
}
