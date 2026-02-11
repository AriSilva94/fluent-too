import Link from "next/link";
import SkeletonBox from "@/components/ui/SkeletonBox";

export default function QuizSection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Popular Quizzes</h2>
          <Link
            href="/quizzes"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            View all quizzes →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <div className="space-y-3 p-5">
                <SkeletonBox className="h-5 w-2/3" />
                <SkeletonBox className="h-3 w-full" />
                <SkeletonBox className="h-3 w-4/5" />
                <div className="flex items-center gap-3 pt-2">
                  <SkeletonBox className="h-8 w-20 rounded-full" />
                  <SkeletonBox className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
