import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDictionary } from "@/lib/getDictionary";
import { isValidLocale, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";
import { AUTH_COOKIE_NAMES } from "@/lib/auth/cookies";
import { createStrapiClient } from "@/lib/auth/strapi-client";
import { isAnonymousSession, resolveSession, wasSessionRefreshed } from "@/lib/auth/session";
import { createQuizAttemptsClient } from "@/lib/quiz-attempts/client";
import { createProfileClient } from "@/lib/profile/client";
import { createTeacherReachClient } from "@/lib/teacher/reach-client";
import { canCreateContent, hasProfile, isPendingTeacher } from "@/lib/auth/roles";
import { accountDisplayName } from "@/lib/auth/display-name";
import { recommendQuizzes, summarizeAttempts } from "@/lib/dashboard/study-progress";
import { getQuizzes } from "@/lib/quizzes/data";
import DashboardAdminActions from "./DashboardAdminActions";
import DashboardTeacherActions from "./DashboardTeacherActions";
import StudentBody from "./StudentBody";
import StudySnapshot from "./StudySnapshot";
import TeacherApplicationStatus from "./TeacherApplicationStatus";
import { resolveTeacherApplicationView } from "./teacher-application-view";

const dashboardDescriptions: Record<Locale, string> = {
  "pt-br": "Painel do aluno na Fluent Too com progresso, atividades e dados privados.",
  "en-us": "Student dashboard on Fluent Too with progress, activity, and private account data.",
  "fr-fr": "Tableau de bord élève sur Fluent Too avec progression, activité et données privées.",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  const dict = await getDictionary(locale);
  return buildPageMetadata({
    locale,
    pathname: "/dashboard",
    title: `${dict.dashboard.title} | Fluent Too`,
    description: dashboardDescriptions[locale],
    index: false,
  });
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const cookieStore = await cookies();
  const session = await resolveSession(
    {
      accessToken: cookieStore.get(AUTH_COOKIE_NAMES.access)?.value,
      refreshToken: cookieStore.get(AUTH_COOKIE_NAMES.refresh)?.value,
    },
    createStrapiClient()
  );

  if (isAnonymousSession(session)) redirect(`/${locale}/login?returnTo=/${locale}/dashboard`);
  if (!hasProfile(session.user.role?.type)) redirect(`/${locale}/onboarding`);

  const user = session.user;
  const role = user.role?.type;
  const accessToken = wasSessionRefreshed(session)
    ? session.tokens.accessToken
    : cookieStore.get(AUTH_COOKIE_NAMES.access)?.value;

  const [attempts, catalogue, reach] = await Promise.all([
    accessToken ? createQuizAttemptsClient().list(accessToken) : Promise.resolve({ ok: false as const, data: [] }),
    getQuizzes().catch(() => []),
    accessToken && canCreateContent(role) ? createTeacherReachClient().get(accessToken) : Promise.resolve(null),
  ]);

  const summary = summarizeAttempts(attempts.data);
  const recommended = recommendQuizzes(catalogue, summary, 3);

  const teacherApplicationView = isPendingTeacher(role)
    ? resolveTeacherApplicationView(
        accessToken ? await createProfileClient().myApplication(accessToken) : { ok: false, error: "UNKNOWN_ERROR" }
      )
    : null;

  return (
    <div className="flex flex-1 flex-col bg-[linear-gradient(180deg,#fff7f1_0%,#ffffff_42%,#eef5ff_100%)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
        {teacherApplicationView && (
          <TeacherApplicationStatus dict={dict} view={teacherApplicationView.view} reviewNote={teacherApplicationView.reviewNote} />
        )}

        <StudySnapshot dict={dict} locale={locale as Locale} name={accountDisplayName(user)} summary={summary} />

        <DashboardTeacherActions
          locale={locale as Locale}
          role={role}
          reach={reach}
          labels={{
            title: dict.dashboard.teacherAreaTitle,
            subtitle: dict.teacher.subtitle,
            cta: dict.dashboard.teacherAreaCta,
            reachTitle: dict.dashboard.teacherReachTitle,
            reachAttempts: dict.dashboard.teacherReachAttempts,
            reachLearners: dict.dashboard.teacherReachLearners,
            reachAverage: dict.dashboard.teacherReachAverage,
            reachTop: dict.dashboard.teacherReachTop,
            reachEmpty: dict.dashboard.teacherReachEmpty,
          }}
        />

        <DashboardAdminActions
          locale={locale as Locale}
          role={role}
          labels={{
            title: dict.admin.title,
            subtitle: dict.admin.hubSubtitle,
            hubCta: dict.admin.hubCta,
            quizzesTitle: dict.admin.quizzesTitle,
            blogTitle: dict.admin.blogTitle,
            teachersTitle: dict.admin.teachersTitle,
          }}
        />

        <StudentBody
          dict={dict}
          locale={locale as Locale}
          summary={summary}
          attempts={attempts.data}
          recommended={recommended}
        />
      </div>
    </div>
  );
}
