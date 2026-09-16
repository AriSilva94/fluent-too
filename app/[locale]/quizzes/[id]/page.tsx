import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/getDictionary';
import { isValidLocale, Locale } from '@/lib/i18n';
import Container from '@/components/ui/Container';
import { getQuizById } from '@/lib/quizzes/data';
import QuizRenderer from '@/components/quiz/QuizRenderer';
import QuizStage from '@/components/quiz/QuizStage';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { buildPageMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isValidLocale(locale)) return {};

  const quiz = await getQuizById(id);
  if (!quiz) return {};

  return buildPageMetadata({
    locale,
    pathname: `/quizzes/${quiz.id}`,
    title: `${quiz.title} | Fluent Too`,
    description: quiz.description,
  });
}

export default async function QuizDetailPage({ params }: Props) {
  const { locale, id } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const quiz = await getQuizById(id);

  if (!quiz) {
    notFound();
  }

  return (
    <Container className="py-12">
      <div className="mb-8">
        <Link href={`/${locale}/quizzes`}>
            <Button variant="outline" size="sm">
            {dict.quizzes?.backToQuizzes || '← Back to quizzes'}
            </Button>
        </Link>
      </div>

      <QuizStage title={quiz.title} description={quiz.description} level={quiz.level} dict={dict}>
        <QuizRenderer quiz={quiz} dict={dict} locale={locale as Locale} />
      </QuizStage>
    </Container>
  );
}
