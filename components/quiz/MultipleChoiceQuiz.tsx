'use client';

import { useState } from 'react';
import type { Dictionary } from '@/lib/getDictionary';
import { MultipleChoiceQuiz, QuizResult } from '@/lib/quizzes/types';
import Button from '@/components/ui/Button';
import { gradeQuiz } from '@/lib/quizzes/grade';
import QuizResultSummary from './QuizResultSummary';

interface Props {
  quiz: MultipleChoiceQuiz;
  dict: Dictionary;
}

export default function MultipleChoiceQuizComponent({ quiz, dict }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  const handleSubmit = () => {
    const graded = gradeQuiz(quiz, answers);
    setResult(graded);
  };

  const resetQuiz = () => {
    setAnswers({});
    setResult(null);
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
            {q.options.map((option) => (
              <label
                key={option}
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
