import type { MetaFunction } from "~/types/index";

export const meta: MetaFunction = () => {
  return [
    { title: "Admin Panel - Moodle++" },
    {
      name: "description",
      content: "Admin interface for managing Moodle++ platform",
    },
  ];
};

export default function AdminDashboard() {
  //   const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="admin-dashboard">
      <div>
        {/* Sidebar component for admin navigation */}
        {/* <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} /> */}
      </div>
    </div>
  );
}
