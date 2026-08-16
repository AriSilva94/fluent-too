"use client";

import { useState } from "react";
import AuthForm from "@/components/auth/AuthForm";
import AuthFeedback from "@/components/auth/AuthFeedback";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";

export default function ForgotPasswordForm({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <AuthFeedback
        title={dict.auth.forgotTitle}
        message={dict.auth.forgotSuccess}
        actionHref={`/${locale}/login`}
        actionLabel={dict.auth.loginLink}
        homeHref={`/${locale}/`}
        visualTitle={dict.auth.visualTitle}
        visualText={dict.auth.visualText}
      />
    );
  }

  return (
    <AuthForm
      title={dict.auth.forgotTitle}
      subtitle={dict.auth.forgotSubtitle}
      submitLabel={dict.auth.forgotSubmit}
      fields={[{ name: "email", label: dict.login.emailLabel, type: "email", autoComplete: "email" }]}
      messages={dict.auth.errors}
      visualTitle={dict.auth.visualTitle}
      visualText={dict.auth.visualText}
      homeHref={`/${locale}/`}
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
