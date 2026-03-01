import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/getDictionary';
import { isValidLocale, Locale } from '@/lib/i18n';
import Container from '@/components/ui/Container';
import { getQuizById, quizzes } from '@/lib/quizzes/data';
import QuizRenderer from '@/components/quiz/QuizRenderer';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { buildPageMetadata } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateStaticParams() {
  return quizzes.map((quiz) => ({
    locale:
      quiz.targetLanguage === 'pt' ? 'pt-br' : quiz.targetLanguage === 'en' ? 'en-us' : 'fr-fr',
    id: quiz.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isValidLocale(locale)) return {};

  const quiz = getQuizById(id, locale);
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
  const quiz = getQuizById(id, locale as Locale);

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

      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <span className="inline-block px-3 py-1 text-sm font-bold text-blue-600 bg-blue-50 rounded-full mb-4">
            Level {quiz.level}
          </span>
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">{quiz.title}</h1>
          <p className="text-neutral-600">{quiz.description}</p>
        </div>

        <div className="bg-neutral-50 p-6 md:p-8 rounded-2xl border border-neutral-200">
           <QuizRenderer quiz={quiz} dict={dict} />
        </div>
      </div>
    </Container>
  );
}
