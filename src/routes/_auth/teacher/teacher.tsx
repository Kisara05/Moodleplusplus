import { useAuth } from "~/hooks/useAuth";
import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { requireUserId } from "~/services/auth/session.server";
import { getUserById } from "~/services/auth/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);

  if (!user || user.role !== "teacher") {
    throw redirect("/dashboard");
  }

  return { user };
}

export default function TeacherPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Welcome, {user.full_name}!</p>
        <p className="mt-2 text-gray-600">This is your teacher dashboard.</p>
      </div>
    </div>
  );
}
