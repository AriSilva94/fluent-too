import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";

export default async function EmailConfirmedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-gray-900">{dict.auth.emailConfirmedTitle}</h1>
      <p className="mt-3 text-sm text-gray-600">{dict.auth.emailConfirmedSubtitle}</p>
      <Link href={`/${locale}/login`} className="mt-6 text-sm font-medium text-brand-orange hover:underline">
        {dict.auth.loginLink}
      </Link>
    </div>
  );
}
