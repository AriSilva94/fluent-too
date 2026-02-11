import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <Link href="/" className="text-sm font-bold text-gray-900">
          Fluent Too
        </Link>
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Fluent Too. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
