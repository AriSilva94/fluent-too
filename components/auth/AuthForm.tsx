"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useAuthFormHeader } from "./AuthFormHeader";
import AuthShell from "./AuthShell";
import type { AuthVisual } from "@/lib/auth/visual";
import { cn } from "@/lib/utils";

export const AUTH_SURFACE = { auth: "auth", embedded: "embedded" } as const;

export type AuthSurface = (typeof AUTH_SURFACE)[keyof typeof AUTH_SURFACE];

export const FIELD_TYPE = { hidden: "hidden" } as const;

export type AuthField = {
  name: string;
  label: string;
  type: "email" | "password" | "text" | "hidden";
  autoComplete: string;
  value?: string;
  submit?: boolean;
  action?: ReactNode;
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
  dividerLabel?: string;
  passwordLabels?: { show: string; hide: string };
  consent?: ReactNode;
  footer?: ReactNode;
  visual: AuthVisual;
  surface?: AuthSurface;
  initialError?: string;
};

const FIELD_ICONS = { email: Mail, password: Lock, text: User } as const;

const INPUT_CLASS =
  "min-h-12 w-full rounded-lg border-0 bg-[#f5f8ff] pl-11 pr-4 text-base font-semibold text-gray-900 caret-brand-orange ring-1 ring-brand-blue/18 transition-shadow placeholder:text-brand-blue/50 focus:outline-none focus:ring-2 focus:ring-brand-orange";

export default function AuthForm({
  title,
  subtitle,
  submitLabel,
  fields,
  onSubmit,
  messages,
  googleHref,
  googleLabel,
  dividerLabel,
  passwordLabels,
  consent,
  footer,
  visual,
  surface = AUTH_SURFACE.auth,
  initialError,
}: AuthFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    initialError ? (messages[initialError] ?? messages.UNKNOWN_ERROR ?? initialError) : null
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const header = useAuthFormHeader();

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
    <div className={surface === AUTH_SURFACE.embedded ? "w-full max-w-xl rounded-2xl bg-white p-6 shadow-[0_18px_54px_rgba(65,132,249,0.12)] sm:p-8" : undefined}>
      {header ? <div className="mb-6">{header}</div> : null}
      <div>
        <h1 className="text-3xl font-black leading-tight text-brand-blue">{title}</h1>
        <p className="mt-2 text-base font-medium leading-7 text-neutral-600">{subtitle}</p>
      </div>

      <form className="mt-7 space-y-5" onSubmit={submit} noValidate>
        {error ? (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
            {error}
          </p>
        ) : null}

        {fields.map((field) => {
          const fieldError = fieldErrors[field.name];

          if (field.type === FIELD_TYPE.hidden) {
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

          const isPassword = field.type === "password";
          const isRevealed = Boolean(revealed[field.name]);
          const Icon = FIELD_ICONS[field.type];
          const ToggleIcon = isRevealed ? EyeOff : Eye;

          return (
            <div key={field.name} className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={field.name} className="block text-sm font-black text-brand-blue">
                  {field.label}
                </label>
                {field.action}
              </div>

              <div className="relative">
                <Icon
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-brand-blue/60"
                  strokeWidth={2.2}
                />
                <input
                  id={field.name}
                  name={field.name}
                  type={isPassword && isRevealed ? "text" : field.type}
                  autoComplete={field.autoComplete}
                  defaultValue={field.value}
                  aria-invalid={Boolean(fieldError)}
                  aria-describedby={fieldError ? `${field.name}-error` : undefined}
                  className={cn(INPUT_CLASS, isPassword && "pr-12", fieldError && "ring-2 ring-red-300 focus:ring-red-400")}
                />
                {isPassword && passwordLabels ? (
                  <button
                    type="button"
                    onClick={() => setRevealed((current) => ({ ...current, [field.name]: !current[field.name] }))}
                    aria-label={isRevealed ? passwordLabels.hide : passwordLabels.show}
                    aria-pressed={isRevealed}
                    className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-brand-blue/55 transition-colors hover:bg-brand-blue/10 hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
                  >
                    <ToggleIcon aria-hidden className="h-[18px] w-[18px]" strokeWidth={2.2} />
                  </button>
                ) : null}
              </div>

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

        {consent}
      </form>

      {googleHref && googleLabel ? (
        <div className="mt-7 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-brand-blue/15" />
            <span className="text-xs font-bold text-neutral-500">{dividerLabel}</span>
            <div className="h-px flex-1 bg-brand-blue/15" />
          </div>
          <a
            href={googleHref}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-white px-4 text-base font-black text-brand-blue ring-1 ring-brand-blue/20 transition-colors hover:bg-[#f5f8ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2"
          >
            <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5 flex-shrink-0">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.97-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19Z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.9l-7.97 6.19C6.51 42.62 14.62 48 24 48Z" />
            </svg>
            {googleLabel}
          </a>
        </div>
      ) : null}

      {footer ? <div className="mt-7 border-t border-brand-blue/10 pt-5 text-center text-sm font-semibold text-neutral-600">{footer}</div> : null}
    </div>
  );

  if (surface === AUTH_SURFACE.embedded) {
    return <div className="flex justify-center px-4 py-8">{formContent}</div>;
  }

  return <AuthShell visual={visual}>{formContent}</AuthShell>;
}
