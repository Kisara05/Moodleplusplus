# Project Structure

Moodleplusplus/
├── src/ Source code
│ │
│ ├── components/ # (Frontend) Chứa các UI components tái sử dụng (UI đó có thể sử dụng cho nhiều models khác nhau)
│ │ ├── common/ # VD: Button.tsx, Input.tsx, Modal.tsx
│ │ └── layout/ # VD: Header.tsx, Footer.tsx, Sidebar.tsx
│ │
│ ├── routes/ # (Frontend + Backend) Nơi chứa các "trang" (pages): admin/course, admin/data,...
│ │ │ # Mỗi file .tsx ở đây là một URL. (để truy cập vào trang nào phải thêm route của trang đó vào routes.ts)
| VD: import { type RouteConfig, index, route } from "@react-router/dev/routes";
| export default [
| index("routes/_public._index.tsx"), - mặc định
| route("admin", "routes/_public.admin.tsx"), - mặc định
| route("admin/products", "routes/_public.admin.products.tsx"), - thêm cho admin/products
| route("admin/products/:productId", "routes/_public.admin.editProduct.tsx"), - thêm cho admin/editProduct trên từng productId
| route("admin/posts", "routes/_public.admin.posts.tsx"), - thêm cho admin/posts
| ] satisfies RouteConfig;
│ │ │ # - Hàm component (mặc định) là Frontend.
│ │ │ # - Hàm `loader` và `action` là Backend.
│ │ ├── \_index.tsx # Trang chủ (route "/")
│ │ ├── login.tsx # Trang /login
│ │ └── admin/ # Nhóm route cho /admin
│ │ ├── \_layout.tsx # Layout CHUNG cho tất cả các trang /admin/\*
│ │
│ ├── services/ # (Backend) Nơi chứa logic nghiệp vụ thuần túy
│ │ │ # Tất cả file ở đây NÊN có đuôi `.server.ts`
│ │ │
│ │ ├── supabase.server.ts # Cài đặt kết nối Supabase (chỉ chạy trên server)
│ │ ├── auth.server.ts # Logic đăng nhập, đăng ký, session...
│ │ └── user.server.ts # Logic quản lý CSDL cho user (profile...)
│ │
│ ├── styles/ # (Frontend) Chứa file CSS chung
│ │ └── app.css # File CSS toàn cục (nếu bạn không dùng Tailwind)
│ │
│ └── root.tsx # (Frontend) File layout GỐC của toàn bộ ứng dụng
│
├── public/ # (Frontend) Chứa file tĩnh (images, fonts, favicon.ico)
│ └── favicon.ico
│
├── .env # (Bảo mật) Chứa API keys - KHÔNG commit lên Git
├── .env.example # (An toàn) File mẫu cho .env - Commit lên Git
├── .gitignore # Rất quan trọng: Bỏ qua .env, node_modules...
├── package.json # Quản lý các gói (dependencies) và scripts
├── README.md # Hướng dẫn cho nhóm: cách cài đặt, khởi chạy...
├── tsconfig.json # Cấu hình TypeScript
└── vite.config.ts # Cấu hình Vite
