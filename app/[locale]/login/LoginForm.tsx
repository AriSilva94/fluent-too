"use client";

import SkeletonBox from "@/components/ui/SkeletonBox";
import type { Dictionary } from "@/lib/getDictionary";

export default function LoginForm({ dict }: { dict: Dictionary }) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{dict.login.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {dict.login.subtitle}
          </p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {dict.login.emailLabel}
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {dict.login.passwordLabel}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
          >
            {dict.login.submit}
          </button>
        </form>

        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-400">
                {dict.login.orContinueWith}
              </span>
            </div>
          </div>
          <SkeletonBox className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
