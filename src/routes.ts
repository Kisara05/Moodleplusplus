/**
 * Routes Configuration - Moodleplusplus LMS
 */

import path from "path";

export const routesConfig = {
  // 1. PUBLIC: Không cần đăng nhập
  public: {
    layout: "routes/_public/_layout.tsx",
    routes: [
      { path: "", file: "routes/_public/index.tsx", index: true },
      { path: "login", file: "routes/_public/login/login.tsx" },
      // { path: "courses", file: "routes/_public/course/index.tsx" },
      // { path: "courses/:courseID", file: "routes/_public/course/$courseID.tsx" },
      // { path: "post/:postID", file: "routes/_public/post/$postID.tsx" },
      { path: "logout", file: "routes/_public/login/logout.tsx" },
      // {
      //   path: "threads/:threadID",
      //   file: "routes/_public/threads/$threadID.tsx",
      // }
    ],
  },

  // 2. AUTH: Yêu cầu học viên/giảng viên đăng nhập
  auth: {
    layout: "routes/_auth/_layout.tsx",
    routes: [
      { path: "dashboard", file: "routes/_auth/dashboard.tsx" },
      { path: "courses", file: "routes/_auth/courses/index.tsx" },
      {
        path: "courses/:courseID",
        file: "routes/_auth/courses/$courseID/index.tsx",
      },
      { path: "post/:postID", file: "routes/_auth/post/$postID.tsx" },
      {
        path: "teaching/:courseID",
        file: "routes/_auth/teaching/index.tsx",
      },
      {
        path: "threads/:threadID",
        file: "routes/_auth/threads/$threadID.tsx",
      },
      {
        path: "course-registration",
        file: "routes/_auth/course_registration/course_registration.tsx",
      },
    ],
  },

  // 3. ADMIN: Yêu cầu quyền Admin
  admin: {
    layout: "routes/_admin/_layout.tsx",
    prefix: "admin",
    routes: [
      { path: "", file: "routes/_admin/index.tsx", index: true },
      { path: "users", file: "routes/_admin/users/index.tsx" },
      { path: "users/:userID", file: "routes/_admin/users/$userID.tsx" },
      { path: "courses", file: "routes/_admin/courses/courses.tsx" },
      {
        path: "courses/:courseID",
        file: "routes/_admin/courses/$courseID.tsx",
      },
      {
        path: "courses/:courseID/edit",
        file: "routes/_admin/courses/$courseID.edit.tsx",
      },
      { path: "post/:postID", file: "routes/_admin/post/$postID.tsx" },
      { path: "post/:postID/edit", file: "routes/_admin/post/edit.tsx" },
      {
        path: "threads/:threadID",
        file: "routes/_admin/threads/$threadID.tsx",
      },
    ],
  },
};

export function defineAppRoutes(route: any) {
  // Nhóm Public (Path gốc /)
  route("/", routesConfig.public.layout, () => {
    routesConfig.public.routes.forEach((r) => {
      route(r.path, r.file, { index: r.index });
    });
  });

  // Nhóm Auth (Path gốc /)
  route("/", routesConfig.auth.layout, () => {
    routesConfig.auth.routes.forEach((r) => {
      route(r.path, r.file);
    });
  });

  // Nhóm Admin (Path bắt đầu bằng /admin)
  route(routesConfig.admin.prefix, routesConfig.admin.layout, () => {
    routesConfig.admin.routes.forEach((r) => {
      route(r.path, r.file, { index: r.index });
    });
  });
}
