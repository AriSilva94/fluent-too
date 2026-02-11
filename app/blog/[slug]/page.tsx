import Link from "next/link";
import SkeletonBox from "@/components/ui/SkeletonBox";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/blog"
        className="text-sm text-gray-500 transition-colors hover:text-gray-900"
      >
        ← Back to blog
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-gray-900">
        Post: {slug}
      </h1>

      <div className="mt-4 flex items-center gap-3">
        <SkeletonBox className="h-8 w-8 rounded-full" />
        <SkeletonBox className="h-3 w-24" />
        <SkeletonBox className="h-3 w-20" />
      </div>

      <SkeletonBox className="mt-8 h-64 w-full" />

      <div className="mt-8 space-y-4">
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-5/6" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-4/5" />
        <SkeletonBox className="h-4 w-3/4" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-2/3" />
      </div>
    </div>
  );
}
