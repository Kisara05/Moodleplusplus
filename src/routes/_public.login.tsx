import { Link } from "@remix-run/react";
import { Footer } from "~/components/layout/footer";
import { Header } from "~/components/layout/header";
import type { Route } from "~/types/index";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Login - Moodle++" },
    { name: "description", content: "Login to Moodle++" },
  ];
}

export default function Login() {
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
    maxWidth: "450px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#2c7a7b",
    marginBottom: "2rem",
    textAlign: "center",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    marginBottom: "1rem",
    boxSizing: "border-box",
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1.5rem",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "0.75rem 2rem",
    backgroundColor: "#2c7a7b",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  };

  const forgotPasswordStyle: React.CSSProperties = {
    color: "#2c7a7b",
    textDecoration: "none",
    fontSize: "0.9rem",
  };

  return (
    <div style={containerStyle}>
      <Header isLoggedIn={false} />
      <main style={mainStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>Moodle++</h1>
          <form>
            <input
              type="text"
              name="userId"
              placeholder="User ID"
              style={inputStyle}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              style={inputStyle}
              required
            />
            <div style={buttonContainerStyle}>
              <button type="submit" style={buttonStyle}>
                Log in
              </button>
              <Link to="/forgot_password" style={forgotPasswordStyle}>
                Forget password?
              </Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

