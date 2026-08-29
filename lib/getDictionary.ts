import type { Locale } from "./i18n";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  "pt-br": () => import("@/messages/pt-br.json").then((m) => m.default),
  "en-us": () => import("@/messages/en-us.json").then((m) => m.default),
  "fr-fr": () => import("@/messages/fr-fr.json").then((m) => m.default),
};

export type Dictionary = {
  nav: {
    home: string;
    resources: string;
    blog: string;
    student: string;
    schedule: string;
    contact: string;
    menuOpen: string;
    menuClose: string;
    mainMenu: string;
  };
  home: {
    hero: {
      titleLine1: string;
      titleLine2: string;
      accent: string;
      cta: string;
    };
    newsletter: {
      title: string;
      subtitle: string;
      nameLabel: string;
      namePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      submit: string;
    };
    blog: {
      title: string;
      viewAll: string;
    };
    quiz: {
      title: string;
      tabsLabel: string;
      panelLabel: string;
      subtitle: string;
    };
  };
  footer: {
    copyright: string;
  };
  about: {
    title: string;
  };
  blog: {
    title: string;
    backToBlog: string;
    postTitle: string;
    featured: string;
    readMore: string;
    noPosts: string;
    readingTime: string;
  };
  levels: Record<string, string>;
  quizzes: {
    title: string;
    backToQuizzes: string;
    quizTitle: string;
    submit: string;
    next: string;
    score: string;
    tryAgain: string;
    all: string;
    start: string;
    perfectScore: string;
    greatJob: string;
    goodEffort: string;
    resultSummary: string;
    correctAnswers: string;
    wrongAnswers: string;
    cardProgress: string;
    term: string;
    clickToFlip: string;
    meaning: string;
    didntKnow: string;
    knewIt: string;
    noQuizzesFound: string;
    saveSuccess: string;
    saveFailed: string;
    saveSignInTitle: string;
    saveSignInSubtitle: string;
    createAccount: string;
    signIn: string;
  };
  login: {
    title: string;
    subtitle: string;
    emailLabel: string;
    passwordLabel: string;
    submit: string;
    orContinueWith: string;
  };
  auth: {
    google: string;
    visualTitle: string;
    visualText: string;
    registerTitle: string;
    registerSubtitle: string;
    registerSubmit: string;
    registerLink: string;
    loginLink: string;
    forgotPassword: string;
    forgotTitle: string;
    forgotSubtitle: string;
    forgotSubmit: string;
    forgotSuccess: string;
    resetTitle: string;
    resetSubtitle: string;
    resetSubmit: string;
    resetMissingCode: string;
    emailConfirmationTitle: string;
    emailConfirmationSubtitle: string;
    resendConfirmation: string;
    emailConfirmedTitle: string;
    emailConfirmedSubtitle: string;
    changePasswordTitle: string;
    changePasswordSubtitle: string;
    currentPasswordLabel: string;
    newPasswordLabel: string;
    confirmPasswordLabel: string;
    changePasswordSubmit: string;
    changePasswordSuccess: string;
    logout: string;
    profileTitle: string;
    profileStudent: string;
    profileStudentHint: string;
    profileTeacher: string;
    profileTeacherHint: string;
    teacherBioLabel: string;
    teacherExperienceLabel: string;
    teacherLanguagesLabel: string;
    teacherCredentialLabel: string;
    teacherAttachmentLabel: string;
    teacherAttachmentHint: string;
    teacherSubmit: string;
    errors: Record<string, string>;
  };
  onboarding: {
    title: string;
    subtitle: string;
    studentCta: string;
    teacherCta: string;
  };
  dashboard: {
    title: string;
    welcome: string;
    recentActivity: string;
    noActivity: string;
    profileTitle: string;
    securityTitle: string;
    totalAttempts: string;
    averageScore: string;
    bestScore: string;
    continueStudying: string;
    teacherPendingTitle: string;
    teacherPendingText: string;
  };
  admin: {
    title: string;
    subtitle: string;
    teachersTitle: string;
    teachersEmpty: string;
    teachersLoadError: string;
    teachersFilterPending: string;
    teachersFilterApproved: string;
    teachersFilterRejected: string;
    teachersApprove: string;
    teachersReject: string;
    teachersRejectNoteLabel: string;
    teachersRejectNoteRequired: string;
    teachersAlreadyReviewed: string;
    teachersReviewError: string;
  };
  notFound: {
    badge: string;
    title: string;
    description: string;
    primaryAction: string;
    secondaryAction: string;
    hint: string;
  };
  metadata: {
    home: {
      title: string;
      description: string;
    };
    blog: {
      title: string;
      description: string;
    };
    quizzes: {
      title: string;
      description: string;
    };
  };
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
