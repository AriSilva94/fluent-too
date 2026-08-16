"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import AuthShell from "./AuthShell";

export type AuthField = {
  name: string;
  label: string;
  type: "email" | "password" | "text" | "hidden";
  autoComplete: string;
  value?: string;
  submit?: boolean;
};

type AuthSubmitResult =
  | { ok: true; redirectTo?: string }
  | { ok: false; error?: string; fieldErrors?: Record<string, string> };

type AuthFormProps = {
  title: string;
  subtitle: string;
  submitLabel: string;
  fields: AuthField[];
  onSubmit: (values: Record<string, string>) => Promise<AuthSubmitResult>;
  messages: Record<string, string>;
  googleHref?: string;
  googleLabel?: string;
  footer?: React.ReactNode;
  visualTitle: string;
  visualText: string;
  homeHref?: string;
  surface?: "auth" | "embedded";
};

export default function AuthForm({
  title,
  subtitle,
  submitLabel,
  fields,
  onSubmit,
  messages,
  googleHref,
  googleLabel,
  footer,
  visualTitle,
  visualText,
  homeHref,
  surface = "auth",
}: AuthFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    fields.forEach((field) => {
      if (field.submit === false) delete values[field.name];
    });
    setPending(true);
    setError(null);
    setFieldErrors({});
    const result = await onSubmit(values);
    setPending(false);

    if (result.ok) {
      if (result.redirectTo) window.location.assign(result.redirectTo);
      return;
    }

    setFieldErrors(result.fieldErrors ?? {});
    if (result.error) setError(messages[result.error] ?? messages.UNKNOWN_ERROR ?? result.error);
  }

  const formContent = (
    <div className={surface === "auth" ? "rounded-2xl bg-white p-6 shadow-[0_24px_80px_rgba(65,132,249,0.16)] sm:p-8" : "w-full max-w-xl rounded-2xl bg-white p-6 shadow-[0_18px_54px_rgba(65,132,249,0.12)] sm:p-8"}>
      <div>
        <h1 className="text-3xl font-black leading-tight text-brand-blue sm:text-4xl">{title}</h1>
        <p className="mt-3 text-base font-medium leading-7 text-neutral-600">{subtitle}</p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={submit}>
        {error ? (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
            {error}
          </p>
        ) : null}

        {fields.map((field) => {
          const fieldError = fieldErrors[field.name];
          if (field.type === "hidden") {
            return (
              <input
                key={field.name}
                id={field.name}
                name={field.name}
                type="text"
                autoComplete={field.autoComplete}
                defaultValue={field.value}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
              />
            );
          }

          return (
            <div key={field.name} className="space-y-2">
              <label htmlFor={field.name} className="block text-sm font-black text-brand-blue">
                {field.label}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                defaultValue={field.value}
                aria-invalid={Boolean(fieldError)}
                aria-describedby={fieldError ? `${field.name}-error` : undefined}
                className="min-h-12 w-full rounded-lg border-0 bg-[#f5f8ff] px-4 text-base font-semibold text-gray-900 caret-brand-orange ring-1 ring-brand-blue/18 transition-shadow placeholder:text-brand-blue/50 focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
              {fieldError ? (
                <p id={`${field.name}-error`} className="text-sm font-semibold text-red-700">
                  {messages[fieldError] ?? fieldError}
                </p>
              ) : null}
            </div>
          );
        })}

        <button
          type="submit"
          disabled={pending}
          className="min-h-12 w-full rounded-lg bg-brand-orange px-5 text-base font-black text-white shadow-[0_14px_34px_rgba(255,103,0,0.28)] transition-colors hover:bg-brand-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-brand-orange/60"
        >
          {pending ? `${submitLabel}...` : submitLabel}
        </button>
      </form>

      {googleHref && googleLabel ? (
        <div className="mt-7 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-brand-blue/15" />
            <span className="text-xs font-black uppercase tracking-[0.18em] text-brand-blue/60">Google</span>
            <div className="h-px flex-1 bg-brand-blue/15" />
          </div>
          <Link
            href={googleHref}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-white px-4 text-base font-black text-brand-blue ring-1 ring-brand-blue/20 transition-colors hover:bg-[#f5f8ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
          >
            <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue text-sm font-black text-white">
              G
            </span>
            {googleLabel}
          </Link>
        </div>
      ) : null}

      {footer ? <div className="mt-7 text-center text-sm font-bold text-neutral-600">{footer}</div> : null}
    </div>
  );

  if (surface === "embedded") {
    return <div className="flex justify-center px-4 py-8">{formContent}</div>;
  }

  return (
    <AuthShell homeHref={homeHref} visualTitle={visualTitle} visualText={visualText}>
      {formContent}
    </AuthShell>
  );
}
