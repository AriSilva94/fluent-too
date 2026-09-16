"use client";

import Link from "next/link";
import { useState } from "react";
import AuthForm from "@/components/auth/AuthForm";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";
import { buildAuthVisual } from "@/lib/auth/visual";

export default function ChangePasswordForm({ dict, email, locale }: { dict: Dictionary; email: string; locale: Locale }) {
  const [saved, setSaved] = useState(false);

  return (
    <div>
      {saved ? <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{dict.auth.changePasswordSuccess}</p> : null}
      <AuthForm
        title={dict.auth.changePasswordTitle}
        subtitle={dict.auth.changePasswordSubtitle}
        submitLabel={dict.auth.changePasswordSubmit}
        fields={[
          {
            name: "username",
            label: dict.login.emailLabel,
            type: "hidden",
            autoComplete: "username",
            value: email,
            submit: false,
          },
          {
            name: "currentPassword",
            label: dict.auth.currentPasswordLabel,
            type: "password",
            autoComplete: "current-password",
          },
          { name: "password", label: dict.auth.newPasswordLabel, type: "password", autoComplete: "new-password" },
          {
            name: "passwordConfirmation",
            label: dict.auth.confirmPasswordLabel,
            type: "password",
            autoComplete: "new-password",
          },
        ]}
        messages={dict.auth.errors}
      passwordLabels={{ show: dict.auth.showPassword, hide: dict.auth.hidePassword }}
      visual={buildAuthVisual(dict, locale)}
        surface="embedded"
        footer={
          <Link href={`/${locale}/forgot-password`} className="font-black text-brand-orange transition-colors hover:text-brand-orange/80">
            {dict.auth.forgotPassword}
          </Link>
        }
        onSubmit={async (values) => {
          const response = await fetch("/api/auth/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          const body = await response.json();
          if (!response.ok || !body.ok) return { ok: false, error: body.error, fieldErrors: body.fieldErrors };
          setSaved(true);
          return { ok: true };
        }}
      />
    </div>
  );
}
