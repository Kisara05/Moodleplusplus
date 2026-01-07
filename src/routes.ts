/**
 * Routes Configuration for Moodleplusplus LMS
 *
 * Structure:
 * - public: Accessible without login (landing, login, register)
 * - auth: Requires authentication (dashboard, courses, profile)
 * - admin: Requires admin role (user management, course management)
 *
 * @see vite.config.ts for integration
 */

export const routesConfig = {
  /**
   * PUBLIC ROUTES
   * No authentication required
   */
  public: {
    layout: "routes/_public/_layout.tsx",
    routes: {
      // Landing page
      home: {
        path: "",
        file: "routes/_public/index.tsx",
        index: true,
        description: "Homepage with course catalog",
      },

      // Authentication
      login: {
        path: "login",
        file: "routes/_public/login/login.tsx",
        description: "Login page",
      },
      logout: {
        path: "logout",
        file: "routes/_public/login/logout.tsx",
        description: "Logout handler",
      },

      // Password reset flow
      forgotPassword: {
        path: "forgot-password",
        file: "routes/_public/login/pass-forgot.tsx",
        description: "Request password reset",
      },
      resetPassword: {
        path: "reset-password",
        file: "routes/_public/login/pass-reset.tsx",
        description: "Reset password form",
      },
      resetPasswordToken: {
        path: "reset-password/:token",
        file: "routes/_public/login/$token.tsx",
        description: "Reset password with token",
      },

      // Email verification
      authEmail: {
        path: "auth-email",
        file: "routes/_public/login/auth-email.tsx",
        description: "Email verification handler",
      },
    },
  },

  /**
   * AUTHENTICATED ROUTES
   * Requires user to be logged in
   * Available for both students and teachers
   */
  auth: {
    layout: "routes/_auth/_layout.tsx",
    routes: {
      dashboard: {
        path: "dashboard",
        file: "routes/_auth/dashboard.tsx",
        description: "User dashboard (role-based content)",
      },
      profile: {
        path: "profile",
        file: "routes/_auth/profile.tsx",
        description: "User profile and settings",
      },

      // Course routes
      courses: {
        path: "courses",
        file: "routes/_auth/courses/index.tsx",
        description: "My enrolled courses list",
      },
      courseDetail: {
        path: "courses/:courseID",
        file: "routes/_auth/courses/$courseID/index.tsx",
        description: "Course detail page with materials",
      },
    },
  },

  /**
   * ADMIN ROUTES
   * Requires admin role
   * Full system management
   */
  admin: {
    layout: "routes/_admin/_layout.tsx",
    prefix: "admin",
    routes: {
      home: {
        path: "",
        file: "routes/_admin/index.tsx",
        index: true,
        description: "Admin dashboard",
      },

      // User management
      userDetail: {
        path: "users/:userID",
        file: "routes/_admin/users/$userID.tsx",
        description: "View/edit user details",
      },

      // Course management
      courses: {
        path: "courses",
        file: "routes/_admin/courses/courses.tsx",
        description: "All courses list",
      },
      courseDetail: {
        path: "courses/:courseID",
        file: "routes/_admin/courses/$courseID.tsx",
        description: "Course details",
      },
      courseEdit: {
        path: "courses/:courseID/edit",
        file: "routes/_admin/courses/$courseID.edit.tsx",
        description: "Edit course",
      },
    },
  },
} as const;

// Convert to Remix routes format
export function defineAppRoutes(
  route: (
    path: string,
    file: string,
    options?: { index?: boolean },
    children?: () => void
  ) => void
): void {
  // Public routes
  route("/", routesConfig.public.layout, {}, () => {
    Object.values(routesConfig.public.routes).forEach((r) => {
      route(r.path, r.file, "index" in r && r.index ? { index: true } : {});
    });
  });

  // Auth routes
  route("/", routesConfig.auth.layout, {}, () => {
    Object.values(routesConfig.auth.routes).forEach((r) => {
      route(r.path, r.file);
    });
  });

  // Admin routes
  route(routesConfig.admin.prefix, routesConfig.admin.layout, {}, () => {
    Object.values(routesConfig.admin.routes).forEach((r) => {
      route(r.path, r.file, "index" in r && r.index ? { index: true } : {});
    });
  });
}

// Export route paths for use in components
// export const ROUTES = {
//   PUBLIC: {
//     HOME: "/",
//     LOGIN: "/login",
//     LOGOUT: "/logout",
//     FORGOT_PASSWORD: "/forgot-password",
//     RESET_PASSWORD: "/reset-password",
//   },
//   AUTH: {
//     DASHBOARD: "/dashboard",
//     PROFILE: "/profile",
//     COURSES: "/courses",
//     COURSE_DETAIL: (id: string) => `/courses/${id}`,
//   },
//   ADMIN: {
//     HOME: "/admin",
//     USERS: "/admin/users",
//     USER_DETAIL: (id: string) => `/admin/users/${id}`,
//     COURSES: "/admin/courses",
//     COURSE_DETAIL: (id: string) => `/admin/courses/${id}`,
//     COURSE_EDIT: (id: string) => `/admin/courses/${id}/edit`,
//   },
// } as const;
