# Project Structure (Sample structure, may need adjustment for each task later)

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
│ │ ├── _public.tsx             # Layout chính của Server
│ │ ├── _public._index.tsx      # Trang chủ (route "/")
│ │ └── _public/admin           # Route kết nối chính đến Admin
| │ └── _public/course          # Route kết nối chính đến Course
| │ └── _public/user            # Route kết nối chính đến User
| │ └── _public/login, register # Route kết nối Authentication
| │ └── _public/.../...         # Folder cho từng mục quản lý
|
│ │
│ ├── services/                 # (Backend) Nơi chứa logic xử lý server-side
│ │ ├── supabase.server.ts      # Cài đặt kết nối Supabase
│ │ ├── auth.server.ts          # Logic đăng nhập, đăng ký, session...
│ │ └── user.server.ts          # Logic quản lý CSDL cho user
| │
| ├── types/                    # Định nghĩa các Interface dùng chung
│ │ ├── index.ts
│ │ ├── user.ts
│ │
│ │── styles/                   # Thiết kế CSS
| │ ├── app.css
│ │ ├── button.modules.css
| │
│ │── routes.ts                 # File chứa đường dẫn chung cho toàn bộ server
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
└── .pnp.cjs # Yarn
└── .pnp.loader.mjs
└── yarnrc.yml
└── eslint.config.js #
```
