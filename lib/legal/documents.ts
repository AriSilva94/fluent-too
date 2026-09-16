import type { Locale } from "@/lib/i18n";
import { enUsLegal } from "./en-us";
import { frFrLegal } from "./fr-fr";
import { ptBrLegal } from "./pt-br";
import { LEGAL_CONTACT_EMAIL, type LegalDocument, type LegalDocumentKey, type LegalPack } from "./types";

const PACKS: Record<Locale, LegalPack> = {
  "pt-br": ptBrLegal,
  "en-us": enUsLegal,
  "fr-fr": frFrLegal,
};

export const LEGAL_PATH: Record<LegalDocumentKey, string> = {
  terms: "/terms",
  privacy: "/privacy",
};

export function getLegalDocument(locale: Locale, key: LegalDocumentKey): LegalDocument {
  const document = PACKS[locale][key];

  return {
    ...document,
    sections: document.sections.map((section) => ({
      ...section,
      body: section.body.map((paragraph) => paragraph.replaceAll("{email}", LEGAL_CONTACT_EMAIL)),
    })),
  };
}

export function legalHref(locale: Locale, key: LegalDocumentKey) {
  return `/${locale}${LEGAL_PATH[key]}`;
}
