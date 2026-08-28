export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  author: string;
  readingTime: number;
  content: string;
  targetLanguage: "pt" | "en" | "fr";
  coverImage?: string;
};
