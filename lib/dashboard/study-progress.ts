import type { QuizAttempt } from "@/lib/quiz-attempts/types";
import type { QuizLevel, TargetLanguage } from "@/lib/quizzes/types";

export const LEVEL_ORDER: QuizLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export type LanguageProgress = {
  language: TargetLanguage;
  attempts: number;
  averageScore: number;
  bestScore: number;
  topLevel: QuizLevel;
  lastAt: string | null;
};

export type StudySummary = {
  total: number;
  averageScore: number;
  bestScore: number;
  masteredCount: number;
  byLanguage: LanguageProgress[];
  lastAttempt: QuizAttempt | null;
  practicedSlugs: string[];
};

const MASTERY_SCORE = 80;

function attemptTime(attempt: QuizAttempt) {
  const value = attempt.completedAt ?? attempt.createdAt;
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function summarizeAttempts(attempts: QuizAttempt[]): StudySummary {
  if (attempts.length === 0) {
    return { total: 0, averageScore: 0, bestScore: 0, masteredCount: 0, byLanguage: [], lastAttempt: null, practicedSlugs: [] };
  }

  const sorted = [...attempts].sort((a, b) => attemptTime(b) - attemptTime(a));
  const groups = new Map<TargetLanguage, QuizAttempt[]>();

  for (const attempt of sorted) {
    const bucket = groups.get(attempt.targetLanguage) ?? [];
    bucket.push(attempt);
    groups.set(attempt.targetLanguage, bucket);
  }

  const byLanguage = [...groups.entries()]
    .map(([language, group]) => ({
      language,
      attempts: group.length,
      averageScore: average(group.map((item) => item.score)),
      bestScore: Math.max(...group.map((item) => item.score)),
      topLevel: highestLevel(group.map((item) => item.level)),
      lastAt: group[0].completedAt ?? group[0].createdAt ?? null,
    }))
    .sort((a, b) => b.attempts - a.attempts);

  return {
    total: attempts.length,
    averageScore: average(attempts.map((attempt) => attempt.score)),
    bestScore: Math.max(...attempts.map((attempt) => attempt.score)),
    masteredCount: new Set(attempts.filter((attempt) => attempt.score >= MASTERY_SCORE).map((attempt) => attempt.quizSlug)).size,
    byLanguage,
    lastAttempt: sorted[0],
    practicedSlugs: [...new Set(sorted.map((attempt) => attempt.quizSlug))],
  };
}

type RecommendableQuiz = { id: string; level: QuizLevel; targetLanguage: TargetLanguage };

export function recommendQuizzes<T extends RecommendableQuiz>(quizzes: T[], summary: StudySummary, limit = 3): T[] {
  const practiced = new Set(summary.practicedSlugs);
  const languages = summary.byLanguage.map((entry) => entry.language);
  const fresh = quizzes.filter((quiz) => !practiced.has(quiz.id));
  const pool = fresh.length > 0 ? fresh : quizzes;

  const scored = [...pool].sort((a, b) => languageRank(a, languages) - languageRank(b, languages) || levelRank(a) - levelRank(b));
  return scored.slice(0, limit);
}

export function levelReach(summary: StudySummary) {
  if (summary.byLanguage.length === 0) return null;
  return highestLevel(summary.byLanguage.map((entry) => entry.topLevel));
}

function languageRank<T extends RecommendableQuiz>(quiz: T, languages: TargetLanguage[]) {
  const index = languages.indexOf(quiz.targetLanguage);
  return index === -1 ? languages.length : index;
}

function levelRank<T extends RecommendableQuiz>(quiz: T) {
  return LEVEL_ORDER.indexOf(quiz.level);
}

function highestLevel(levels: QuizLevel[]): QuizLevel {
  return levels.reduce<QuizLevel>((top, level) => (LEVEL_ORDER.indexOf(level) > LEVEL_ORDER.indexOf(top) ? level : top), LEVEL_ORDER[0]);
}

function average(values: number[]) {
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}
