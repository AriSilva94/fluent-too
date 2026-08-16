"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export type AuthField = {
  name: string;
  label: string;
  type: "email" | "password" | "text";
  autoComplete: string;
  value?: string;
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
}: AuthFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFieldErrors({});
    const values = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    const result = await onSubmit(values);
    setPending(false);

    if (result.ok) {
      if (result.redirectTo) window.location.assign(result.redirectTo);
      return;
    }

    setFieldErrors(result.fieldErrors ?? {});
    if (result.error) setError(messages[result.error] ?? messages.UNKNOWN_ERROR ?? result.error);
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          {error ? (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {fields.map((field) => {
            const fieldError = fieldErrors[field.name];
            return (
              <div key={field.name}>
                <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-gray-700">
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
                {fieldError ? (
                  <p id={`${field.name}-error`} className="mt-1 text-xs text-red-700">
                    {messages[fieldError] ?? fieldError}
                  </p>
                ) : null}
              </div>
            );
          })}

          <button
            type="submit"
            disabled={pending}
            className="min-h-11 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? `${submitLabel}...` : submitLabel}
          </button>
        </form>

        {googleHref && googleLabel ? (
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-400">Google</span>
              </div>
            </div>
            <Link
              href={googleHref}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50"
            >
              <span aria-hidden="true" className="text-base font-bold text-brand-orange">
                G
              </span>
              {googleLabel}
            </Link>
          </div>
        ) : null}

        {footer ? <div className="text-center text-sm text-gray-600">{footer}</div> : null}
      </div>
    </div>
  );
}
