import * as React from "react";

export function Footer() {
  const tealColor = "#2c7a7b";

  const footerStyle: React.CSSProperties = {
    padding: "2rem",
    backgroundColor: tealColor,
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  };

  const leftSectionStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  const logoStyle: React.CSSProperties = {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "white",
  };

  const rightSectionStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  const contactTitleStyle: React.CSSProperties = {
    fontWeight: "bold",
    marginBottom: "0.5rem",
  };

  const emailStyle: React.CSSProperties = {
    color: "white",
    textDecoration: "underline",
    marginBottom: "0.25rem",
  };

  const poweredByStyle: React.CSSProperties = {
    backgroundColor: "#000",
    color: "white",
    textAlign: "center",
    padding: "0.5rem",
    fontSize: "0.875rem",
  };

  const linkStyle: React.CSSProperties = {
    color: "white",
    textDecoration: "underline",
  };

  return (
    <>
      <footer style={footerStyle}>
        <div style={leftSectionStyle}>
          <div style={logoStyle}>Moodle++</div>
          <div style={{ fontSize: "0.875rem" }}>
            CS300 Project, HCMUS-YourName
          </div>
        </div>
        <div style={rightSectionStyle}>
          <div style={contactTitleStyle}>Contact Us</div>
          <a href="mailto:tvutrabaja@gmail.com" style={emailStyle}>
            tvutrabaja@gmail.com
          </a>
          <a href="mailto:vietthanh2005@gmail.com" style={emailStyle}>
            vietthanh2005@gmail.com
          </a>
          <a href="mailto:vietthanh2005@gmail.com" style={emailStyle}>
            vietthanh2005@gmail.com
          </a>
          <a href="mailto:tvutrabaja@gmail.com" style={emailStyle}>
            tvutrabaja@gmail.com
          </a>
        </div>
      </footer>
      <div style={poweredByStyle}>
        Powered by{" "}
        <span style={linkStyle}>Moodle</span>
      </div>
    </>
  );
}
