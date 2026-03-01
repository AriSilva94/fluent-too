'use client';

import { useState } from 'react';
import type { Dictionary } from '@/lib/getDictionary';
import { FlashcardQuiz, QuizResult } from '@/lib/quizzes/types';
import Button from '@/components/ui/Button';
import { gradeQuiz } from '@/lib/quizzes/grade';
import QuizResultSummary from './QuizResultSummary';

interface Props {
  quiz: FlashcardQuiz;
  dict: Dictionary;
}

export default function FlashcardQuizComponent({ quiz, dict }: Props) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({}); // id -> true (knew) / false (didn't know)
  const [result, setResult] = useState<QuizResult | null>(null);

  const currentQuestion = quiz.questions[currentCardIndex];
  const isLastCard = currentCardIndex === quiz.questions.length - 1;

  const handleRate = (knewIt: boolean) => {
    const newAnswers = { ...answers, [currentQuestion.id]: knewIt };
    setAnswers(newAnswers);

    if (isLastCard) {
      const graded = gradeQuiz(quiz, newAnswers);
      setResult(graded);
    } else {
      setIsFlipped(false);
      setCurrentCardIndex((prev) => prev + 1);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setResult(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  if (result) {
    return (
      <QuizResultSummary
        result={result}
        onRetry={resetQuiz}
        dict={dict}
      />
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-4 text-center text-sm text-neutral-500">
        {dict.quizzes.cardProgress
          .replace('{current}', (currentCardIndex + 1).toString())
          .replace('{total}', quiz.questions.length.toString())}
      </div>

      <div
        key={currentQuestion.id}
        className="perspective-1000 w-full h-64 cursor-pointer mb-8 group animate-in fade-in zoom-in-95 duration-300"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d shadow-lg rounded-xl border border-neutral-200 ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-xl flex items-center justify-center p-8 text-center">
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">{dict.quizzes.term}</p>
              <h3 className="text-3xl font-bold text-neutral-900">{currentQuestion.front}</h3>
              <p className="text-sm text-neutral-400 mt-4">{dict.quizzes.clickToFlip}</p>
            </div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden bg-amber-50 rounded-xl flex items-center justify-center p-8 text-center rotate-y-180">
            <div>
              <p className="text-xs uppercase tracking-widest text-amber-600 mb-2">{dict.quizzes.meaning}</p>
              <h3 className="text-2xl font-medium text-neutral-800">{currentQuestion.back}</h3>
            </div>
          </div>
        </div>
      </div>

      {isFlipped && (
        <div className="flex gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 w-32"
            onClick={(e) => {
              e.stopPropagation();
              handleRate(false);
            }}
          >
            {dict.quizzes.didntKnow}
          </Button>
          <Button
            variant="outline"
            className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 w-32"
            onClick={(e) => {
              e.stopPropagation();
              handleRate(true);
            }}
          >
            {dict.quizzes.knewIt}
          </Button>
        </div>
      )}
    </div>
  );
}
