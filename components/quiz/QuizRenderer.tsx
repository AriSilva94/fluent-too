'use client';

import type { Dictionary } from '@/lib/getDictionary';
import type { Locale } from '@/lib/i18n';
import type { PersistAttempt } from '@/lib/quiz-attempts/save';
import { Quiz } from '@/lib/quizzes/types';
import MultipleChoiceQuizComponent from './MultipleChoiceQuiz';
import FillGapQuizComponent from './FillGapQuiz';
import FlashcardQuizComponent from './FlashcardQuiz';

interface Props {
  quiz: Quiz;
  dict: Dictionary;
  locale: Locale;
  persistAttempt?: PersistAttempt;
  initialCardIndex?: number;
}

export default function QuizRenderer({ quiz, dict, locale, persistAttempt, initialCardIndex }: Props) {
  switch (quiz.type) {
    case 'multiple-choice':
      return <MultipleChoiceQuizComponent quiz={quiz} dict={dict} locale={locale} persistAttempt={persistAttempt} />;
    case 'fill-gap':
      return <FillGapQuizComponent quiz={quiz} dict={dict} locale={locale} persistAttempt={persistAttempt} />;
    case 'flashcard':
      return (
        <FlashcardQuizComponent
          quiz={quiz}
          dict={dict}
          locale={locale}
          persistAttempt={persistAttempt}
          initialCardIndex={initialCardIndex}
        />
      );
    default:
      return null;
  }
}
