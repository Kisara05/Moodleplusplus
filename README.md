# Project Structure (Sample structure, may need adjustment for each task later)

```bash
Moodleplusplus/
├── src/                        # Main source code
│
│ ├── components/               # Reusable UI components
│ │ ├── common/                 # Core UI: Button.tsx, Input.tsx, Modal.tsx...
│ │ └── layout/                 # Layout UI: Header.tsx, Footer.tsx, Sidebar.tsx
│ │
│ ├── routes/                   # File-based routing (React Router v7)
│ │ │                           # Each .tsx file maps to a URL and includes:
│ │ │                           #  - Page UI (Client)
│ │ │                           #  - Loader/Action (Server-side logic)
│ │ │
│ │ │  Example:
│ │ │  import { type RouteConfig, index, route } from "@react-router/dev/routes";
│ │ │  export default
│ │ │    index("routes/_public._index.tsx"),                    // Route "/"
│ │ │    route("admin", "routes/_public.admin.tsx"),            // /admin
│ │ │    route("admin/products", "routes/_public.admin.user.tsx"), // user
│ │ │    route("admin/user/:userID", "routes/_public.admin.editUser.tsx"), //user management
│ │ │    route("admin/course", "routes/_public.admin.course.tsx"), // course
│ │ │   satisfies RouteConfig;
│ │
│ │ ├── _public.tsx             # Root layout for public routes
│ │ ├── _public._index.tsx      # Home page ("/")
│ │ ├── _public/admin/          # Admin routes (product, post management)
│ │ ├── _public/course/         # Course-related routes
│ │ ├── _public/user/           # User profile, dashboard routes
│ │ ├── _public/login/          # Authentication (login, register) routes
│ │ └── _public/.../...         # Other nested modules
│
│ ├── services/                 # Server-only logic (backend handlers)
│ │ ├── supabase.server.ts      # Supabase (Online PostgreSQL) client config
│ │ ├── auth.server.ts          # Authentication (login, register, session)
│ │ └── user.server.ts          # User-related database operations
│ │
│ ├── types/                    # Global TypeScript interfaces/models
│ │ ├── index.ts
│ │ └── user.ts
│ │
│ ├── styles/                   # CSS styles (global + module)
│ │ ├── app.css
│ │ └── button.module.css
│ │
│ ├── routes.ts                 # App-level routing configuration
│ └── root.tsx                  # Global root layout (entry point)
│
├── public/                     # Static files served to browser
│ └── favicon.ico
│
├── .env                        # Environment variables containing API keys (DO NOT commit)
├── .env.example                # Sample env variables
├── .gitignore
├── package.json                # Dependencies + scripts
├── README.md                   # Project documentation
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite bundler config
├── yarnrc.yml
└── eslint.config.js            # Linting rules
```
