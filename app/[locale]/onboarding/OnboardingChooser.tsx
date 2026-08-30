"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";
import TeacherApplicationForm from "./TeacherApplicationForm";

type Profile = "student" | "teacher";

export default function OnboardingChooser({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmStudent() {
    setPending(true);
    setError(null);

    const response = await fetch("/api/profile/student", { method: "POST" });
    const body = await response.json().catch(() => ({}));
    setPending(false);

    if (!response.ok || !body.ok) {
      setError(dict.auth.errors[body.error] ?? dict.auth.errors.UNKNOWN_ERROR ?? body.error);
      return;
    }

    router.replace(`/${locale}/dashboard`);
  }

  function selectProfile(next: Profile) {
    setError(null);
    setProfile(next);
  }

  return (
    <AuthShell homeHref={`/${locale}/`} visualTitle={dict.auth.visualTitle} visualText={dict.auth.visualText}>
      <div className="rounded-2xl bg-white p-6 shadow-[0_24px_80px_rgba(65,132,249,0.16)] sm:p-8">
        <div>
          <h1 className="text-3xl font-black leading-tight text-brand-blue sm:text-4xl">{dict.onboarding.title}</h1>
          <p className="mt-3 text-base font-medium leading-7 text-neutral-600">{dict.onboarding.subtitle}</p>
        </div>

        {error ? (
          <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
            {error}
          </p>
        ) : null}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => selectProfile("student")}
            disabled={pending}
            aria-pressed={profile === "student"}
            className={`rounded-lg px-4 py-3 text-left text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
              profile === "student"
                ? "bg-brand-orange text-white shadow-[0_14px_34px_rgba(255,103,0,0.28)]"
                : "bg-[#f5f8ff] text-brand-blue ring-1 ring-brand-blue/18"
            }`}
          >
            <span className="block font-black">{dict.onboarding.studentCta}</span>
            <span className={`mt-1 block text-xs font-medium ${profile === "student" ? "text-white/90" : "text-neutral-600"}`}>
              {dict.auth.profileStudentHint}
            </span>
          </button>
          <button
            type="button"
            onClick={() => selectProfile("teacher")}
            disabled={pending}
            aria-pressed={profile === "teacher"}
            className={`rounded-lg px-4 py-3 text-left text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
              profile === "teacher"
                ? "bg-brand-orange text-white shadow-[0_14px_34px_rgba(255,103,0,0.28)]"
                : "bg-[#f5f8ff] text-brand-blue ring-1 ring-brand-blue/18"
            }`}
          >
            <span className="block font-black">{dict.onboarding.teacherCta}</span>
            <span className={`mt-1 block text-xs font-medium ${profile === "teacher" ? "text-white/90" : "text-neutral-600"}`}>
              {dict.auth.profileTeacherHint}
            </span>
          </button>
        </div>

        {profile === "student" ? (
          <div className="mt-6">
            <div className="mb-6 h-px bg-brand-blue/10" />
            <p className="text-sm font-medium leading-6 text-neutral-600">{dict.onboarding.studentConfirmText}</p>
            <button
              type="button"
              onClick={confirmStudent}
              disabled={pending}
              className="mt-4 w-full rounded-lg bg-brand-orange px-4 py-3 text-sm font-black text-white shadow-[0_14px_34px_rgba(255,103,0,0.28)] transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
            >
              {dict.onboarding.studentConfirmCta}
            </button>
          </div>
        ) : null}

        {profile === "teacher" ? (
          <div className="mt-6">
            <div className="mb-6 h-px bg-brand-blue/10" />
            <TeacherApplicationForm dict={dict} locale={locale} />
          </div>
        ) : null}
      </div>
    </AuthShell>
  );
}
