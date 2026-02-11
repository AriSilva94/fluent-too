'use client';

import type { Dictionary } from '@/lib/getDictionary';
import { QuizResult } from '@/lib/quizzes/types';
import Button from '@/components/ui/Button';
import Link from 'next/link';

interface Props {
  result: QuizResult;
  onRetry: () => void;
  dict: Dictionary;
}

export default function ResultsSummary({ result, onRetry, dict }: Props) {
  const isPerfect = result.score === 100;
  const isGood = result.score >= 70;
  
  let message = dict.quizzes.goodEffort;
  if (isPerfect) message = dict.quizzes.perfectScore;
  else if (isGood) message = dict.quizzes.greatJob;

  return (
    <div className="bg-white rounded-lg shadow border border-neutral-200 p-8 text-center max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">{message}</h2>
      
      <div className="text-6xl font-black text-blue-600 my-6">
        {result.score}%
      </div>
      
      <div className="text-neutral-600 mb-8">
        {dict.quizzes.resultSummary
          .replace('{correct}', result.correctCount.toString())
          .replace('{total}', result.totalCount.toString())}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 text-left">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {dict.quizzes.correctAnswers}
          </div>
          <div className="mt-2 text-3xl font-black text-emerald-800">
            {result.correctCount}
          </div>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-700">
            {dict.quizzes.wrongAnswers}
          </div>
          <div className="mt-2 text-3xl font-black text-rose-800">
            {result.incorrectCount}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onRetry} variant="primary">
          {dict.quizzes.tryAgain}
        </Button>
        <Link href="..">
            <Button variant="outline">
            {dict.quizzes.backToQuizzes}
            </Button>
        </Link>
      </div>
    </div>
  );
}
