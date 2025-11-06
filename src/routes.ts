const r = (file: string) => () => import(file);

type RouteConfig = {
  path: string;
  file: string;
  options?: {
    index?: boolean;
  };
};

export default [
  // Layout cha _public sẽ bọc tất cả các route con
  { path: "/", file: "src/routes/_public.tsx" },
  // Các route con, sẽ render vào <Outlet> của _public.tsx
  {
    path: "/",
    file: "src/routes/_public._index.tsx",
    options: { index: true },
  },
  { path: "/login", file: "src/routes/_public.login.tsx" },
  { path: "/courses", file: "src/routes/_public.courses.tsx" },
  {
    path: "/courses/:courseID",
    file: "src/routes/_public.courses.$courseID.tsx",
  },
  // Nhóm Admin (lồng 2 lớp)
  { path: "/admin", file: "src/routes/_public.admin.layout.tsx" },
  {
    path: "/admin",
    file: "src/routes/_public.admin.tsx",
    options: { index: true },
  },
] satisfies RouteConfig[];
