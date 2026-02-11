import { Locale } from "@/lib/i18n";

export const LEVELS = ["A1", "A2", "B1", "B2", "C1/C2"];
export type LevelDisplay = (typeof LEVELS)[number];

export const LEVEL_DESCRIPTIONS: Record<Locale, Record<string, string>> = {
  "pt-br": {
    "A1": "bem básico",
    "A2": "básico",
    "B1": "intermediário",
    "B2": "intermediário superior",
    "C1/C2": "avançado",
  },
  "en-us": {
    "A1": "very basic",
    "A2": "basic",
    "B1": "intermediate",
    "B2": "upper intermediate",
    "C1/C2": "advanced",
  },
  "fr-fr": {
    "A1": "très basique",
    "A2": "basique",
    "B1": "intermédiaire",
    "B2": "intermédiaire supérieur",
    "C1/C2": "avancé",
  },
};

export const BLOG_LABELS: Record<
  Locale,
  {
    featured: string;
    readMore: string;
    noPosts: string;
    readingTime: string;
  }
> = {
  "pt-br": {
    featured: "DESTAQUE",
    readMore: "LEIA MAIS",
    noPosts: "Nenhum post encontrado.",
    readingTime: "min de leitura",
  },
  "en-us": {
    featured: "FEATURED",
    readMore: "READ MORE",
    noPosts: "No posts found.",
    readingTime: "min read",
  },
  "fr-fr": {
    featured: "À LA UNE",
    readMore: "LIRE LA SUITE",
    noPosts: "Aucun article trouvé.",
    readingTime: "min de lecture",
  },
};

export const LEVEL_VISUALS: Record<
  LevelDisplay,
  { image: string; accent: string; surface: string }
> = {
  A1: {
    image: "/levels/a1.svg",
    accent: "from-[#ff8c42]/90 via-[#ffb347]/70 to-[#ffe3a3]/50",
    surface: "bg-[#fff7ed]",
  },
  A2: {
    image: "/levels/a2.svg",
    accent: "from-[#3b82f6]/90 via-[#60a5fa]/70 to-[#dbeafe]/55",
    surface: "bg-[#eff6ff]",
  },
  B1: {
    image: "/levels/b1.svg",
    accent: "from-[#8b5cf6]/90 via-[#a78bfa]/70 to-[#ede9fe]/55",
    surface: "bg-[#f5f3ff]",
  },
  B2: {
    image: "/levels/b2.svg",
    accent: "from-[#0f766e]/90 via-[#2dd4bf]/70 to-[#ccfbf1]/55",
    surface: "bg-[#f0fdfa]",
  },
  "C1/C2": {
    image: "/levels/c1-c2.svg",
    accent: "from-[#111827]/90 via-[#334155]/70 to-[#cbd5e1]/55",
    surface: "bg-[#f8fafc]",
  },
};
