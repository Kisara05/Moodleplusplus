import type { Database } from "./database";

export type UserRole = "student" | "teacher" | "admin";

// Type from database
export type User = Database["public"]["Tables"]["users"]["Row"];

// Type cho user khi register/login (không trả về password_hash và updated_at)
export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
};

// Response types cho auth operations
export type AuthResult<T = AuthUser> =
  | { user: T; error?: never }
  | { user?: never; error: string };

// Type cho update operations
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
