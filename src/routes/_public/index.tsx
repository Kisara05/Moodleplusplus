// import { Footer } from "~/components/layout/footer";
// import { Header } from "~/components/layout/header";
import type { MetaFunction } from "~/types/index";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Moodle++" },
    { name: "description", content: "Main page of Moodle++" },
  ];
};

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to LMS Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Learn new skills, advance your career, and achieve your goals with our
          comprehensive online learning platform.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/courses"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700"
          >
            Browse Courses
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          title="Expert Instructors"
          description="Learn from industry professionals with years of experience"
          icon="👨‍🏫"
        />
        <FeatureCard
          title="Flexible Learning"
          description="Study at your own pace, anytime and anywhere"
          icon="⏰"
        />
        <FeatureCard
          title="Certificates"
          description="Earn recognized certificates upon course completion"
          icon="🎓"
        />
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
