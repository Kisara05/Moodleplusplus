import { Outlet, Link, redirect, useLoaderData, Form } from "@remix-run/react";
import type { LoaderFunctionArgs } from "react-router";
import { getUserById } from "~/services/auth/auth.server";
import { requireUserId } from "~/services/auth/session.server";
import type { AuthUser } from "~/types/models/user";

type LoaderData = {
  user: AuthUser;
};

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<LoaderData> {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);

  if (!user) {
    throw redirect("/login");
  }

  // Check if user is admin
  if (user.role !== "admin") {
    throw new Response("Unauthorized - Admin access required", { status: 403 });
  }

  return { user };
}

export default function AdminLayout() {
  const { user } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to="/admin" className="text-xl font-bold">
              Admin Panel
            </Link>
            <nav className="flex gap-4">
              <Link to="/admin/users" className="hover:text-blue-400">
                Users
              </Link>
              <Link to="/admin/courses" className="hover:text-blue-400">
                Courses
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm">{user.full_name}</span>
            <Form method="post" action="/logout">
              <button
                type="submit"
                className="text-sm text-red-400 hover:text-red-300"
              >
                Logout
              </button>
            </Form>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
