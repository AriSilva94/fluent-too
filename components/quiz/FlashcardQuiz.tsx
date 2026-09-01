'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EXIT_TRANSITION, SPRING_CONTENT } from '@/lib/motion';
import type { Dictionary } from '@/lib/getDictionary';
import type { Locale } from '@/lib/i18n';
import { FlashcardQuiz, QuizResult } from '@/lib/quizzes/types';
import Button from '@/components/ui/Button';
import { gradeQuiz } from '@/lib/quizzes/grade';
import { createQuizAttemptKey, saveQuizAttemptResult, type QuizAttemptSaveState } from '@/lib/quiz-attempts/save';
import QuizAttemptResult from './QuizAttemptResult';

interface Props {
  quiz: FlashcardQuiz;
  dict: Dictionary;
  locale: Locale;
}

export default function FlashcardQuizComponent({ quiz, dict, locale }: Props) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [saveState, setSaveState] = useState<QuizAttemptSaveState>('idle');
  const saveLockRef = useRef(false);

  const currentQuestion = quiz.questions[currentCardIndex];
  const isLastCard = currentCardIndex === quiz.questions.length - 1;

  const handleRate = async (knewIt: boolean) => {
    const newAnswers = { ...answers, [currentQuestion.id]: knewIt };
    setAnswers(newAnswers);

    if (isLastCard) {
      if (saveLockRef.current) return;
      saveLockRef.current = true;
      const graded = gradeQuiz(quiz, newAnswers);
      setResult(graded);
      setSaveState('idle');
      const nextSaveState = await saveQuizAttemptResult({ quiz, result: graded, answers: newAnswers, attemptKey: createQuizAttemptKey() });
      setSaveState(nextSaveState);
    } else {
      setIsFlipped(false);
      setCurrentCardIndex((prev) => prev + 1);
    }
  };

  const resetQuiz = () => {
    saveLockRef.current = false;
    setAnswers({});
    setResult(null);
    setSaveState('idle');
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  if (result) {
    return (
      <QuizAttemptResult
        quiz={quiz}
        result={result}
        saveState={saveState}
        onRetry={resetQuiz}
        dict={dict}
        locale={locale}
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

      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={SPRING_CONTENT}
        className="perspective-[1000px] w-full h-64 cursor-pointer mb-8 group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={SPRING_CONTENT}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full h-full shadow-lg rounded-xl border border-neutral-200"
        >
          <div className="absolute w-full h-full backface-hidden bg-white rounded-xl flex items-center justify-center p-8 text-center">
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">{dict.quizzes.term}</p>
              <h3 className="text-3xl font-bold text-neutral-900">{currentQuestion.front}</h3>
              <p className="text-sm text-neutral-400 mt-4">{dict.quizzes.clickToFlip}</p>
            </div>
          </div>

          <div className="absolute w-full h-full backface-hidden bg-amber-50 rounded-xl flex items-center justify-center p-8 text-center rotate-y-180">
            <div>
              <p className="text-xs uppercase tracking-widest text-amber-600 mb-2">{dict.quizzes.meaning}</p>
              <h3 className="text-2xl font-medium text-neutral-800">{currentQuestion.back}</h3>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8, transition: EXIT_TRANSITION }}
          transition={SPRING_CONTENT}
          className="flex gap-4 justify-center"
        >
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
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
