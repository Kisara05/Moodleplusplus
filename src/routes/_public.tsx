import { Outlet } from "@remix-run/react";
import * as React from "react";

// Đây là layout "cha" cho TẤT CẢ các trang public
export default function PublicLayout() {
  return (
    <div>
      <header style={{ padding: "1rem", backgroundColor: "#f0f0f0" }}>
        <h1>Moodle++ (Public Header)</h1>
        {/* Có thể thêm <nav> ở đây */}
      </header>

      <main style={{ padding: "1rem" }}>
        {/* Các route con (index, login, courses) sẽ render ở đây */}
        <Outlet />
      </main>

      <footer style={{ padding: "1rem", backgroundColor: "#f0f0f0" }}>
        <p>© 2025 Moodle++ Team</p>
      </footer>
    </div>
  );
}
