import { useState } from "react";
// import { Sidebar } from "../components/admin";
// import type { Route } from "./+types/_public.admin";
import { Outlet } from "@remix-run/react";
import { Route } from "~/types";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Admin Panel - Moodle++" },
    {
      name: "description",
      content: "Admin interface for managing Moodle++ platform",
    },
  ];
}

export default function AdminDashboard() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="admin-dashboard">
        {/* <h1>ADMIN LAYOUT IS WORKING</h1> */}
        <Outlet />
    </div>

  );
}
