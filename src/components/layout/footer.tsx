import * as React from "react";

export function Footer() {
  const footerStyle: React.CSSProperties = {
    padding: "2rem",
    backgroundColor: "#343a40",
    color: "white",
    textAlign: "center",
    marginTop: "auto", // Đẩy footer xuống cuối
  };

  return (
    <footer style={footerStyle}>
      <p>
        &copy; {new Date().getFullYear()} MoodlePlusPlus Team. All rights
        reserved.
      </p>
    </footer>
  );
}
