import { Form } from "react-router-dom";

export default function ResetPassword() {
  return (
    <div className="bg-white p-8 rounded shadow w-[380px]">
      <h1 className="text-xl font-bold text-center mb-4">Reset password</h1>

      <Form method="post" className="space-y-4">
        <input
          type="password"
          name="password"
          placeholder="New password"
          className="w-full border p-2 rounded"
        />
        <input
          type="password"
          name="confirm"
          placeholder="Confirm new password"
          className="w-full border p-2 rounded"
        />

        <button className="w-full bg-teal-600 text-white py-2 rounded">
          Save changes
        </button>
      </Form>
    </div>
  );
}
