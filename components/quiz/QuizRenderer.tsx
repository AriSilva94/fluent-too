'use client';

import type { Dictionary } from '@/lib/getDictionary';
import type { Locale } from '@/lib/i18n';
import { Quiz } from '@/lib/quizzes/types';
import MultipleChoiceQuizComponent from './MultipleChoiceQuiz';
import FillGapQuizComponent from './FillGapQuiz';
import FlashcardQuizComponent from './FlashcardQuiz';

interface Props {
  quiz: Quiz;
  dict: Dictionary;
  locale: Locale;
}

export default function QuizRenderer({ quiz, dict, locale }: Props) {
  switch (quiz.type) {
    case 'multiple-choice':
      return <MultipleChoiceQuizComponent quiz={quiz} dict={dict} locale={locale} />;
    case 'fill-gap':
      return <FillGapQuizComponent quiz={quiz} dict={dict} locale={locale} />;
    case 'flashcard':
      return <FlashcardQuizComponent quiz={quiz} dict={dict} locale={locale} />;
    default:
      return <div>Unknown quiz type</div>;
  }
}
