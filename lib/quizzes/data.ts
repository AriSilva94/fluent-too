import { Quiz } from './types';
import { quizzesPt } from './data-pt';
import { quizzesEn } from './data-en';
import { quizzesFr } from './data-fr';
import type { Locale } from '@/lib/i18n';

export const quizzes: Quiz[] = [
  ...quizzesPt,
  ...quizzesEn,
  ...quizzesFr
];

function getTargetLanguageByLocale(locale: Locale) {
  switch (locale) {
    case 'pt-br':
      return 'pt';
    case 'en-us':
      return 'en';
    case 'fr-fr':
      return 'fr';
  }
}

export function getQuizzes(locale?: Locale) {
  if (!locale) {
    return quizzes;
  }

  const targetLanguage = getTargetLanguageByLocale(locale);
  return quizzes.filter((q) => q.targetLanguage === targetLanguage);
}

export function getQuizById(id: string, locale?: Locale) {
  return getQuizzes(locale).find((q) => q.id === id);
}

export function getQuizzesByLevel(level: string, locale?: Locale) {
  return getQuizzes(locale).filter((q) => q.level === level);
}
