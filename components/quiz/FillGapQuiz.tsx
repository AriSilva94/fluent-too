'use client';

import { useState } from 'react';
import type { Dictionary } from '@/lib/getDictionary';
import { FillGapQuiz, QuizResult } from '@/lib/quizzes/types';
import Button from '@/components/ui/Button';
import { gradeQuiz } from '@/lib/quizzes/grade';
import QuizResultSummary from './QuizResultSummary';

interface Props {
  quiz: FillGapQuiz;
  dict: Dictionary;
}

export default function FillGapQuizComponent({ quiz, dict }: Props) {
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  const handleInputChange = (questionId: string, answerIndex: number, value: string) => {
    setAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];
      const newAnswers = [...currentAnswers];
      newAnswers[answerIndex] = value;
      return { ...prev, [questionId]: newAnswers };
    });
  };

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

  // Check if all fields have at least some input. 
  // Stricter: check if strictly all gaps are filled.
  const allAnswered = quiz.questions.every((q) => {
    const userAns = answers[q.id] || [];
    // Must have an entry for each gap (correctAnswers correspond to gaps)
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
