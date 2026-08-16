"use client";

import { useState } from "react";
import AuthForm from "@/components/auth/AuthForm";
import type { Dictionary } from "@/lib/getDictionary";

export default function ResendConfirmationForm({ dict, email }: { dict: Dictionary; email?: string }) {
  const [sent, setSent] = useState(false);

  return (
    <AuthForm
      title={dict.auth.emailConfirmationTitle}
      subtitle={sent ? dict.auth.forgotSuccess : dict.auth.emailConfirmationSubtitle}
      submitLabel={dict.auth.resendConfirmation}
      fields={[{ name: "email", label: dict.login.emailLabel, type: "email", autoComplete: "email", value: email }]}
      messages={dict.auth.errors}
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
