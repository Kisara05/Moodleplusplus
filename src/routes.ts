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
  // Admin route...
] satisfies RouteConfig[];