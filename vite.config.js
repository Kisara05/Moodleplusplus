import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineAppRoutes } from "./src/routes";

export default defineConfig({
  plugins: [
    remix({
      appDirectory: "src",

      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },

      // ✅ Import routes từ file riêng
      routes(defineRoutes) {
        return defineRoutes(defineAppRoutes);
      },
    }),
    tsconfigPaths(),
  ],
});
