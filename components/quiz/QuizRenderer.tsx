'use client';

import type { Dictionary } from '@/lib/getDictionary';
import { Quiz } from '@/lib/quizzes/types';
import MultipleChoiceQuizComponent from './MultipleChoiceQuiz';
import FillGapQuizComponent from './FillGapQuiz';
import FlashcardQuizComponent from './FlashcardQuiz';

interface Props {
  quiz: Quiz;
  dict: Dictionary;
}

export default function QuizRenderer({ quiz, dict }: Props) {
  switch (quiz.type) {
    case 'multiple-choice':
      return <MultipleChoiceQuizComponent quiz={quiz} dict={dict} />;
    case 'fill-gap':
      return <FillGapQuizComponent quiz={quiz} dict={dict} />;
    case 'flashcard':
      return <FlashcardQuizComponent quiz={quiz} dict={dict} />;
    default:
      return <div>Unknown quiz type</div>;
  }
}
