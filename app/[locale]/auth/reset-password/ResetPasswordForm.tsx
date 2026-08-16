"use client";

import AuthForm from "@/components/auth/AuthForm";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";

export default function ResetPasswordForm({ dict, locale, code }: { dict: Dictionary; locale: Locale; code?: string }) {
  if (!code) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{dict.auth.resetTitle}</h1>
        <p className="mt-3 text-sm text-gray-600">{dict.auth.resetMissingCode}</p>
      </div>
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
