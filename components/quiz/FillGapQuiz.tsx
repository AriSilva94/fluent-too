'use client';

import { useRef, useState } from 'react';
import type { Dictionary } from '@/lib/getDictionary';
import type { Locale } from '@/lib/i18n';
import { FillGapQuiz, QuizResult } from '@/lib/quizzes/types';
import Button from '@/components/ui/Button';
import { gradeQuiz } from '@/lib/quizzes/grade';
import { createQuizAttemptKey, saveQuizAttemptResult, type PersistAttempt, type QuizAttemptSaveState } from '@/lib/quiz-attempts/save';
import QuizAttemptResult from './QuizAttemptResult';

interface Props {
  quiz: FillGapQuiz;
  dict: Dictionary;
  locale: Locale;
  persistAttempt?: PersistAttempt;
}

export default function FillGapQuizComponent({ quiz, dict, locale, persistAttempt = saveQuizAttemptResult }: Props) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [saveState, setSaveState] = useState<QuizAttemptSaveState>('idle');
  const saveLockRef = useRef(false);

  const handleInputChange = (questionId: string, answerIndex: number, value: string) => {
    setAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      const newAnswers = [...currentAnswers];
      newAnswers[answerIndex] = value;
      return { ...prev, [questionId]: newAnswers };
    });
  };

  const handleSubmit = async () => {
    if (saveLockRef.current) return;
    saveLockRef.current = true;
    const graded = gradeQuiz(quiz, answers);
    setResult(graded);
    setSaveState('idle');
    const nextSaveState = await persistAttempt({ quiz, result: graded, answers, attemptKey: createQuizAttemptKey() });
    setSaveState(nextSaveState);
  };

  const resetQuiz = () => {
    saveLockRef.current = false;
    setAnswers({});
    setResult(null);
    setSaveState('idle');
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

  const allAnswered = quiz.questions.every((q) => {
    const userAns = answers[q.id] || [];
    return userAns.length === q.correctAnswers.length && userAns.every((a) => a && a.trim() !== '');
  });

  return (
    <div className="space-y-8">
      {quiz.questions.map((q, index) => (
        <div key={q.id} className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
          <h3 className="text-lg font-medium mb-4 flex items-baseline">
            <span className="text-neutral-500 mr-2">{index + 1}.</span>
            <div className="leading-loose">
              {q.parts.map((part, i) => (
                <span key={i}>
                  {part}
                  {i < q.parts.length - 1 && (
                    <input
                      type="text"
                      className="mx-2 px-2 py-1 w-32 border-b-2 border-neutral-300 focus:border-blue-500 focus:outline-none text-center bg-transparent transition-colors"
                      value={(answers[q.id] || [])[i] || ''}
                      onChange={(e) => handleInputChange(q.id, i, e.target.value)}
                      placeholder="..."
                    />
                  )}
                </span>
              ))}
            </div>
          </h3>
        </div>
      ))}

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered}
          variant="primary"
          size="lg"
        >
          {dict.quizzes.submit}
        </Button>
      </div>
    </div>
  );
}
