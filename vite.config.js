import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      appDirectory: "src",
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
      routes(defineRoutes) {
        return defineRoutes((route) => {
          // PUBLIC ROUTES - Layout wrapping
          route("/", "routes/_public/_layout.tsx", () => {
            route("", "routes/_public/index.tsx", { index: true });
            route("login", "routes/_public/login/login.tsx");
            route("logout", "routes/_public/login/logout.tsx");
            route("auth-email", "routes/_public/login/auth-email.tsx");
            route("forgot-password", "routes/_public/login/pass-forgot.tsx");
            route("reset-password", "routes/_public/login/pass-reset.tsx");
            route("reset-password/:token", "routes/_public/login/$token.tsx");
          });

          // AUTHENTICATED ROUTES
          route("/", "routes/_auth/_layout.tsx", () => {
            route("dashboard", "routes/_auth/dashboard.tsx");
            route("profile", "routes/_auth/profile.tsx");
            route("courses", "routes/_auth/courses/index.tsx");
            route(
              "courses/:courseID",
              "routes/_auth/courses/$courseID/index.tsx"
            );
          });

          // ADMIN ROUTES
          route("admin", "routes/_admin/_layout.tsx", () => {
            route("", "routes/_admin/index.tsx", { index: true });
            route("users/:userID", "routes/_admin/users/$userID.tsx");
            route("courses", "routes/_admin/courses/courses.tsx");
            route("courses/:courseID", "routes/_admin/courses/$courseID.tsx");
            route(
              "courses/:courseID/edit",
              "routes/_admin/courses/$courseID.edit.tsx"
            );
          });
        });
      },
    }),
    tsconfigPaths(),
  ],
});
