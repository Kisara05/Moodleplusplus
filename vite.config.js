import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Cài đặt các global như `fetch`, `Headers`, `Response` cho môi trường Node.js dùng cho Remix
installGlobals();

export default defineConfig({
  plugins: [
    // xử lý file-system routing, server-side...
    remix({
      appDirectory: "src",
      // Định nghĩa thủ công cho các route nếu cần
      // routes(defineRoutes) {
      //   return defineRoutes((route) => {
      //      // ... custom routes here
      //   });
      // }
    }),
    // Hỗ trợ alias theo cấu hình trong tsconfig.json
    tsconfigPaths(),
  ],
});
