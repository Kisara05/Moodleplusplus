import { useRouteLoaderData } from "@remix-run/react";
import type { AuthUser } from "../types/models/user";

type AuthLayoutData = {
  user: AuthUser;
};

export function useAuth() {
  const data = useRouteLoaderData<AuthLayoutData>("routes/_auth/_layout");

  if (!data) {
    throw new Error("useAuth must be used within an authenticated route");
  }

  return {
    user: data.user,
    isStudent: data.user.role === "student",
    isTeacher: data.user.role === "teacher",
    isAdmin: data.user.role === "admin",
  };
}
