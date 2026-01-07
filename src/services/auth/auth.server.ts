// import { supabase } from "./supabase.server";
// File này sẽ chứa logic backend cho việc:
// 1. Đăng nhập (login)
// 2. Đăng ký (signup)
// 3. Đăng xuất (logout)
// 4. Quản lý session / cookie
// 5. Yêu cầu đăng nhập (requireUser)
// 6. Yêu cầu admin (requireAdmin)

import { supabaseServer } from "../database/supabase.server";
import bcrypt from "bcryptjs";
import type { AuthResult, AuthUser } from "~/types/models/user";

export type RegisterData = {
  email: string;
  password: string;
  fullName: string;
  role?: "student" | "teacher";
};

export type LoginData = {
  email: string;
  password: string;
};

// Register new user - with explicit return type
export async function register(data: RegisterData): Promise<AuthResult> {
  const { email, password, fullName, role = "student" } = data;

  try {
    // Check if user exists
    const { data: existingUser } = await supabaseServer
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return { error: "Email already exists" };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabaseServer.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      return { error: authError?.message || "Failed to create user" };
    }

    // Create user profile in database
    const { data: user, error: dbError } = await supabaseServer
      .from("users")
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role,
        password_hash: passwordHash,
      })
      .select("id, email, full_name, role, avatar_url, created_at")
      .single();

    if (dbError || !user) {
      // Rollback auth user if database insert fails
      await supabaseServer.auth.admin.deleteUser(authData.user.id);
      return { error: dbError?.message || "Failed to create user profile" };
    }

    return { user: user as AuthUser };
  } catch (error) {
    console.error("Register error:", error);
    return { error: "An unexpected error occurred during registration" };
  }
}

// Login user - with explicit return type
export async function login(data: LoginData): Promise<AuthResult> {
  const { email, password } = data;

  try {
    // Get user from database
    const { data: user, error: userError } = await supabaseServer
      .from("users")
      .select(
        "id, email, full_name, role, avatar_url, password_hash, created_at"
      )
      .eq("email", email)
      .single();

    if (userError || !user) {
      return { error: "Invalid email or password" };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return { error: "Invalid email or password" };
    }

    // Sign in with Supabase Auth
    const { error: signInError } = await supabaseServer.auth.signInWithPassword(
      {
        email,
        password,
      }
    );

    if (signInError) {
      return { error: signInError.message };
    }

    // Return user without password_hash
    const { password_hash, ...authUser } = user;
    return { user: authUser as AuthUser };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "An unexpected error occurred during login" };
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
