import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { AppRole } from "@/lib/auth/contracts";
import { canManageContent } from "@/lib/auth/roles";

type DashboardAdminActionsProps = {
  locale: Locale;
  role?: AppRole;
  labels: {
    title: string;
    subtitle: string;
    hubCta: string;
    quizzesTitle: string;
    blogTitle: string;
    teachersTitle: string;
  };
};

export default function DashboardAdminActions({ locale, role, labels }: DashboardAdminActionsProps) {
  if (!canManageContent(role)) return null;

  const shortcuts = [
    { href: `/${locale}/admin/quizzes`, label: labels.quizzesTitle },
    { href: `/${locale}/admin/blog`, label: labels.blogTitle },
    { href: `/${locale}/admin/teachers`, label: labels.teachersTitle },
  ];

  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-[0_18px_54px_rgba(65,132,249,0.12)]">
      <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="text-xl font-black text-brand-blue">{labels.title}</h2>
          <p className="mt-3 text-base font-medium leading-7 text-neutral-600">{labels.subtitle}</p>
        </div>
        <Link
          href={`/${locale}/admin`}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-orange px-5 text-sm font-black text-white transition-colors hover:bg-brand-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
        >
          {labels.hubCta}
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-neutral-100 pt-5">
        {shortcuts.map((shortcut) => (
          <Link
            key={shortcut.href}
            href={shortcut.href}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-black text-brand-blue ring-1 ring-brand-blue/20 transition-colors hover:bg-brand-blue/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
          >
            {shortcut.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
