// import * as React from "react";

// // Định nghĩa các props mà Button có thể nhận
// type ButtonProps = {
//   children: React.ReactNode;
//   onClick?: () => void;
//   variant?: "primary" | "secondary";
//   type?: "button" | "submit";
//   disabled?: boolean;
// };

// // Component Button
// export function Button({
//   children,
//   onClick,
//   variant = "primary",
//   type = "button",
//   disabled = false,
// }: ButtonProps) {
//   // Style cơ bản
//   const baseStyle: React.CSSProperties = {
//     padding: "10px 16px",
//     border: "none",
//     borderRadius: "8px",
//     cursor: disabled ? "not-allowed" : "pointer",
//     fontSize: "16px",
//     fontWeight: "600",
//     opacity: disabled ? 0.6 : 1,
//     transition: "background-color 0.2s",
//   };

//   // Style cho từng variant
//   const styles: Record<"primary" | "secondary", React.CSSProperties> = {
//     primary: {
//       ...baseStyle,
//       backgroundColor: "#007bff",
//       color: "white",
//     },
//     secondary: {
//       ...baseStyle,
//       backgroundColor: "#6c757d",
//       color: "white",
//     },
//   };

//   return (
//     <button
//       type={type}
//       onClick={onClick}
//       style={styles[variant]}
//       disabled={disabled}
//     >
//       {children}
//     </button>
//   );
// }
