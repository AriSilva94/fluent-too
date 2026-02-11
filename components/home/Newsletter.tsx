"use client";

export default function Newsletter() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Stay in the loop
        </h2>
        <p className="mt-2 text-gray-500">
          Subscribe to our newsletter for updates and new content.
        </p>

        <form
          className="mx-auto mt-6 flex max-w-md gap-3"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="you@example.com"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <button
            type="submit"
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
