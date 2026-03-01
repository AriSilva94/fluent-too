import { Quiz, QuizResult, MultipleChoiceQuiz, FillGapQuiz, FlashcardQuiz } from './types';

type QuizAnswers =
  | Record<string, string>
  | Record<string, string[]>
  | Record<string, boolean>;

function gradeFlashcard(quiz: FlashcardQuiz, answers: Record<string, boolean>): QuizResult {
  let correct = 0;
  const details: Record<string, boolean> = {};

  quiz.questions.forEach((q) => {
    // For flashcards, if they clicked "I knew it" (true), it counts.
    const isCorrect = answers[q.id] === true;
    details[q.id] = isCorrect;
    if (isCorrect) correct++;
  });

  return {
    score: Math.round((correct / quiz.questions.length) * 100),
    correctCount: correct,
    incorrectCount: quiz.questions.length - correct,
    totalCount: quiz.questions.length,
    details,
  };
}

export function gradeQuiz(quiz: Quiz, userAnswers: QuizAnswers): QuizResult {
  switch (quiz.type) {
    case 'multiple-choice':
      return gradeMultipleChoice(quiz as MultipleChoiceQuiz, userAnswers as Record<string, string>);
    case 'fill-gap': // fill-gap
      return gradeFillGap(quiz as FillGapQuiz, userAnswers as Record<string, string[]>);
    case 'flashcard':
      return gradeFlashcard(quiz as FlashcardQuiz, userAnswers as Record<string, boolean>);
    default:
        const _exhaustiveCheck: never = quiz;
        return _exhaustiveCheck;
  }
}

function gradeMultipleChoice(quiz: MultipleChoiceQuiz, answers: Record<string, string>): QuizResult {
  let correct = 0;
  const details: Record<string, boolean> = {};

  quiz.questions.forEach((q) => {
    const isCorrect = answers[q.id] === q.correctAnswer;
    details[q.id] = isCorrect;
    if (isCorrect) correct++;
  });

  return {
    score: Math.round((correct / quiz.questions.length) * 100),
    correctCount: correct,
    incorrectCount: quiz.questions.length - correct,
    totalCount: quiz.questions.length,
    details,
  };
}

function gradeFillGap(quiz: FillGapQuiz, answers: Record<string, string[]>): QuizResult {
  let correct = 0;
  const details: Record<string, boolean> = {};

  quiz.questions.forEach((q) => {
    // answers[q.id] is an array of strings strings corresponding to the gaps
    const userAns = answers[q.id] || [];
    // User must get ALL gaps in a single question correct to get the point for that question
    const isCorrect = 
      userAns.length === q.correctAnswers.length &&
      userAns.every((ans, i) => ans.trim().toLowerCase() === q.correctAnswers[i].trim().toLowerCase());
    
    details[q.id] = isCorrect;
    if (isCorrect) correct++;
  });

  return {
    score: Math.round((correct / quiz.questions.length) * 100),
    correctCount: correct,
    incorrectCount: quiz.questions.length - correct,
    totalCount: quiz.questions.length,
    details,
  };
}
