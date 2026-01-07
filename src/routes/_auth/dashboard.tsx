import { useAuth } from "~/hooks/useAuth";

export default function DashboardPage() {
  const { user, isStudent, isTeacher, isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {user.full_name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isStudent && (
          <>
            <StatCard
              title="Enrolled Courses"
              value="5"
              description="Active courses"
              color="blue"
            />
            <StatCard
              title="Completed"
              value="12"
              description="Courses finished"
              color="green"
            />
            <StatCard
              title="Certificates"
              value="8"
              description="Earned certificates"
              color="purple"
            />
          </>
        )}

        {isTeacher && (
          <>
            <StatCard
              title="My Courses"
              value="8"
              description="Published courses"
              color="blue"
            />
            <StatCard
              title="Students"
              value="156"
              description="Total enrolled"
              color="green"
            />
            <StatCard
              title="Reviews"
              value="4.8"
              description="Average rating"
              color="yellow"
            />
          </>
        )}

        {isAdmin && (
          <>
            <StatCard
              title="Total Users"
              value="1,234"
              description="Registered users"
              color="blue"
            />
            <StatCard
              title="Courses"
              value="89"
              description="Published courses"
              color="green"
            />
            <StatCard
              title="Revenue"
              value="$45,678"
              description="This month"
              color="purple"
            />
          </>
        )}
      </div>

      {/* User Info Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
        <div className="space-y-2">
          <InfoRow label="Name" value={user.full_name} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Role" value={user.role} />
          <InfoRow
            label="Member since"
            value={new Date(user.created_at).toLocaleDateString()}
          />
        </div>
      </div>
    </div>
  );
}

// Helper Components
type StatCardProps = {
  title: string;
  value: string;
  description: string;
  color: "blue" | "green" | "purple" | "yellow";
};

function StatCard({ title, value, description, color }: StatCardProps) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-75">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className="text-sm mt-1 opacity-75">{description}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
