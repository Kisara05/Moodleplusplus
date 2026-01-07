// import { supabase } from "./supabase.server";
// File này sẽ chứa logic backend cho việc:
// 1. Đăng nhập (login)
// 2. Đăng ký (signup)
// 3. Đăng xuất (logout)
// 4. Quản lý session / cookie
// 5. Yêu cầu đăng nhập (requireUser)
// 6. Yêu cầu admin (requireAdmin)

import { supabaseServer } from "../database/supabase.server";
// import bcrypt from "bcryptjs";
import type { AuthResult, AuthUser } from "~/types/models/user";

export type LoginData = {
  email: string;
  password: string;
};

// Login user - with explicit return type
// auth.server.ts

export async function login(data: LoginData): Promise<AuthResult> {
  const { email, password } = data;

  try {
    // 1. Đăng nhập bằng Supabase Auth (Đây là nơi check mật khẩu chuẩn nhất)
    const { data: authData, error: signInError } =
      await supabaseServer.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError || !authData.user) {
      return { error: "Email hoặc mật khẩu không chính xác" };
    }

    // 2. Lấy thêm thông tin User (role, full_name) từ bảng public.users của bạn
    const { data: userProfile, error: profileError } = await supabaseServer
      .from("users")
      .select("id, email, full_name, role, avatar_url")
      .eq("id", authData.user.id) // Khớp ID từ Auth sang table Users
      .single();

    if (profileError || !userProfile) {
      // Nếu login thành công nhưng không có profile, có thể do bạn chưa tạo dòng tương ứng trong bảng users
      return {
        error: "Tài khoản chưa được thiết lập profile. Vui lòng liên hệ Admin.",
      };
    }

    return { user: userProfile as AuthUser };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Đã xảy ra lỗi ngoài ý muốn" };
  }
}

// Get user by ID - with explicit return type
export async function getUserById(userId: string): Promise<AuthUser | null> {
  try {
    const { data: user, error } = await supabaseServer
      .from("users")
      .select("id, email, full_name, role, avatar_url, created_at")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return null;
    }

    return user as AuthUser;
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  data: { full_name?: string; avatar_url?: string }
): Promise<AuthResult> {
  try {
    const { data: user, error } = await supabaseServer
      .from("users")
      .update(data)
      .eq("id", userId)
      .select("id, email, full_name, role, avatar_url, created_at")
      .single();

    if (error || !user) {
      return { error: error?.message || "Failed to update profile" };
    }

    return { user: user as AuthUser };
  } catch (error) {
    console.error("Update profile error:", error);
    return { error: "An unexpected error occurred during update" };
  }
}
