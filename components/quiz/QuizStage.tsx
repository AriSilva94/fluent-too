import type { ReactNode } from 'react';
import type { Dictionary } from '@/lib/getDictionary';

interface Props {
  title: string;
  description: string;
  level: string;
  dict: Dictionary;
  children: ReactNode;
}

export default function QuizStage({ title, description, level, dict, children }: Props) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <span className="mb-4 inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
          {dict.quizzes.levelBadge.replace('{level}', level)}
        </span>
        <h1 className="mb-4 text-3xl font-bold text-neutral-900">{title}</h1>
        <p className="text-neutral-600">{description}</p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 md:p-8">{children}</div>
    </div>
  );
}
