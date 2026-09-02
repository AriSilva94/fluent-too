export type PublicationCount = { total: number; drafts: number };

export function countPublicationState(entries: { publishedAt?: string | null }[] | null): PublicationCount | null {
  if (!entries) return null;

  return {
    total: entries.length,
    drafts: entries.filter((entry) => !entry.publishedAt).length,
  };
}

export function fillSummary(template: string, count: PublicationCount | null): string | null {
  if (!count) return null;

  return template.replace("{total}", String(count.total)).replace("{drafts}", String(count.drafts));
}
