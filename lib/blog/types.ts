export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  author: string;
  readingTime: number;
  // Ausente nas listagens (a busca só pede `content` pra abrir o post individual).
  content?: string;
  targetLanguage: "pt" | "en" | "fr";
  coverImage?: string;
};
