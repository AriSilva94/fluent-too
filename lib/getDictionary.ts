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
      viewAll: string;
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
    saveProfileRequired: string;
    saveProfileRequiredCta: string;
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
    studentConfirmText: string;
    studentConfirmCta: string;
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
    teacherRejectedTitle: string;
    teacherRejectedText: string;
    teacherRejectedCta: string;
    teacherAreaTitle: string;
    teacherAreaCta: string;
  };
  teacher: {
    title: string;
    subtitle: string;
    empty: string;
    loadError: string;
    newQuiz: string;
    editQuiz: string;
    statusPublished: string;
    statusDraft: string;
    fieldTitle: string;
    fieldDescription: string;
    fieldLanguage: string;
    fieldLevel: string;
    fieldType: string;
    fieldMinutes: string;
    fieldPublic: string;
    fieldPublicHint: string;
    typeMultipleChoice: string;
    typeFillGap: string;
    typeFlashcard: string;
    questions: string;
    addQuestion: string;
    removeQuestion: string;
    questionNumber: string;
    questionText: string;
    options: string;
    addOption: string;
    removeOption: string;
    correctAnswer: string;
    gapParts: string;
    gapPartsHint: string;
    gapAnswers: string;
    cardFront: string;
    cardBack: string;
    save: string;
    saving: string;
    cancel: string;
    delete: string;
    deleteConfirmTitle: string;
    deleteConfirmText: string;
    deleteConfirmCta: string;
    saved: string;
    noLanguages: string;
    errors: Record<string, string>;
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
    teachersApproveConfirmTitle: string;
    teachersApproveConfirmText: string;
    teachersApproveConfirmCta: string;
    teachersRejectConfirmTitle: string;
    teachersRejectConfirmText: string;
    teachersRejectConfirmCta: string;
    cancel: string;
    hubSubtitle: string;
    quizzesTitle: string;
    quizzesSubtitle: string;
    quizzesEmpty: string;
    quizzesLoadError: string;
    publish: string;
    unpublish: string;
    moderationError: string;
    filterAllLanguages: string;
    blogTitle: string;
    blogSubtitle: string;
    blogEmpty: string;
    blogLoadError: string;
    blogNew: string;
    blogFieldTitle: string;
    blogFieldSlug: string;
    blogFieldCategory: string;
    blogFieldExcerpt: string;
    blogFieldContent: string;
    blogFieldDate: string;
    blogFieldAuthor: string;
    blogFieldReadingTime: string;
    blogFieldLanguage: string;
    blogDeleteConfirmTitle: string;
    blogDeleteConfirmText: string;
    blogDeleteConfirmCta: string;
    blogSaved: string;
    save: string;
    saving: string;
    edit: string;
    delete: string;
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
  studyLanguage: {
    legend: string;
    all: string;
  };
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
