import { Outlet } from "@remix-run/react";
import * as React from "react";

// Đây là layout "cha" cho TẤT CẢ các trang public
// Header và Footer được render trong từng route con để có thể truyền props
export default function PublicLayout() {
  return (
    <div>
      {/* Các route con (index, login, courses) sẽ render ở đây với Header và Footer riêng */}
      <Outlet />
    </div>
  );
}
