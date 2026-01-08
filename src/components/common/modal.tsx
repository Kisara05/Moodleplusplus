// import * as React from "react";

// type ModalProps = {
//   children: React.ReactNode;
//   isOpen: boolean;
//   onClose: () => void;
// };

// export function Modal({ children, isOpen, onClose }: ModalProps) {
//   if (!isOpen) {
//     return null;
//   }

//   const backdropStyle: React.CSSProperties = {
//     position: "fixed",
//     top: 0,
//     left: 0,
//     width: "100%",
//     height: "100%",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 1000,
//   };

//   const modalStyle: React.CSSProperties = {
//     backgroundColor: "white",
//     padding: "20px",
//     borderRadius: "8px",
//     minWidth: "300px",
//     maxWidth: "90%",
//     boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
//     zIndex: 1001,
//   };

//   return (
//     <div style={backdropStyle} onClick={onClose}>
//       <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
//         {children}
//         <button onClick={onClose} style={{ marginTop: "10px" }}>
//           Close
//         </button>
//       </div>
//     </div>
//   );
// }
