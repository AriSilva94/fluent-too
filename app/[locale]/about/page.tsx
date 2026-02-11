import { notFound } from "next/navigation";
import SkeletonBox from "@/components/ui/SkeletonBox";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900">{dict.about.title}</h1>
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
