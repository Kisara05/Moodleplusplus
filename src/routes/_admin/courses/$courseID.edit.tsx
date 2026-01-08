import { useParams } from "@remix-run/react";

export default function AdminCourseEditPage() {
  const { courseID } = useParams();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Course</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Edit form for course: {courseID}</p>
      </div>
    </div>
  );
}
