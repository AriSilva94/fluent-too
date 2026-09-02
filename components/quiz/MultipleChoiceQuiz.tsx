'use client';

import { useRef, useState } from 'react';
import type { Dictionary } from '@/lib/getDictionary';
import type { Locale } from '@/lib/i18n';
import { MultipleChoiceQuiz, QuizResult } from '@/lib/quizzes/types';
import Button from '@/components/ui/Button';
import { gradeQuiz } from '@/lib/quizzes/grade';
import { createQuizAttemptKey, saveQuizAttemptResult, type PersistAttempt, type QuizAttemptSaveState } from '@/lib/quiz-attempts/save';
import QuizAttemptResult from './QuizAttemptResult';

interface Props {
  quiz: MultipleChoiceQuiz;
  dict: Dictionary;
  locale: Locale;
  persistAttempt?: PersistAttempt;
}

export default function MultipleChoiceQuizComponent({ quiz, dict, locale, persistAttempt = saveQuizAttemptResult }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [saveState, setSaveState] = useState<QuizAttemptSaveState>('idle');
  const saveLockRef = useRef(false);

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

  const allAnswered = quiz.questions.every((q) => answers[q.id]);

  return (
    <div className="space-y-8">
      {quiz.questions.map((q, index) => (
        <div key={q.id} className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
          <h3 className="text-lg font-medium mb-4">
            <span className="text-neutral-500 mr-2">{index + 1}.</span>
            {q.question}
          </h3>
          <div className="space-y-3">
            {q.options.map((option, optionIndex) => (
              <label
                key={`${q.id}-${optionIndex}`}
                className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors ${
                  answers[q.id] === option
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                    : 'border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <input
                  type="radio"
                  name={q.id}
                  value={option}
                  checked={answers[q.id] === option}
                  onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: option }))}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-neutral-300"
                />
                <span className="ml-3 text-neutral-700">{option}</span>
              </label>
            ))}
          </div>
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
