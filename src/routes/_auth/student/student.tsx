import { useAuth } from "~/hooks/useAuth";
import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { requireUserId } from "~/services/auth/session.server";
import { getUserById } from "~/services/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);

  if (!user || user.role !== "student") {
    throw redirect("/dashboard");
  }

  return { user };
}

export default function StudentPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Welcome, {user.full_name}!</p>
        <p className="mt-2 text-gray-600">This is your student dashboard.</p>
      </div>
    </div>
  );
}
