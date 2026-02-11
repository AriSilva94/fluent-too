import Link from 'next/link';
import { Quiz } from '@/lib/quizzes/types';
import Button from '@/components/ui/Button';
import type { Dictionary } from '@/lib/getDictionary';

// --- Level Tabs ---

interface LevelTabsProps {
  levels: string[];
  currentLevel: string | undefined;
  dict: Dictionary;
}

export function LevelTabs({ levels, currentLevel, dict }: LevelTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <Link href="?">
        <Button variant={!currentLevel ? 'primary' : 'outline'} size="sm">
          {dict.quizzes.all}
        </Button>
      </Link>
      {levels.map((level) => (
        <Link key={level} href={`?level=${level}`}>
          <Button
            variant={currentLevel === level ? 'primary' : 'outline'}
            size="sm"
          >
            {level}
          </Button>
        </Link>
      ))}
    </div>
  );
}

// --- Quiz Card ---

interface QuizCardProps {
  quiz: Quiz;
  href: string;
  dict: Dictionary;
}

export function QuizCard({ quiz, href, dict }: QuizCardProps) {
  return (
    <Link href={href} className="block group">
      <div className="border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2">
            <span className="inline-block px-2 py-1 text-xs font-bold text-blue-600 bg-blue-50 rounded">
              {quiz.level}
            </span>
            <span className="inline-block px-2 py-1 text-xs font-bold text-neutral-600 bg-neutral-100 rounded uppercase">
              {quiz.targetLanguage}
            </span>
          </div>
          <span className="text-xs text-neutral-500 uppercase tracking-wide">
            {quiz.type.replace('-', ' ')}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-blue-600 transition-colors">
          {quiz.title}
        </h3>
        <p className="text-sm text-neutral-600 flex-grow">
          {quiz.description}
        </p>
        <div className="mt-4 text-blue-600 text-sm font-medium flex items-center">
          {dict.quizzes.start} <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </Link>
  );
}
