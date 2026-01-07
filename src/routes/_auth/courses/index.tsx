import { Link } from "@remix-run/react";

export default function CoursesPage() {
  // Mock data - sau này sẽ fetch từ database
  const courses = [
    {
      id: "1",
      title: "Introduction to React",
      description:
        "Learn the fundamentals of React and build modern web applications",
      price: 49.99,
      thumbnail: "https://via.placeholder.com/300x200",
    },
    {
      id: "2",
      title: "Advanced TypeScript",
      description: "Master TypeScript and write type-safe applications",
      price: 59.99,
      thumbnail: "https://via.placeholder.com/300x200",
    },
    {
      id: "3",
      title: "Full Stack Development",
      description: "Build complete web applications from frontend to backend",
      price: 99.99,
      thumbnail: "https://via.placeholder.com/300x200",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Available Courses</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/courses/${course.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
          >
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-blue-600">
                  ${course.price}
                </span>
                <span className="text-blue-600 hover:text-blue-700">
                  View Details →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
