type RouteConfig = {
  path: string;
  file: string;
  children?: RouteConfig[]; // Add support for children
  options?: {
    index?: boolean;
  };
};

export default [
  { 
    path: "/", 
    file: "src/routes/_public.tsx",
    // Move children INSIDE this object
    children: [
      {
        path: "", // or use options: { index: true } depending on your parser
        file: "src/routes/_public._index.tsx",
        options: { index: true },
      },
      { path: "courses", file: "src/routes/_public.courses.tsx" },
      { 
        path: "courses/:courseID", 
        file: "src/routes/_public.course/$courseID.tsx" 
      },
      { 
        path: "courses/:courseID/create_post", 
        file: "src/routes/_public.course/create_post.tsx" 
      },
      { path: "post", file: "src/routes/_public.post.tsx" },
      { 
        path: "post/:postID", 
        file: "src/routes/_public.post/$postID.tsx"
      },
      { 
        path: "post/:postID/edit", 
        file: "src/routes/_public.post/edit.tsx"
      },
      {
        path: "admin",
        file: "src/routes/_public.admin.tsx",
        children: [
          {
            path: "",
            file: "src/routes/_public.admin/_index.tsx",
            options: { index: true }
          }
        ]
      }
      // ... login, register
    ]
  },
  { path: "/login", file: "src/routes/_public.login.tsx" },
  { path: "/forgot_password", file: "src/routes/_public.forgot_password.tsx" },
  { path: "/courses", file: "src/routes/_public.courses.tsx" },
  {
    path: "/courses/:courseID",
    file: "src/routes/_public.courses.$courseID.tsx",
  },
  // Nhóm Admin (lồng 2 lớp)
  { path: "/admin", file: "src/routes/_public.admin/layout.tsx" },
  {
    path: "/admin",
    file: "src/routes/_public.admin.tsx",
    options: { index: true },
  },
] satisfies RouteConfig[];
