export type LegalSection = {
  heading: string;
  body: string[];
};

export type LegalDocument = {
  title: string;
  summary: string;
  sections: LegalSection[];
};

export type LegalPack = {
  terms: LegalDocument;
  privacy: LegalDocument;
};

export const LEGAL_DOCUMENT = { terms: "terms", privacy: "privacy" } as const;

export type LegalDocumentKey = (typeof LEGAL_DOCUMENT)[keyof typeof LEGAL_DOCUMENT];

export const LEGAL_CONTACT_EMAIL = "contato@fluent-too.com";

export const LEGAL_UPDATED_AT = "2026-09-02";
