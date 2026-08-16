"use client";

import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";

export default function RegisterForm({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <AuthForm
      title={dict.auth.registerTitle}
      subtitle={dict.auth.registerSubtitle}
      submitLabel={dict.auth.registerSubmit}
      fields={[
        { name: "email", label: dict.login.emailLabel, type: "email", autoComplete: "email" },
        { name: "password", label: dict.auth.newPasswordLabel, type: "password", autoComplete: "new-password" },
        {
          name: "passwordConfirmation",
          label: dict.auth.confirmPasswordLabel,
          type: "password",
          autoComplete: "new-password",
        },
      ]}
      messages={dict.auth.errors}
      visualTitle={dict.auth.visualTitle}
      visualText={dict.auth.visualText}
      homeHref={`/${locale}/`}
      googleHref={`/api/auth/google?returnTo=${encodeURIComponent(`/${locale}/dashboard`)}`}
      googleLabel={dict.auth.google}
      onSubmit={async (values) => {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const body = await response.json();
        if (!response.ok || !body.ok) return { ok: false, error: body.error, fieldErrors: body.fieldErrors };
        return { ok: true, redirectTo: `/${locale}/email-confirmation?email=${encodeURIComponent(values.email)}` };
      }}
      footer={
        <Link href={`/${locale}/login`} className="text-brand-orange hover:underline">
          {dict.auth.loginLink}
        </Link>
      }
    />
  );
}
