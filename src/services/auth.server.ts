// import { supabase } from "./supabase.server";
// File này sẽ chứa logic backend cho việc:
// 1. Đăng nhập (login)
// 2. Đăng ký (signup)
// 3. Đăng xuất (logout)
// 4. Quản lý session / cookie
// 5. Yêu cầu đăng nhập (requireUser)
// 6. Yêu cầu admin (requireAdmin)

export async function login({ email, password }: any) {
  // ... logic gọi Supabase auth
  console.log("Auth Service: Logging in", email);
  // const { data, error } = await supabase.auth.signInWithPassword({
  //   email,
  //   password,
  // });
  // ...
  return { id: "123", email: email }; // Trả về sample user
}

export async function requireUserId(request: Request) {
  // ... logic kiểm tra cookie và trả về userId
  console.log("Auth Service: Requiring User ID");
  return 123; // Trả về sample userId
}

export async function requireAdmin(request: Request) {
  // ... logic kiểm tra cookie và vai trò user
  console.log("Auth Service: Checking for Admin");
  return true; // Giả sử là admin
}

export async function logout(request: Request) {
  // ... logic đăng xuất, xóa cookie
  console.log("Auth Service: Logging out");
  return;
}