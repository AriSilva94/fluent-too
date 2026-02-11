import Link from "next/link";
import { Quiz } from "@/lib/quizzes/types";
import { LEVEL_VISUALS, LevelDisplay } from "@/lib/constants";
import { Locale } from "@/lib/i18n";

interface HomeQuizCardProps {
    quiz: Quiz;
    href: string;
    description?: string;
    levelLabel: LevelDisplay;
    locale: Locale;
}

export default function HomeQuizCard({
    quiz,
    href,
    description,
    levelLabel,
    locale,
}: HomeQuizCardProps) {
    const visual = LEVEL_VISUALS[levelLabel];
    const quizTypeLabel =
        quiz.type === "multiple-choice"
            ? locale === "pt-br"
                ? "Multipla escolha"
                : locale === "fr-fr"
                  ? "Choix multiple"
                  : "Multiple choice"
            : quiz.type === "fill-gap"
              ? locale === "pt-br"
                  ? "Preencher lacunas"
                  : locale === "fr-fr"
                    ? "Texte a trous"
                    : "Fill gap"
              : locale === "pt-br"
                  ? "Flashcards"
                  : locale === "fr-fr"
                    ? "Cartes memoire"
                    : "Flashcards";

    return (
        <Link href={href} className="group block h-full">
            <div className={`flex h-full flex-col overflow-hidden rounded-[22px] border border-brand-orange/60 ${visual.surface} transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)]`}>
                <div
                    className="relative flex aspect-square w-full items-end overflow-hidden bg-cover bg-center p-6"
                    style={{
                        backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0.18) 42%, rgba(15,23,42,0.74) 100%), url(${visual.image})`,
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-black/10 opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className={`absolute left-5 top-5 rounded-full bg-gradient-to-r px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.24em] text-white shadow-lg ${visual.accent}`}>
                        {levelLabel}
                    </div>

                    <div className="relative z-10 w-full rounded-2xl border border-white/18 bg-black/20 p-4 backdrop-blur-[2px]">
                        <div className="mb-3 flex items-center justify-between gap-3 text-white/88">
                            <span className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                                {quizTypeLabel}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/72">
                                {quiz.targetLanguage.toUpperCase()}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold leading-tight text-white">
                            {quiz.title}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/82">
                            {quiz.description}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 bg-brand-orange p-4 text-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5 text-green-400"
                    >
                        <path d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-5.25a.75.75 0 01-.75-.75V3z" />
                        <path d="M11.25 3a.75.75 0 00-.75.75v5.25c0 .414.336.75.75.75h5.25a.75.75 0 00.75-.75 8.25 8.25 0 00-8.25-8.25z" />
                        <path d="M12.75 14.25a.75.75 0 01.75.75v5.25c0 .414-.336.75-.75.75a8.25 8.25 0 01-8.25-8.25.75.75 0 01.75-.75h5.25z" />
                        <path d="M11.25 14.25a.75.75 0 00-.75-.75h-5.25a.75.75 0 00-.75.75 8.25 8.25 0 008.25 8.25v-5.25a.75.75 0 00-.75-.75z" />
                    </svg>
                    <span className="font-bold text-white">
                        {levelLabel} {description ? `– ${description}` : ""}
                    </span>
                </div>
            </div>
        </Link>
    );
}
