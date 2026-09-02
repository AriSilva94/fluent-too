'use client';

import { useMemo } from 'react';
import type { Dictionary } from '@/lib/getDictionary';
import type { Locale } from '@/lib/i18n';
import { SAVE_STATE, type QuizAttemptSaveState } from '@/lib/quiz-attempts/save';
import { draftToQuiz, previewSignature, type QuizDraft } from '@/lib/quizzes/preview';
import QuizRenderer from './QuizRenderer';
import QuizStage from './QuizStage';

async function skipPersist(): Promise<QuizAttemptSaveState> {
  return SAVE_STATE.idle;
}

interface Props {
  draft: QuizDraft;
  dict: Dictionary;
  locale: Locale;
  focusIndex: number;
}

export default function QuizPreviewPanel({ draft, dict, locale, focusIndex }: Props) {
  const quiz = useMemo(() => draftToQuiz(draft, dict), [draft, dict]);
  const resetKey = `${previewSignature(draft)}:${focusIndex}`;

  return (
    <section aria-label={dict.teacher.previewTitle}>
      <header className="mb-4">
        <h2 className="text-base font-bold text-neutral-900">{dict.teacher.previewTitle}</h2>
        <p className="mt-1 text-sm text-neutral-500">{dict.teacher.previewHint}</p>
      </header>

      <div>
        <QuizStage title={quiz.title} description={quiz.description} level={quiz.level} dict={dict}>
          <QuizRenderer
            key={resetKey}
            quiz={quiz}
            dict={dict}
            locale={locale}
            persistAttempt={skipPersist}
            initialCardIndex={focusIndex}
          />
        </QuizStage>
      </div>
    </section>
  );
}
