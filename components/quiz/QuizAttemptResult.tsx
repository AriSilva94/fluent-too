'use client';

import Link from 'next/link';
import type { Dictionary } from '@/lib/getDictionary';
import type { Locale } from '@/lib/i18n';
import type { Quiz, QuizResult } from '@/lib/quizzes/types';
import type { QuizAttemptSaveState } from '@/lib/quiz-attempts/save';
import Button from '@/components/ui/Button';
import QuizResultSummary from './QuizResultSummary';

type Props = {
  quiz: Quiz;
  result: QuizResult;
  saveState: QuizAttemptSaveState;
  onRetry: () => void;
  dict: Dictionary;
  locale: Locale;
};

export default function QuizAttemptResult({ quiz, result, saveState, onRetry, dict, locale }: Props) {
  const returnTo = `/${locale}/quizzes/${quiz.id}`;

  return (
    <div className="space-y-4">
      <QuizResultSummary result={result} onRetry={onRetry} dict={dict} />
      {saveState === 'saved' ? (
        <p className="mx-auto max-w-lg rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
          {dict.quizzes.saveSuccess}
        </p>
      ) : null}
      {saveState === 'failed' ? (
        <p className="mx-auto max-w-lg rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-800">
          {dict.quizzes.saveFailed}
        </p>
      ) : null}
      {saveState === 'anonymous' ? (
        <div className="mx-auto max-w-lg rounded-lg border border-blue-200 bg-blue-50 p-5 text-center">
          <h3 className="text-lg font-bold text-blue-950">{dict.quizzes.saveSignInTitle}</h3>
          <p className="mt-2 text-sm text-blue-800">{dict.quizzes.saveSignInSubtitle}</p>
          <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={`/${locale}/register?returnTo=${encodeURIComponent(returnTo)}`}>
              <Button variant="primary">{dict.quizzes.createAccount}</Button>
            </Link>
            <Link href={`/${locale}/login?returnTo=${encodeURIComponent(returnTo)}`}>
              <Button variant="outline">{dict.quizzes.signIn}</Button>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
