import { useParams, Link } from "@remix-run/react";

export default function CourseDetailPage() {
  const { courseId } = useParams();

  // Mock data - sau này sẽ fetch từ database
  const course = {
    id: courseId,
    title: "Introduction to React",
    description:
      "Learn the fundamentals of React and build modern web applications",
    price: 49.99,
    instructor: "John Doe",
    duration: "12 hours",
    lessons: 24,
    thumbnail: "https://via.placeholder.com/800x400",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />

          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{course.description}</p>

          <div className="flex gap-6 mb-8">
            <div>
              <span className="text-gray-600">Instructor:</span>
              <span className="ml-2 font-semibold">{course.instructor}</span>
            </div>
            <div>
              <span className="text-gray-600">Duration:</span>
              <span className="ml-2 font-semibold">{course.duration}</span>
            </div>
            <div>
              <span className="text-gray-600">Lessons:</span>
              <span className="ml-2 font-semibold">{course.lessons}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">What you'll learn</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Build modern React applications
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Understand React hooks and state management
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Create reusable components
              </li>
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow sticky top-4">
            <div className="text-3xl font-bold text-blue-600 mb-6">
              ${course.price}
            </div>

            <Link
              to="/login"
              className="block w-full py-3 bg-blue-600 text-white text-center rounded-lg font-semibold hover:bg-blue-700 mb-4"
            >
              Enroll Now
            </Link>

            <div className="text-sm text-gray-600 text-center">
              30-day money-back guarantee
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
