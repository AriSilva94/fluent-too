"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import HomeQuizCard from "@/components/home/HomeQuizCard";
import type { Dictionary } from "@/lib/getDictionary";
import { Locale } from "@/lib/i18n";
import type { Quiz } from "@/lib/quizzes/types";
import { KEY, LEVELS, type LevelDisplay } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { ENTER_OFFSET_Y, EXIT_TRANSITION, SPRING_CONTENT, SPRING_ENTER, SWAP_LEAD, staggerDelay } from "@/lib/motion";
import StudyLanguageFilter from "@/components/StudyLanguageFilter";
import { buildStudyLanguageLabels, toTargetLanguage, type StudyLanguage } from "@/lib/study-language";

type QuizSectionClientProps = {
  locale: Locale;
  dict: Dictionary;
  quizzesByLevel: Record<LevelDisplay, Quiz[]>;
  studyLanguage: StudyLanguage;
};

const HOME_QUIZ_LIMIT = 3;

const PANEL_SHADOW_ROOM = 64;

export default function QuizSectionClient({ locale, dict, quizzesByLevel, studyLanguage }: QuizSectionClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [language, setLanguage] = useState<StudyLanguage>(studyLanguage);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);

  const measureGrid = useCallback((node: HTMLDivElement) => {
    const observer = new ResizeObserver(([entry]) => {
      const height = entry.contentRect.height;
      const emSaida = getComputedStyle(node).position === "absolute";

      if (!node.isConnected || emSaida || height <= 0) return;
      setPanelHeight(height);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

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
    if (e.key === KEY.arrowRight) nextIndex = (index + 1) % LEVELS.length;
    if (e.key === KEY.arrowLeft) nextIndex = (index - 1 + LEVELS.length) % LEVELS.length;
    if (nextIndex !== index) {
      e.preventDefault();
      setLevelInUrl(LEVELS[nextIndex]);
      const btn = (e.currentTarget.parentElement as HTMLElement)?.children[nextIndex] as HTMLElement;
      btn?.focus();
    }
  };

  const currentLabel = LEVELS[activeTab];
  const description = dict.levels[currentLabel];

  const quizzes = useMemo(() => {
    const targetLanguage = toTargetLanguage(language);
    const forLevel = quizzesByLevel[currentLabel] ?? [];

    return (targetLanguage ? forLevel.filter((quiz) => quiz.targetLanguage === targetLanguage) : forLevel).slice(
      0,
      HOME_QUIZ_LIMIT
    );
  }, [quizzesByLevel, currentLabel, language]);

  const gridKey = quizzes.map((quiz) => quiz.id).join("|") || "empty";

  return (
    <section id="recursos" className="bg-white py-8 md:py-14">
      <Container>
        <div className="px-4 py-6 md:px-8 md:py-8">
          <SectionHeading
            title={dict.home.quiz.title}
            className="text-center text-brand-blue [font-size:var(--text-quiz-title)]"
          />

          <div className="mt-5 flex justify-center">
            <StudyLanguageFilter
              value={studyLanguage}
              labels={buildStudyLanguageLabels(dict.studyLanguage)}
              onChange={setLanguage}
            />
          </div>

          <div
            role="tablist"
            aria-label={dict.home.quiz.tabsLabel}
            className="mx-auto mt-9 flex max-w-3xl items-center justify-center gap-2.5 overflow-x-auto sm:gap-4"
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

          <motion.div
            role="tabpanel"
            aria-label={dict.home.quiz.panelLabel.replace("{level}", LEVELS[activeTab])}
            animate={{ height: panelHeight === null ? "auto" : panelHeight + PANEL_SHADOW_ROOM }}
            transition={SPRING_CONTENT}
            className="relative mt-6 overflow-hidden"
          >
            <AnimatePresence initial={false}>
              <QuizGrid key={gridKey} onMeasure={measureGrid}>
                {quizzes.length > 0 ? (
                  quizzes.map((quiz, index) => (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, y: ENTER_OFFSET_Y, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ ...SPRING_ENTER, delay: staggerDelay(index) }}
                    >
                      <HomeQuizCard
                        quiz={quiz}
                        href={`/${locale}/quizzes/${quiz.id}`}
                        description={description}
                        levelLabel={currentLabel}
                        locale={locale}
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: ENTER_OFFSET_Y }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING_ENTER, delay: SWAP_LEAD }}
                    className="col-span-full text-center text-neutral-500 py-8"
                  >
                    {dict.quizzes.noQuizzesFound}
                  </motion.div>
                )}
              </QuizGrid>
            </AnimatePresence>
          </motion.div>

          <div className="mt-8 flex justify-center">
            <Link
              href={`/${locale}/quizzes`}
              className="inline-flex min-h-11 items-center rounded-lg bg-brand-orange px-6 text-sm font-black text-white transition-colors hover:bg-brand-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
            >
              {dict.home.quiz.viewAll}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

function QuizGrid({ children, onMeasure }: { children: ReactNode; onMeasure: (node: HTMLDivElement) => () => void }) {
  const isPresent = useIsPresent();

  return (
    <motion.div
      ref={onMeasure}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -10, transition: EXIT_TRANSITION }}
      className={cn(
        "grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5",
        !isPresent && "pointer-events-none absolute inset-x-0 top-0"
      )}
    >
      {children}
    </motion.div>
  );
}

function isLevelDisplay(value: string | null): value is LevelDisplay {
  return LEVELS.some((level) => level === value);
}
