import * as React from "react";

type FooterProps = {
  language?: "en" | "vi";
};

export function Footer({ language = "en" }: FooterProps) {
  const footerMainStyle: React.CSSProperties = {
    backgroundColor: "#2C8B85",
    padding: "3rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    color: "#FFFFFF",
  };

  const footerBottomStyle: React.CSSProperties = {
    backgroundColor: "#000000",
    padding: "1rem",
    textAlign: "center",
    color: "#FFFFFF",
  };

  const leftSectionStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  const rightSectionStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  };

  const textStyle: React.CSSProperties = {
    fontSize: "1rem",
    margin: "0.25rem 0",
  };

  const emailStyle: React.CSSProperties = {
    color: "#FFFFFF",
    textDecoration: "underline",
    fontSize: "0.9rem",
    margin: "0.25rem 0",
    cursor: "pointer",
  };

  const poweredByStyle: React.CSSProperties = {
    fontSize: "0.9rem",
  };

  const moodleLinkStyle: React.CSSProperties = {
    color: "#FFFFFF",
    textDecoration: "underline",
    cursor: "pointer",
  };

  return (
    <>
      <footer style={footerMainStyle}>
        <div style={leftSectionStyle}>
          <div style={titleStyle}>Moodle++</div>
          <div style={textStyle}>CS300 Project, HCMUS-YourName</div>
        </div>
        <div style={rightSectionStyle}>
          <div style={titleStyle}>Contact Us</div>
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
      <div style={footerBottomStyle}>
        <span style={poweredByStyle}>
          Powered by{" "}
          <a
            href="https://moodle.org"
            target="_blank"
            rel="noopener noreferrer"
            style={moodleLinkStyle}
          >
            Moodle
          </a>
        </span>
      </div>
    </>
  );
}
