import Link from "next/link";
import SkeletonBox from "@/components/ui/SkeletonBox";

export default function BlogListPage() {
  const posts = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Blog</h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((i) => (
          <Link
            key={i}
            href={`/blog/post-${i}`}
            className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
          >
            <SkeletonBox className="h-40 w-full rounded-none" />
            <div className="space-y-3 p-5">
              <SkeletonBox className="h-4 w-3/4" />
              <SkeletonBox className="h-3 w-full" />
              <SkeletonBox className="h-3 w-5/6" />
              <SkeletonBox className="h-3 w-1/3" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
