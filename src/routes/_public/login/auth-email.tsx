export default function EmailSent() {
  return (
    <div className="bg-white p-8 rounded shadow w-[380px] text-center">
      <h1 className="text-xl font-bold mb-4">Moodle++</h1>

      <p className="text-gray-600 mb-6">
        An email has been sent to your email address with instructions.
      </p>

      <a
        href="/login"
        className="inline-block bg-teal-600 text-white px-4 py-2 rounded"
      >
        Continue
      </a>
    </div>
  );
}
