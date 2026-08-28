"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import AuthShell from "@/components/auth/AuthShell";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";

const LANGUAGE_OPTIONS = ["pt", "en", "fr"] as const;

export default function TeacherRegisterForm({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "");

    setPending(true);
    setError(null);
    setFieldErrors({});

    const response = await fetch("/api/auth/register-teacher", {
      method: "POST",
      body: formData,
    });
    const body = await response.json().catch(() => ({}));
    setPending(false);

    if (!response.ok || !body.ok) {
      setFieldErrors(body.fieldErrors ?? {});
      if (body.error) setError(dict.auth.errors[body.error] ?? dict.auth.errors.UNKNOWN_ERROR ?? body.error);
      return;
    }

    window.location.assign(`/${locale}/email-confirmation?email=${encodeURIComponent(email)}`);
  }

  return (
    <AuthShell homeHref={`/${locale}/`} visualTitle={dict.auth.visualTitle} visualText={dict.auth.visualText}>
      <div className="rounded-2xl bg-white p-6 shadow-[0_24px_80px_rgba(65,132,249,0.16)] sm:p-8">
        <div>
          <h1 className="text-3xl font-black leading-tight text-brand-blue sm:text-4xl">{dict.auth.registerTitle}</h1>
          <p className="mt-3 text-base font-medium leading-7 text-neutral-600">{dict.auth.registerSubtitle}</p>
        </div>

        <form ref={formRef} className="mt-8 space-y-5" onSubmit={submit}>
          {error ? (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
              {error}
            </p>
          ) : null}

          <Field
            name="email"
            label={dict.login.emailLabel}
            type="email"
            autoComplete="email"
            error={fieldErrors.email}
            messages={dict.auth.errors}
          />
          <Field
            name="password"
            label={dict.auth.newPasswordLabel}
            type="password"
            autoComplete="new-password"
            error={fieldErrors.password}
            messages={dict.auth.errors}
          />
          <Field
            name="passwordConfirmation"
            label={dict.auth.confirmPasswordLabel}
            type="password"
            autoComplete="new-password"
            error={fieldErrors.passwordConfirmation}
            messages={dict.auth.errors}
          />

          <div className="space-y-2">
            <label htmlFor="bio" className="block text-sm font-black text-brand-blue">
              {dict.auth.teacherBioLabel}
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              aria-invalid={Boolean(fieldErrors.bio)}
              className="w-full rounded-lg border-0 bg-[#f5f8ff] px-4 py-3 text-base font-semibold text-gray-900 caret-brand-orange ring-1 ring-brand-blue/18 transition-shadow placeholder:text-brand-blue/50 focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
            {fieldErrors.bio ? (
              <p className="text-sm font-semibold text-red-700">{dict.auth.errors[fieldErrors.bio] ?? fieldErrors.bio}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="experience" className="block text-sm font-black text-brand-blue">
              {dict.auth.teacherExperienceLabel}
            </label>
            <textarea
              id="experience"
              name="experience"
              rows={3}
              aria-invalid={Boolean(fieldErrors.experience)}
              className="w-full rounded-lg border-0 bg-[#f5f8ff] px-4 py-3 text-base font-semibold text-gray-900 caret-brand-orange ring-1 ring-brand-blue/18 transition-shadow placeholder:text-brand-blue/50 focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
            {fieldErrors.experience ? (
              <p className="text-sm font-semibold text-red-700">
                {dict.auth.errors[fieldErrors.experience] ?? fieldErrors.experience}
              </p>
            ) : null}
          </div>

          <fieldset className="space-y-2">
            <legend className="block text-sm font-black text-brand-blue">{dict.auth.teacherLanguagesLabel}</legend>
            <div className="flex flex-wrap gap-4">
              {LANGUAGE_OPTIONS.map((language) => (
                <label key={language} className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <input type="checkbox" name="languages" value={language} className="h-4 w-4 accent-brand-orange" />
                  {language.toUpperCase()}
                </label>
              ))}
            </div>
            {fieldErrors.languages ? (
              <p className="text-sm font-semibold text-red-700">
                {dict.auth.errors[fieldErrors.languages] ?? fieldErrors.languages}
              </p>
            ) : null}
          </fieldset>

          <Field
            name="credentialUrl"
            label={dict.auth.teacherCredentialLabel}
            type="url"
            autoComplete="url"
            required={false}
            messages={dict.auth.errors}
          />

          <div className="space-y-2">
            <label htmlFor="attachment" className="block text-sm font-black text-brand-blue">
              {dict.auth.teacherAttachmentLabel}
            </label>
            <input
              id="attachment"
              name="attachment"
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              className="w-full rounded-lg border-0 bg-[#f5f8ff] px-4 py-3 text-sm font-semibold text-gray-900 ring-1 ring-brand-blue/18 file:mr-4 file:rounded-md file:border-0 file:bg-brand-orange file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
            />
            <p className="text-xs font-medium text-neutral-600">{dict.auth.teacherAttachmentHint}</p>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="min-h-12 w-full rounded-lg bg-brand-orange px-5 text-base font-black text-white shadow-[0_14px_34px_rgba(255,103,0,0.28)] transition-colors hover:bg-brand-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-brand-orange/60"
          >
            {pending ? `${dict.auth.teacherSubmit}...` : dict.auth.teacherSubmit}
          </button>
        </form>

        <div className="mt-7 text-center text-sm font-bold text-neutral-600">
          <Link href={`/${locale}/login`} className="text-brand-orange hover:underline">
            {dict.auth.loginLink}
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

function Field({
  name,
  label,
  type,
  autoComplete,
  error,
  messages,
  required = true,
}: {
  name: string;
  label: string;
  type: string;
  autoComplete: string;
  error?: string;
  messages: Record<string, string>;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-black text-brand-blue">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className="min-h-12 w-full rounded-lg border-0 bg-[#f5f8ff] px-4 text-base font-semibold text-gray-900 caret-brand-orange ring-1 ring-brand-blue/18 transition-shadow placeholder:text-brand-blue/50 focus:outline-none focus:ring-2 focus:ring-brand-orange"
      />
      {error ? (
        <p id={`${name}-error`} className="text-sm font-semibold text-red-700">
          {messages[error] ?? error}
        </p>
      ) : null}
    </div>
  );
}
