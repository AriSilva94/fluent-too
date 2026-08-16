"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";

export default function LoginForm({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? `/${locale}/dashboard`;

  return (
    <AuthForm
      title={dict.login.title}
      subtitle={dict.login.subtitle}
      submitLabel={dict.login.submit}
      fields={[
        { name: "email", label: dict.login.emailLabel, type: "email", autoComplete: "email" },
        { name: "password", label: dict.login.passwordLabel, type: "password", autoComplete: "current-password" },
      ]}
      messages={dict.auth.errors}
      visualTitle={dict.auth.visualTitle}
      visualText={dict.auth.visualText}
      homeHref={`/${locale}/`}
      googleHref={`/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`}
      googleLabel={dict.auth.google}
      onSubmit={async (values) => {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const body = await response.json();
        if (!response.ok || !body.ok) return { ok: false, error: body.error, fieldErrors: body.fieldErrors };
        return { ok: true, redirectTo: returnTo };
      }}
      footer={
        <div className="space-y-2">
          <Link href={`/${locale}/forgot-password`} className="block text-brand-orange hover:underline">
            {dict.auth.forgotPassword}
          </Link>
          <Link href={`/${locale}/register`} className="block text-brand-orange hover:underline">
            {dict.auth.registerLink}
          </Link>
        </div>
      }
    />
  );
}
