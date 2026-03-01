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
  };
  login: {
    title: string;
    subtitle: string;
    emailLabel: string;
    passwordLabel: string;
    submit: string;
    orContinueWith: string;
  };
  dashboard: {
    title: string;
    welcome: string;
    recentActivity: string;
  };
  admin: {
    title: string;
    subtitle: string;
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
