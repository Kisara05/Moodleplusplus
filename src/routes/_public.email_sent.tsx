import { Link } from "@remix-run/react";
import { Footer } from "~/components/layout/footer";
import { Header } from "~/components/layout/header";
import type { Route } from "~/types/index";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Forgot Password - Moodle++" },
    { name: "description", content: "Reset your password" },
  ];
}

export default function ForgotPassword() {
  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f5f5f5",
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "3rem",
    width: "100%",
    maxWidth: "600px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#2c7a7b",
    marginBottom: "1.5rem",
    textAlign: "center",
  };

  const instructionStyle: React.CSSProperties = {
    fontSize: "1rem",
    color: "#333",
    marginBottom: "2rem",
    lineHeight: "1.6",
  };

  const inputSectionStyle: React.CSSProperties = {
    marginBottom: "1.5rem",
  };

  const inputRowStyle: React.CSSProperties = {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
  };

  const submitButtonStyle: React.CSSProperties = {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#2c7a7b",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const continueButtonStyle: React.CSSProperties = {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#2c7a7b",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  };

  const errorStyle: React.CSSProperties = {
    color: "red",
    fontSize: "0.9rem",
    marginTop: "0.5rem",
    display: "none", // Hidden for now, will be shown by backend
  };

  return (
    <div style={containerStyle}>
      <Header isLoggedIn={false} />
      <main style={mainStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>Moodle++</h1>
          <p style={instructionStyle}>
            An email has been sent to your email address, with easy
            instructions to confirm and complete this password change. If you
            continue to have difficulty, please contact the site administrator.
          </p>
          <div style={buttonContainerStyle}>
            <Link to="/login" style={continueButtonStyle}>
              Continue
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

