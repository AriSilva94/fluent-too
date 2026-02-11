import { notFound } from "next/navigation";
import SkeletonBox from "@/components/ui/SkeletonBox";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900">{dict.dashboard.title}</h1>
      <p className="mt-1 text-gray-500">{dict.dashboard.welcome}</p>

      {/* Stats row */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5">
            <SkeletonBox className="h-3 w-20" />
            <SkeletonBox className="mt-3 h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900">{dict.dashboard.recentActivity}</h2>
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-4"
            >
              <SkeletonBox className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <SkeletonBox className="h-3 w-1/3" />
                <SkeletonBox className="h-3 w-1/2" />
              </div>
              <SkeletonBox className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
