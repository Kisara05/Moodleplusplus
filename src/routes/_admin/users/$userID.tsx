import { useParams } from "@remix-run/react";

export default function AdminUserDetailPage() {
  const { userID } = useParams();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Details</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Details for user: {userID}</p>
      </div>
    </div>
  );
}
