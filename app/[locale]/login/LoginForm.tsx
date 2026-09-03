"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";
import { buildAuthVisual } from "@/lib/auth/visual";

export default function LoginForm({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? `/${locale}/dashboard`;
  const initialError = searchParams.get("error") ?? undefined;

  return (
    <AuthForm
      title={dict.login.title}
      subtitle={dict.login.subtitle}
      submitLabel={dict.login.submit}
      fields={[
        { name: "email", label: dict.login.emailLabel, type: "email", autoComplete: "email" },
        {
          name: "password",
          label: dict.login.passwordLabel,
          type: "password",
          autoComplete: "current-password",
          action: (
            <Link
              href={`/${locale}/forgot-password`}
              className="text-xs font-bold text-brand-blue-ink transition-colors hover:text-brand-orange"
            >
              {dict.auth.forgotPassword}
            </Link>
          ),
        },
      ]}
      messages={dict.auth.errors}
      passwordLabels={{ show: dict.auth.showPassword, hide: dict.auth.hidePassword }}
      initialError={initialError}
      visual={buildAuthVisual(dict, locale)}
      googleHref={`/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`}
      googleLabel={dict.auth.google}
      dividerLabel={dict.login.orContinueWith}
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
        <span>
          {dict.auth.noAccount}{" "}
          <Link href={`/${locale}/register`} className="font-black text-brand-orange transition-colors hover:text-brand-orange/80">
            {dict.auth.registerLink}
          </Link>
        </span>
      }
    />
  );
}
