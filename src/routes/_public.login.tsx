import { Form, useActionData, useNavigate, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { useState } from "react";
import { login } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if user is already logged in
  const url = new URL(request.url);
  const language = (url.searchParams.get("lang") as "en" | "vi") || "en";
  return json({ language });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const userId = formData.get("userId") as string;
  const password = formData.get("password") as string;
  const language = formData.get("language") as string || "en";

  if (!userId || !password) {
    return json(
      { error: language === "en" ? "Please enter both User ID and Password" : "Vui lòng nhập cả User ID và Mật khẩu" },
      { status: 400 }
    );
  }

  try {
    // Call backend login function
    const result = await login({ userId, password });
    
    if (result && result.success) {
      // Create session or set cookie here
      // For now, redirect to home with signed_in flag
      return redirect(`/?signed_in=1&user_flag=${result.user_flag || 1}&lang=${language}`);
    } else {
      return json(
        { error: result?.error || (language === "en" ? "Invalid credentials" : "Thông tin đăng nhập không hợp lệ") },
        { status: 401 }
      );
    }
  } catch (error) {
    return json(
      { error: language === "en" ? "Login failed. Please try again." : "Đăng nhập thất bại. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}

export default function Login() {
  const { language } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "vi">(language);

  // Redirect is handled server-side, but keep this for client-side navigation if needed

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
      <Header signed_in={false} language={currentLanguage} onLanguageChange={toggleLanguage} />
      <main style={mainStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>Moodle++</h1>
          <Form method="post">
            <input type="hidden" name="language" value={currentLanguage} />
            {actionData?.error && (
              <div style={errorStyle}>{actionData.error}</div>
            )}
            <input
              type="text"
              name="userId"
              placeholder={currentLanguage === "en" ? "User ID" : "User ID"}
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
              <a
                href="/forget-password"
                style={linkStyle}
              >
                {currentLanguage === "en" ? "Forget password?" : "Quên mật khẩu?"}
              </a>
            </div>
          </Form>
        </div>
      </main>
      <Footer language={currentLanguage} />
    </div>
  );
}
