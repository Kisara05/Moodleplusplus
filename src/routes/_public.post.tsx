import { Outlet } from "@remix-run/react";

export default function PostLayout() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* This Outlet is where the specific $postID.tsx content 
        will be rendered 
      */}
      <main className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-200 rounded-lg min-h-[500px]">
        <p>Hello.</p>
        <Outlet />
      </main>
    </div>
  );
}