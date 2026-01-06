import { Footer } from "~/components/layout/footer";
import { Header } from "~/components/layout/header";
// import { NewsSection } from "~/components/NewsSection";
// import { Sidebar } from "~/components/Sidebar";
import type { Route } from "~/types/index";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Moodle++" },
    { name: "description", content: "Main page of Moodle++" },
  ];
}

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, rgb(208, 228, 255), rgb(255, 255, 255))",
      }}
    >
      <Header />
      {/* <Hero /> */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* <NewsSection /> */}
          </div>
          <div className="lg:col-span-1">
            {/* <Sidebar /> */}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
