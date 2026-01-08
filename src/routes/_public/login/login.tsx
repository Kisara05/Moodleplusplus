import {
  Form,
  useActionData,
  useNavigate,
  useLoaderData,
} from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { useState } from "react";

// 🔐 Backend imports
import { login } from "~/services/auth/auth.server";
import { createUserSession, getUserId } from "~/services/auth/session.server";

/* =======================
   Loader
======================= */
export async function loader({ request }: LoaderFunctionArgs) {
  // Redirect if already logged in
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/dashboard");
  }

  const url = new URL(request.url);
  const language = (url.searchParams.get("lang") as "en" | "vi") || "en";
  return json({ language });
}

/* =======================
   Action
======================= */
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const email = formData.get("email");
  const password = formData.get("password");
  const language = (formData.get("language") as "en" | "vi") || "en";

  // Validation
  if (typeof email !== "string" || typeof password !== "string") {
    return json(
      {
        error: language === "en" ? "Invalid form data" : "Dữ liệu không hợp lệ",
      },
      { status: 400 }
    );
  }

  if (!email || !password) {
    return json(
      {
        error:
          language === "en"
            ? "Please enter both Email and Password"
            : "Vui lòng nhập Email và Mật khẩu",
      },
      { status: 400 }
    );
  }

  // Login
  const result = await login({ email, password });

  if (result.error || !result.user) {
    return json(
      {
        error:
          result.error ||
          (language === "en"
            ? "Invalid email or password"
            : "Email hoặc mật khẩu không đúng"),
      },
      { status: 401 }
    );
  }

  // Role-based redirect
  const user = result.user;
  let redirectTo = "/dashboard";

  // Create session + redirect
  return createUserSession(user.id, redirectTo);
}

/* =======================
   Component (UI preserved)
======================= */
export default function Login() {
  const { language } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "vi">(language);

  const toggleLanguage = () => {
    const newLang = currentLanguage === "en" ? "vi" : "en";
    setCurrentLanguage(newLang);
    navigate(`/login?lang=${newLang}`);
  };

  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#FFFFFF",
    borderRadius: "25px",
    padding: "3rem",
    maxWidth: "500px",
    width: "100%",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#2C8B85",
    textAlign: "center",
    marginBottom: "2rem",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "1rem",
    fontSize: "1rem",
    border: "2px solid #D9D9D9",
    borderRadius: "25px",
    marginBottom: "1.5rem",
    boxSizing: "border-box",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "1rem",
    fontSize: "1.1rem",
    fontWeight: "bold",
    backgroundColor: "#2C8B85",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    marginBottom: "1rem",
  };

  const linkStyle: React.CSSProperties = {
    color: "#0A853F",
    textDecoration: "none",
    fontSize: "0.9rem",
    cursor: "pointer",
  };

  const errorStyle: React.CSSProperties = {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "1rem",
    borderRadius: "25px",
    marginBottom: "1rem",
    textAlign: "center",
  };

  return (
    <div style={containerStyle}>
      <Header
        signed_in={false}
        language={currentLanguage}
        onLanguageChange={toggleLanguage}
      />
      <main style={mainStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>Moodle++</h1>

          <Form method="post">
            <input type="hidden" name="language" value={currentLanguage} />

            {actionData?.error && (
              <div style={errorStyle}>{actionData.error}</div>
            )}

            <input
              type="email"
              name="email"
              placeholder={currentLanguage === "en" ? "Email" : "Email"}
              required
              style={inputStyle}
            />

            <input
              type="password"
              name="password"
              placeholder={currentLanguage === "en" ? "Password" : "Mật khẩu"}
              required
              style={inputStyle}
            />

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button type="submit" style={buttonStyle}>
                {currentLanguage === "en" ? "Log in" : "Đăng nhập"}
              </button>
              <a href="/forget-password" style={linkStyle}>
                {currentLanguage === "en"
                  ? "Forget password?"
                  : "Quên mật khẩu?"}
              </a>
            </div>
          </Form>
        </div>
      </main>
      <Footer language={currentLanguage} />
    </div>
  );
}
