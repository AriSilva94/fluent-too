"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";

type LocaleChromeProps = {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
};

const authSurfaceSegments = new Set([
  "login",
  "register",
  "forgot-password",
  "email-confirmation",
  "auth/reset-password",
  "auth/email-confirmed",
]);

export function isAuthSurfacePath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const route = segments.slice(1).join("/");
  return authSurfaceSegments.has(route);
}

export default function LocaleChrome({ locale, dict, children }: LocaleChromeProps) {
  const pathname = usePathname();
  const hideFooter = isAuthSurfacePath(pathname);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header locale={locale} dict={dict} />
      <main className="flex flex-1 flex-col">{children}</main>
      {hideFooter ? null : <Footer locale={locale} dict={dict} />}
    </div>
  );
}
