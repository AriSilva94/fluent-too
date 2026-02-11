import Link from "next/link";
import SkeletonBox from "@/components/ui/SkeletonBox";

export default function BlogSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Latest Posts</h2>
          <Link
            href="/blog"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            View all posts →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <SkeletonBox className="h-40 w-full rounded-none" />
              <div className="space-y-3 p-5">
                <SkeletonBox className="h-4 w-3/4" />
                <SkeletonBox className="h-3 w-full" />
                <SkeletonBox className="h-3 w-5/6" />
                <SkeletonBox className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
