"use client";

import AuthForm from "@/components/auth/AuthForm";
import AuthFeedback from "@/components/auth/AuthFeedback";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";

export default function ResetPasswordForm({ dict, locale, code }: { dict: Dictionary; locale: Locale; code?: string }) {
  if (!code) {
    return (
      <AuthFeedback
        title={dict.auth.resetTitle}
        message={dict.auth.resetMissingCode}
        homeHref={`/${locale}/`}
        visualTitle={dict.auth.visualTitle}
        visualText={dict.auth.visualText}
      />
    );
  }

  return (
    <AuthForm
      title={dict.auth.resetTitle}
      subtitle={dict.auth.resetSubtitle}
      submitLabel={dict.auth.resetSubmit}
      fields={[
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
      onSubmit={async (values) => {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, code }),
        });
        const body = await response.json();
        if (!response.ok || !body.ok) return { ok: false, error: body.error, fieldErrors: body.fieldErrors };
        return { ok: true, redirectTo: `/${locale}/dashboard` };
      }}
    />
  );
}
