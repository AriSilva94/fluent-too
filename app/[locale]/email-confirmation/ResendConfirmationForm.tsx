"use client";

import { useState } from "react";
import AuthForm from "@/components/auth/AuthForm";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";

export default function ResendConfirmationForm({ dict, email, locale }: { dict: Dictionary; email?: string; locale: Locale }) {
  const [sent, setSent] = useState(false);

  return (
    <AuthForm
      title={dict.auth.emailConfirmationTitle}
      subtitle={sent ? dict.auth.forgotSuccess : dict.auth.emailConfirmationSubtitle}
      submitLabel={dict.auth.resendConfirmation}
      fields={[{ name: "email", label: dict.login.emailLabel, type: "email", autoComplete: "email", value: email }]}
      messages={dict.auth.errors}
      visualTitle={dict.auth.visualTitle}
      visualText={dict.auth.visualText}
      homeHref={`/${locale}/`}
      onSubmit={async (values) => {
        await fetch("/api/auth/resend-confirmation", {
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
