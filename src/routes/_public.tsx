import { Outlet } from "@remix-run/react";
import * as React from "react";

// Đây là layout "cha" cho TẤT CẢ các trang public
// Các trang con tự quản lý Header và Footer của riêng mình
export default function PublicLayout() {
  return <Outlet />;
}
