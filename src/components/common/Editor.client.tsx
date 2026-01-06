import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // The styling (Google Docs look)

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "clean"],
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  return (
    <div className="h-64 mb-12"> {/* Height for editor area */}
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange} 
        modules={modules} 
        className="h-full"
      />
    </div>
  );
}