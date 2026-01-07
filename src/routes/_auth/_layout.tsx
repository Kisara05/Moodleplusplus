import { Form, Outlet, redirect, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { getUserById } from "../../services/auth/auth.server";
import { requireUserId } from "../../services/auth/session.server";

// Define loader return type
type LoaderData = {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: "student" | "teacher" | "admin";
    avatar_url: string | null;
    created_at: string;
  };
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);

  if (!user) {
    return redirect("/login");
  }

  return { user };
}

export default function AuthLayout() {
  const { user } = useLoaderData<LoaderData>();

  return (
    <div>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">LMS Platform</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.full_name}</span>
            <Form method="post" action="/logout">
              <button
                type="submit"
                className="text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </Form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
