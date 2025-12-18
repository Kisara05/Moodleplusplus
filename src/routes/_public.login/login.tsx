import { Form } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="bg-white p-8 rounded shadow w-[360px]">
      <h1 className="text-2xl font-bold text-center mb-6 text-teal-600">
        Moodle++
      </h1>

      <Form method="post" className="space-y-4">
        <input
          name="email"
          placeholder="User ID"
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
        />

        <button className="w-full bg-teal-600 text-white py-2 rounded">
          Log in
        </button>

        <div className="text-right">
          <a href="/forgot-password" className="text-sm text-teal-600">
            Forgot password?
          </a>
        </div>
      </Form>
    </div>
  );
}
