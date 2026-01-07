import { Outlet, Link } from "@remix-run/react";

// Đây là layout "cha" cho TẤT CẢ các trang public
export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              LMS Platform
            </Link>

            <div className="flex items-center gap-4">
              <Link to="/courses" className="text-gray-700 hover:text-blue-600">
                Courses
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 text-blue-600 hover:text-blue-700"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center">
            © 2024 LMS Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
