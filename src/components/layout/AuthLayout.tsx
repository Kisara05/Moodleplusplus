import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-teal-600 text-white px-6 py-3 flex justify-between">
        <span className="font-bold">Moodle++</span>
        <select className="bg-teal-600 text-white">
          <option>English</option>
        </select>
      </header>

      {/* Page */}
      <main className="flex-1 flex items-center justify-center">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-teal-700 text-white text-sm p-4 text-center">
        © Moodle++ – Contact us: admin@moodle.com
      </footer>
    </div>
  );
}
