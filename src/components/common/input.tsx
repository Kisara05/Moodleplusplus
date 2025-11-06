// import * as React from "react";

// // Định nghĩa props cho Input
// type InputProps = {
//   name: string;
//   type?: "text" | "email" | "password";
//   placeholder?: string;
//   defaultValue?: string;
//   required?: boolean;
// };

// // Component Input
// export function Input({
//   name,
//   type = "text",
//   placeholder,
//   defaultValue,
//   required = false,
// }: InputProps) {
//   const style: React.CSSProperties = {
//     width: "100%",
//     padding: "10px",
//     fontSize: "16px",
//     border: "1px solid #ccc",
//     borderRadius: "8px",
//     boxSizing: "border-box", // Đảm bảo padding không làm vỡ layout
//   };

//   return (
//     <input
//       name={name}
//       type={type}
//       placeholder={placeholder}
//       defaultValue={defaultValue}
//       required={required}
//       style={style}
//     />
//   );
// }
