"use client";

import { useState } from "react";
import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";

export default function ForgotPasswordForm({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{dict.auth.forgotTitle}</h1>
        <p className="mt-3 text-sm text-gray-600">{dict.auth.forgotSuccess}</p>
        <Link href={`/${locale}/login`} className="mt-6 text-sm font-medium text-brand-orange hover:underline">
          {dict.auth.loginLink}
        </Link>
      </div>
    );
  }

  return (
    <AuthForm
      title={dict.auth.forgotTitle}
      subtitle={dict.auth.forgotSubtitle}
      submitLabel={dict.auth.forgotSubmit}
      fields={[{ name: "email", label: dict.login.emailLabel, type: "email", autoComplete: "email" }]}
      messages={dict.auth.errors}
      onSubmit={async (values) => {
        await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        setSent(true);
        return { ok: true };
      }}
    />
  );
}
