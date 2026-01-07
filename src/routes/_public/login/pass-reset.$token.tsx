import { useParams, Form } from "@remix-run/react";

export default function ResetPasswordWithTokenPage() {
  const { token } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
        <p className="text-sm text-gray-600 mb-6">Token: {token}</p>

        <Form method="post" className="space-y-4">
          <input type="hidden" name="token" value={token} />

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reset Password
          </button>
        </Form>
      </div>
    </div>
  );
}
