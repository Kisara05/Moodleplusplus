import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import routeConfig from "./src/routes";

// Cài đặt các global như `fetch`, `Headers`, `Response` cho môi trường Node.js dùng cho Remix
installGlobals();

export default defineConfig({
  plugins: [
    // xử lý file-system routing, server-side...
    remix({
      appDirectory: "src",
      // Định nghĩa thủ công cho các route nếu cần
      routes(defineRoutes) {
        return defineRoutes((route) => {
           processRoutes(routeConfig, route);
        });
      }
    }),
    // Hỗ trợ alias theo cấu hình trong tsconfig.json
    tsconfigPaths(),
  ],
});

function processRoutes(routes, defineRoute) {
  routes.forEach((item) => {
    // Clean up the path: Remix expects paths relative to appDirectory ("src")
    // If your strings are "src/routes/...", we need to strip "src/"
    const relativeFile = item.file.startsWith("src/") 
      ? item.file.replace(/^src\//, "") 
      : item.file;

    if (item.children && item.children.length > 0) {
      // Recursion: Define the parent, then process children inside the callback
      defineRoute(item.path, relativeFile, () => {
        processRoutes(item.children, defineRoute);
      });
    } else {
      // Base case: Define a single route
      defineRoute(item.path, relativeFile, item.options);
    }
  });
}