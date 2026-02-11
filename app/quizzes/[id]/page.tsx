import Link from "next/link";
import SkeletonBox from "@/components/ui/SkeletonBox";

interface QuizAttemptPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizAttemptPage({ params }: QuizAttemptPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/quizzes"
        className="text-sm text-gray-500 transition-colors hover:text-gray-900"
      >
        ← Back to quizzes
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-gray-900">
        Quiz #{id}
      </h1>

      <div className="mt-8 space-y-8">
        {[1, 2, 3].map((q) => (
          <div key={q} className="rounded-xl border border-gray-200 bg-white p-6">
            <SkeletonBox className="h-5 w-3/4" />
            <div className="mt-4 space-y-3">
              {["A", "B", "C", "D"].map((opt) => (
                <div
                  key={opt}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3"
                >
                  <span className="text-xs font-medium text-gray-400">{opt}</span>
                  <SkeletonBox className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <SkeletonBox className="h-12 w-36 rounded-lg" />
      </div>
    </div>
  );
}
