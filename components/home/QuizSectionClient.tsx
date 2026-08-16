"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import HomeQuizCard from "@/components/home/HomeQuizCard";
import type { Dictionary } from "@/lib/getDictionary";
import { Locale } from "@/lib/i18n";
import type { Quiz } from "@/lib/quizzes/types";
import { LEVELS, type LevelDisplay } from "@/lib/constants";
import { cn } from "@/lib/utils";

type QuizSectionClientProps = {
  locale: Locale;
  dict: Dictionary;
  quizzesByLevel: Record<LevelDisplay, Quiz[]>;
};

export default function QuizSectionClient({ locale, dict, quizzesByLevel }: QuizSectionClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const syncLevelFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const selectedLevel = params.get("resourceLevel");
      const index = isLevelDisplay(selectedLevel) ? LEVELS.indexOf(selectedLevel) : 0;
      setActiveTab(index >= 0 ? index : 0);
    };

    syncLevelFromUrl();
    window.addEventListener("popstate", syncLevelFromUrl);

    return () => window.removeEventListener("popstate", syncLevelFromUrl);
  }, []);

  const setLevelInUrl = (level: LevelDisplay) => {
    const params = new URLSearchParams(window.location.search);
    params.set("resourceLevel", level);
    setActiveTab(LEVELS.indexOf(level));
    router.replace(`${pathname}?${params.toString()}#recursos`, { scroll: false });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === "ArrowRight") nextIndex = (index + 1) % LEVELS.length;
    if (e.key === "ArrowLeft") nextIndex = (index - 1 + LEVELS.length) % LEVELS.length;
    if (nextIndex !== index) {
      e.preventDefault();
      setLevelInUrl(LEVELS[nextIndex]);
      const btn = (e.currentTarget.parentElement as HTMLElement)?.children[nextIndex] as HTMLElement;
      btn?.focus();
    }
  };

  const currentLabel = LEVELS[activeTab];
  const quizzes = quizzesByLevel[currentLabel] ?? [];
  const description = dict.levels[currentLabel];

  return (
    <section id="recursos" className="bg-white py-8 md:py-14">
      <Container>
        <div className="px-4 py-6 md:px-8 md:py-8">
          <SectionHeading
            title={dict.home.quiz.title}
            className="text-center text-brand-blue [font-size:var(--text-quiz-title)]"
          />

          <div
            role="tablist"
            aria-label={dict.home.quiz.tabsLabel}
            className="mx-auto mt-3 flex max-w-3xl items-center justify-center gap-2.5 overflow-x-auto sm:gap-4"
          >
            {LEVELS.map((level, i) => (
              <button
                key={level}
                role="tab"
                aria-selected={activeTab === i}
                tabIndex={activeTab === i ? 0 : -1}
                onClick={() => setLevelInUrl(level)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className={cn(
                  "shrink-0 rounded-lg px-4 py-2 font-bold transition-colors text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange",
                  activeTab === i
                    ? "bg-brand-orange text-white shadow-md"
                    : "text-brand-blue hover:text-brand-orange"
                )}
              >
                {level}
              </button>
            ))}
          </div>

          <div
            role="tabpanel"
            aria-label={dict.home.quiz.panelLabel.replace("{level}", LEVELS[activeTab])}
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5"
          >
            {quizzes.length > 0 ? (
              quizzes.slice(0, 3).map((quiz) => (
                <HomeQuizCard
                  key={quiz.id}
                  quiz={quiz}
                  href={`/${locale}/quizzes/${quiz.id}`}
                  description={description}
                  levelLabel={currentLabel}
                  locale={locale}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-neutral-500 py-8">
                {dict.quizzes.noQuizzesFound}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

function isLevelDisplay(value: string | null): value is LevelDisplay {
  return LEVELS.some((level) => level === value);
}
