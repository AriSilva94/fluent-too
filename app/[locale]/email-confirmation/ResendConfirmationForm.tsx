"use client";

import Link from "next/link";
import { useState } from "react";
import AuthForm from "@/components/auth/AuthForm";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";
import { buildAuthVisual } from "@/lib/auth/visual";

export default function ResendConfirmationForm({ dict, email, locale }: { dict: Dictionary; email?: string; locale: Locale }) {
  const [sent, setSent] = useState(false);

  return (
    <AuthForm
      title={dict.auth.emailConfirmationTitle}
      subtitle={sent ? dict.auth.forgotSuccess : dict.auth.emailConfirmationSubtitle}
      submitLabel={dict.auth.resendConfirmation}
      fields={[{ name: "email", label: dict.login.emailLabel, type: "email", autoComplete: "email", value: email }]}
      messages={dict.auth.errors}
      visual={buildAuthVisual(dict, locale)}
      footer={
        <Link href={`/${locale}/login`} className="font-black text-brand-orange transition-colors hover:text-brand-orange/80">
          {dict.auth.loginLink}
        </Link>
      }
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
