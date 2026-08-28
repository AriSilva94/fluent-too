"use client";

import { useState } from "react";
import { AuthFormHeaderProvider } from "@/components/auth/AuthFormHeader";
import type { Dictionary } from "@/lib/getDictionary";
import type { Locale } from "@/lib/i18n";
import RegisterForm from "./RegisterForm";
import TeacherRegisterForm from "./TeacherRegisterForm";

type Profile = "student" | "teacher";

export default function ProfileChooser({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const [profile, setProfile] = useState<Profile>("student");

  const chooser = (
    <div>
      <p className="text-sm font-black text-brand-blue">{dict.auth.profileTitle}</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setProfile("student")}
          aria-pressed={profile === "student"}
          className={`rounded-lg px-4 py-3 text-left text-sm font-bold transition-colors ${
            profile === "student"
              ? "bg-brand-orange text-white shadow-[0_14px_34px_rgba(255,103,0,0.28)]"
              : "bg-[#f5f8ff] text-brand-blue ring-1 ring-brand-blue/18"
          }`}
        >
          <span className="block font-black">{dict.auth.profileStudent}</span>
          <span className={`mt-1 block text-xs font-medium ${profile === "student" ? "text-white/90" : "text-neutral-600"}`}>
            {dict.auth.profileStudentHint}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setProfile("teacher")}
          aria-pressed={profile === "teacher"}
          className={`rounded-lg px-4 py-3 text-left text-sm font-bold transition-colors ${
            profile === "teacher"
              ? "bg-brand-orange text-white shadow-[0_14px_34px_rgba(255,103,0,0.28)]"
              : "bg-[#f5f8ff] text-brand-blue ring-1 ring-brand-blue/18"
          }`}
        >
          <span className="block font-black">{dict.auth.profileTeacher}</span>
          <span className={`mt-1 block text-xs font-medium ${profile === "teacher" ? "text-white/90" : "text-neutral-600"}`}>
            {dict.auth.profileTeacherHint}
          </span>
        </button>
      </div>
      <div className="mt-6 h-px bg-brand-blue/10" />
    </div>
  );

  return (
    <AuthFormHeaderProvider value={chooser}>
      {profile === "student" ? <RegisterForm dict={dict} locale={locale} /> : <TeacherRegisterForm dict={dict} locale={locale} />}
    </AuthFormHeaderProvider>
  );
}
