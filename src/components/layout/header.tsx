import * as React from "react";
import { Link } from "@remix-run/react";

type HeaderProps = {
  isLoggedIn?: boolean;
};

export function Header({ isLoggedIn = false }: HeaderProps) {
  // Teal-green color: #2c7a7b (dark teal)
  const tealColor = "#2c7a7b";

  if (!isLoggedIn) {
    // Header for login screen
    const headerStyle: React.CSSProperties = {
      padding: "1rem 2rem",
      backgroundColor: tealColor,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    };

    const logoStyle: React.CSSProperties = {
      fontSize: "1.5rem",
      fontWeight: "bold",
      textDecoration: "none",
      color: "white",
    };

    const rightSectionStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      color: "white",
    };

    const helpIconStyle: React.CSSProperties = {
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      border: "2px solid white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "bold",
    };

    return (
      <header style={headerStyle}>
        <Link to="/" style={logoStyle}>
          Moodle++
        </Link>
        <div style={rightSectionStyle}>
          <span>English</span>
          <div style={helpIconStyle}>?</div>
        </div>
      </header>
    );
  }

  // Header for logged in users
  const headerStyle: React.CSSProperties = {
    padding: "1rem 2rem",
    backgroundColor: tealColor,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const logoStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    textDecoration: "none",
    color: "white",
  };

  const navStyle: React.CSSProperties = {
    display: "flex",
    gap: "2rem",
    alignItems: "center",
  };

  const navLinkStyle: React.CSSProperties = {
    color: "white",
    textDecoration: "none",
    fontSize: "1rem",
    padding: "0.5rem 0",
  };

  const activeNavLinkStyle: React.CSSProperties = {
    ...navLinkStyle,
    borderBottom: "2px solid white",
  };

  const rightSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    color: "white",
  };

  const iconStyle: React.CSSProperties = {
    width: "24px",
    height: "24px",
    cursor: "pointer",
    fontSize: "20px",
  };

  const profileStyle: React.CSSProperties = {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <header style={headerStyle}>
      <Link to="/" style={logoStyle}>
        Moodle++
      </Link>
      <nav style={navStyle}>
        <Link to="/" style={navLinkStyle}>
          Dashboard
        </Link>
        <Link to="/" style={activeNavLinkStyle}>
          My courses
        </Link>
        <Link to="/" style={navLinkStyle}>
          Course registration
        </Link>
      </nav>
      <div style={rightSectionStyle}>
        <div style={iconStyle}>?</div>
        <div style={iconStyle}>🔔</div>
        <div style={iconStyle}>💬</div>
        <div style={profileStyle}></div>
        <div style={iconStyle}>▼</div>
      </div>
    </header>
  );
}
