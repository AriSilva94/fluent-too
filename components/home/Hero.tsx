import SkeletonBox from "@/components/ui/SkeletonBox";

export default function Hero() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
          Welcome to Fluent Too
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
          Your platform for learning, quizzes, and knowledge sharing.
          This is a skeleton — ready to be filled with real content.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <SkeletonBox className="h-12 w-40" />
          <SkeletonBox className="h-12 w-40 bg-gray-100" />
        </div>
      </div>
    </section>
  );
}
