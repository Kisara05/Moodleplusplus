type RouteConfig = {
  path: string;
  file: string;
  children?: RouteConfig[]; // Add support for children
  options?: {
    index?: boolean;
  };
};

export default [
  { 
    path: "/", 
    file: "src/routes/_public.tsx",
    children: [
      {
        path: "",
        file: "src/routes/_public._index.tsx",
        options: { index: true },
      },
      { path: "login", file: "src/routes/_public.login.tsx" },
      { path: "forget-password", file: "src/routes/_public.forget-password.tsx" },
      { path: "email_sent", file: "src/routes/_public.email_sent.tsx" },
      { path: "course_view", file: "src/routes/_public.course_view.tsx" },
      { path: "register", file: "src/routes/_public.register.tsx" },
      { path: "courses", file: "src/routes/_public.courses.tsx" },
      { 
        path: "courses/:courseID", 
        file: "src/routes/_public.course/$courseID.tsx" 
      },
      { 
        path: "courses/:courseID/create_post", 
        file: "src/routes/_public.course/create_post.tsx" 
      },
      { 
        path: "courses/:courseID/create-quiz", 
        file: "src/routes/_public.course.create-quiz.tsx" 
      },
      { 
        path: "courses/:courseID/create-quiz-multiplechoice1", 
        file: "src/routes/_public.course.create-quiz-multiplechoice1.tsx" 
      },
      { 
        path: "courses/:courseID/create-quiz-multiplechoice2", 
        file: "src/routes/_public.course.create-quiz-multiplechoice2.tsx" 
      },
      { 
        path: "courses/:courseID/take-quiz-1", 
        file: "src/routes/_public.course.take-quiz-1.tsx" 
      },
      { 
        path: "courses/:courseID/take-quiz-2", 
        file: "src/routes/_public.course.take-quiz-2.tsx" 
      },
      { 
        path: "courses/:courseID/take-quiz-free-response", 
        file: "src/routes/_public.course.take-quiz-free-response.tsx" 
      },
      {
        path: "courses/:courseID/add-activity",
        file: "src/routes/_public.course/add-activity.$courseID.tsx"
      },
      {
        path: "courses/:courseID/upload-resource",
        file: "src/routes/_public.course/upload-resource.$courseID.tsx"
      },
      { path: "post", file: "src/routes/_public.post.tsx" },
      { 
        path: "post/:postID", 
        file: "src/routes/_public.post/$postID.tsx"
      },
      { 
        path: "post/:postID/edit", 
        file: "src/routes/_public.post/edit.tsx"
      },
      {
        path: "admin",
        file: "src/routes/_public.admin.tsx",
        children: [
          {
            path: "",
            file: "src/routes/_public.admin/_index.tsx",
            options: { index: true }
          },
          { path: "courses", file: "src/routes/_public.admin/courses.tsx" },
          { path: "users", file: "src/routes/_public.admin/users.tsx" },
        ]
      },
      { path: "admin/sync_folders", file: "src/routes/_public.admin.sync_folders.tsx" },
      {
        path: "user",
        file: "src/routes/_public.user.tsx",
        children: [
          {
            path: "",
            file: "src/routes/_public.user/_index.tsx",
            options: { index: true }
          }
        ]
      },
      { path: "discussion", file: "src/routes/_public.discussion.tsx" },
      { path: "course-registration", file: "src/routes/_public.course-registration.tsx" },
    ]
  },
] satisfies RouteConfig[];