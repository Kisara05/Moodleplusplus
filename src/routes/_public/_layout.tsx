import { Outlet, redirect, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getUserById } from "~/services/auth/auth.server";
import { getUserId } from "~/services/auth/session.server";

// Define loader return type
type LoaderData = {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: "student" | "teacher" | "admin";
    avatar_url: string | null;
    created_at: string;
  } | null;
};

export async function loader({ request }: LoaderFunctionArgs) {
  // Public layout should NOT require authentication - only provide user data if available
  // Individual routes (like course pages) will handle their own authentication requirements
  const userId = await getUserId(request);
  
  if (!userId) {
    return { user: null };
  }

  const user = await getUserById(userId);
  
  return { user: user || null };
}

export default function PublicLayout() {
  const { user } = useLoaderData<LoaderData>();

  return <Outlet />;
}
