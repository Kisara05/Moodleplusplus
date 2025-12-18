import { Form, useActionData } from "react-router-dom";

export default function ForgotPassword() {
  const data = useActionData();

  return (
    <div className="bg-white p-8 rounded shadow w-[380px]">
      <h1 className="text-xl font-bold text-center mb-4">Moodle++</h1>

      <p className="text-sm text-gray-600 mb-4">
        Enter your User ID or School Email to reset password.
      </p>

      <Form method="post" className="space-y-3">
        <input
          name="userId"
          placeholder="User ID"
          className="w-full border p-2 rounded"
        />
        <input
          name="email"
          placeholder="School Email"
          className="w-full border p-2 rounded"
        />

        <button className="w-full bg-teal-600 text-white py-2 rounded">
          Search
        </button>
      </Form>
    </div>
  );
}
