"use client";

import { useId, useState, useTransition, type ComponentType, type HTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import BR from "country-flag-icons/react/3x2/BR";
import US from "country-flag-icons/react/3x2/US";
import FR from "country-flag-icons/react/3x2/FR";
import { STUDY_LANGUAGE, STUDY_LANGUAGES, type StudyLanguage, type StudyLanguageLabels } from "@/lib/study-language";
import { persistStudyLanguage } from "@/lib/study-language-client";
import { SPRING_CONTROL } from "@/lib/motion";
import { cn } from "@/lib/utils";

type FlagIcon = ComponentType<HTMLAttributes<HTMLElement>>;

const LANGUAGE_FLAGS: Record<Exclude<StudyLanguage, typeof STUDY_LANGUAGE.all>, FlagIcon> = {
  [STUDY_LANGUAGE.pt]: BR,
  [STUDY_LANGUAGE.en]: US,
  [STUDY_LANGUAGE.fr]: FR,
};

const FLAG_CLASS =
  "h-3.5 w-5 shrink-0 rounded-[3px] object-cover ring-1 ring-black/10 transition-opacity duration-200";


export default function StudyLanguageFilter({
  value,
  labels,
  onChange,
}: {
  value: StudyLanguage;
  labels: StudyLanguageLabels;
  onChange?: (language: StudyLanguage) => void;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<StudyLanguage>(value);
  const [, startTransition] = useTransition();
  const labelId = useId();

  function choose(next: StudyLanguage) {
    if (next === selected) return;

    setSelected(next);
    persistStudyLanguage(next);

    if (onChange) {
      onChange(next);
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <span id={labelId} className="text-sm font-bold text-brand-blue-ink">
        {labels.legend}
      </span>

      <div
        role="group"
        aria-labelledby={labelId}
        className="relative inline-flex items-center gap-1 rounded-full bg-[#f5f8ff] p-1.5 ring-1 ring-brand-blue/15"
      >
        {STUDY_LANGUAGES.map((language) => {
          const isActive = selected === language;
          const Flag = language === STUDY_LANGUAGE.all ? null : LANGUAGE_FLAGS[language];

          return (
            <div key={language} className="contents">
              <button
                type="button"
                onClick={() => choose(language)}
                aria-pressed={isActive}
                className={cn(
                  "relative inline-flex min-h-10 items-center gap-2 rounded-full px-2.5 text-sm text-brand-blue-ink",
                  "transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f8ff] sm:px-3.5",
                  isActive ? "font-black" : "font-bold hover:bg-white/60"
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId={`${labelId}-thumb`}
                    aria-hidden="true"
                    transition={SPRING_CONTROL}
                    className="absolute inset-0 rounded-full bg-white shadow-[0_10px_30px_rgba(65,132,249,0.18)]"
                  />
                ) : null}

                <span className="relative z-10 inline-flex items-center gap-2">
                  {Flag ? (
                    <Flag className={cn(FLAG_CLASS, isActive ? "opacity-100" : "opacity-65")} />
                  ) : (
                    <span aria-hidden="true" className="hidden shrink-0 items-center -space-x-2 sm:flex">
                      {Object.values(LANGUAGE_FLAGS).map((AllFlag, index) => (
                        <AllFlag
                          key={index}
                          className={cn(FLAG_CLASS, isActive ? "opacity-100" : "opacity-65")}
                        />
                      ))}
                    </span>
                  )}
                  {labels[language]}
                </span>
              </button>

              {language === STUDY_LANGUAGE.all ? (
                <span aria-hidden="true" className="relative z-10 mx-0.5 h-5 w-px shrink-0 bg-brand-blue/15" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
