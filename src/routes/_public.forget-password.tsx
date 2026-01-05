import { useLoaderData, useNavigate } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";
import { useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const language = (url.searchParams.get("lang") as "en" | "vi") || "en";
  return json({ language });
}

export default function ForgetPassword() {
  const { language } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "vi">(language);

  const toggleLanguage = () => {
    const newLang = currentLanguage === "en" ? "vi" : "en";
    setCurrentLanguage(newLang);
    navigate(`/forget-password?lang=${newLang}`);
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
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#2C8B85",
    textAlign: "center",
    marginBottom: "2rem",
  };

  return (
    <div style={containerStyle}>
      <Header signed_in={false} language={currentLanguage} onLanguageChange={toggleLanguage} />
      <main style={mainStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>
            {currentLanguage === "en" ? "Forget Password" : "Quên mật khẩu"}
          </h1>
          <p style={{ textAlign: "center", color: "#565656" }}>
            {currentLanguage === "en"
              ? "This feature will be implemented later."
              : "Tính năng này sẽ được triển khai sau."}
          </p>
        </div>
      </main>
      <Footer language={currentLanguage} />
    </div>
  );
}
