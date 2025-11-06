// import { Outlet, Link } from "@remix-run/react";
// import * as React from "react";

// // Đây là layout "cha" cho RIÊNG khu vực Admin
// // Nó sẽ render BÊN TRONG <Outlet> của _public.tsx
// export default function AdminLayout() {
//   return (
//     <div style={{ display: "flex" }}>
//       <nav
//         style={{
//           width: "200px",
//           borderRight: "1px solid #ccc",
//           padding: "1rem",
//         }}
//       >
//         <h3>Admin Menu</h3>
//         <ul>
//           <li>
//             <Link to="/admin">Dashboard</Link>
//           </li>
//           <li>
//             <Link to="/admin/users">Quản lý Users</Link>{" "}
//             {/* (Route này chưa tạo) */}
//           </li>
//           <li>
//             <Link to="/admin/courses">Quản lý Courses</Link>{" "}
//             {/* (Route này chưa tạo) */}
//           </li>
//         </ul>
//       </nav>

//       <main style={{ padding: "1rem", flex: 1 }}>
//         {/* Route con của admin (vd: _public.admin.tsx) sẽ render ở đây */}
//         <Outlet />
//       </main>
//     </div>
//   );
// }
