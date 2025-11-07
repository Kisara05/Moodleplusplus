# Project Structure

```bash
Moodleplusplus/
├── src/                        # Source code
│
│ ├── components/               # (Frontend) Chứa các UI components tái sử dụng
│ │ ├── common/                 # VD: Button.tsx, Input.tsx, Modal.tsx
│ │ └── layout/                 # VD: Header.tsx, Footer.tsx, Sidebar.tsx
│ │
│ ├── routes/                   # (Frontend + Backend) Nơi chứa các "trang" (pages)
│ │ │                           # Mỗi file .tsx ở đây là một URL
│ │ │
│ │ │  VD:
│ │ │  import { type RouteConfig, index, route } from "@react-router/dev/routes";
│ │ │  export default [
│ │ │    index("routes/_public._index.tsx"),                // mặc định
│ │ │    route("admin", "routes/_public.admin.tsx"),        // mặc định
│ │ │    route("admin/products", "routes/_public.admin.products.tsx"),
│ │ │    route("admin/products/:productId", "routes/_public.admin.editProduct.tsx"),
│ │ │    route("admin/posts", "routes/_public.admin.posts.tsx"),
│ │ │  ] satisfies RouteConfig;
│ │ │
│ │ ├── _index.tsx              # Trang chủ (route "/")
│ │ └── admin/                  # Nhóm route cho /admin
│ │     ├── _layout.tsx         # Layout CHUNG cho tất cả các trang /admin/*
│ │
│ ├── services/                 # (Backend) Nơi chứa logic xử lý server-side
│ │ ├── supabase.server.ts      # Cài đặt kết nối Supabase
│ │ ├── auth.server.ts          # Logic đăng nhập, đăng ký, session...
│ │ └── user.server.ts          # Logic quản lý CSDL cho user
│ │
│ ├── styles/                   # (Frontend) Chứa file CSS chung
│ │ └── app.css                 # File CSS toàn cục (nếu không dùng Tailwind)
│ │
│ └── root.tsx                  # File layout GỐC của toàn bộ ứng dụng
│
├── public/                     # (Frontend) File tĩnh (images, fonts, favicon.ico)
│ └── favicon.ico
│
├── .env # (Bảo mật) Chứa API keys - KHÔNG commit lên Git
├── .env.example # (An toàn) File mẫu cho .env - Commit lên Git
├── .gitignore # Rất quan trọng: Bỏ qua .env, node_modules...
├── package.json # Quản lý các gói (dependencies) và scripts
├── README.md # Hướng dẫn cho nhóm: cách cài đặt, khởi chạy...
├── tsconfig.json # Cấu hình TypeScript
└── vite.config.ts # Cấu hình Vite
```
