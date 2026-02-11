import Link from "next/link";
import SkeletonBox from "@/components/ui/SkeletonBox";

export default function QuizzesListPage() {
  const quizzes = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((i) => (
          <Link
            key={i}
            href={`/quizzes/${i}`}
            className="group rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="space-y-3">
              <SkeletonBox className="h-5 w-2/3" />
              <SkeletonBox className="h-3 w-full" />
              <SkeletonBox className="h-3 w-4/5" />
              <div className="flex items-center gap-3 pt-2">
                <SkeletonBox className="h-8 w-20 rounded-full" />
                <SkeletonBox className="h-3 w-16" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
