import SkeletonBox from "@/components/ui/SkeletonBox";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900">About</h1>
      <div className="mt-8 space-y-4">
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-5/6" />
        <SkeletonBox className="h-4 w-4/5" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-3/4" />
      </div>
      <div className="mt-10 space-y-4">
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-5/6" />
        <SkeletonBox className="h-4 w-2/3" />
      </div>
    </div>
  );
}
