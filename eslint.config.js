import eslint from "@eslint/js";
import remixEslintConfig from "@remix-run/eslint-config";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...remixEslintConfig,
  {
    rules: {
      // Thêm các quy tắc tùy chỉnh code để dò lỗi khi code project
      // Ví dụ:
      // "no-console": "warn", // Cảnh báo nếu dùng console.log
    },
  }
);
