import type { ComponentType, HTMLAttributes } from "react";
import BR from "country-flag-icons/react/3x2/BR";
import US from "country-flag-icons/react/3x2/US";
import FR from "country-flag-icons/react/3x2/FR";
import { TARGET_LANGUAGE, type TargetLanguage } from "@/lib/quizzes/types";
import { cn } from "@/lib/utils";

type FlagIcon = ComponentType<HTMLAttributes<HTMLElement>>;

const FLAGS: Record<TargetLanguage, FlagIcon> = {
  [TARGET_LANGUAGE.pt]: BR,
  [TARGET_LANGUAGE.en]: US,
  [TARGET_LANGUAGE.fr]: FR,
};

export default function LanguageFlag({ language, label, className }: {
  language: string | undefined;
  label: string;
  className?: string;
}) {
  const Flag = FLAGS[language as TargetLanguage];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {Flag && <Flag aria-hidden className="h-3.5 w-5 shrink-0 rounded-[3px] object-cover ring-1 ring-black/10" />}
      {label}
    </span>
  );
}
