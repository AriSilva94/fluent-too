import { getDictionary } from '@/lib/getDictionary';
import { Locale } from '@/lib/i18n';
import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import { getQuizzes, getQuizzesByLevel } from '@/lib/quizzes/data';
import { LevelTabs, QuizCard } from '@/components/quiz/Shared';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function QuizListPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { level } = await searchParams;
  
  const dict = await getDictionary(locale as Locale);
  const currentLevel = typeof level === 'string' ? level : undefined;
  
  const quizzes = currentLevel 
    ? getQuizzesByLevel(currentLevel, locale as Locale) 
    : getQuizzes(locale as Locale);

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <Container className="py-12">
      <SectionHeading
        title={dict.quizzes?.title || 'Quizzes'}
        subtitle={dict.home?.quiz?.subtitle || 'Test your knowledge with our interactive quizzes.'}
        center
      />

      <div className="mt-8">
        <LevelTabs levels={levels} currentLevel={currentLevel} dict={dict} />
        
        {quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard 
                key={quiz.id} 
                quiz={quiz} 
                href={`/${locale}/quizzes/${quiz.id}`} 
                dict={dict}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-500">
            {dict.quizzes.noQuizzesFound}
          </div>
        )}
      </div>
    </Container>
  );
}
