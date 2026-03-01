import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SkeletonBox from "@/components/ui/SkeletonBox";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

const adminDescriptions: Record<Locale, string> = {
  "pt-br": "Painel administrativo da Fluent Too para gestão de conteúdo e usuários.",
  "en-us": "Fluent Too admin panel for content and user management.",
  "fr-fr": "Panneau d'administration Fluent Too pour la gestion du contenu et des utilisateurs.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const dict = await getDictionary(locale);
  return buildPageMetadata({
    locale,
    pathname: "/admin",
    title: `${dict.admin.title} | Fluent Too`,
    description: adminDescriptions[locale],
    index: false,
  });
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900">{dict.admin.title}</h1>
      <p className="mt-1 text-gray-500">{dict.admin.subtitle}</p>

      {/* Action bar */}
      <div className="mt-8 flex items-center gap-3">
        <SkeletonBox className="h-10 w-32 rounded-lg" />
        <SkeletonBox className="h-10 w-32 rounded-lg" />
        <div className="flex-1" />
        <SkeletonBox className="h-10 w-48 rounded-lg" />
      </div>

      {/* Table skeleton */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
        {/* Header row */}
        <div className="flex items-center gap-4 border-b border-gray-200 bg-gray-50 px-5 py-3">
          <SkeletonBox className="h-3 w-8" />
          <SkeletonBox className="h-3 w-40" />
          <SkeletonBox className="h-3 w-24" />
          <div className="flex-1" />
          <SkeletonBox className="h-3 w-20" />
          <SkeletonBox className="h-3 w-16" />
        </div>

        {/* Data rows */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-gray-100 px-5 py-4 last:border-b-0"
          >
            <SkeletonBox className="h-3 w-8" />
            <SkeletonBox className="h-3 w-40" />
            <SkeletonBox className="h-3 w-24" />
            <div className="flex-1" />
            <SkeletonBox className="h-6 w-20 rounded-full" />
            <SkeletonBox className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
