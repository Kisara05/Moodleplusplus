import { useParams } from "@remix-run/react";

export default function AdminCourseDetailPage() {
  const { courseID } = useParams();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Course Details</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Details for course: {courseID}</p>
      </div>
    </div>
  );
}
