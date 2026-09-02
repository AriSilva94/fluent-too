export const DEFAULT_PAGE_SIZE = 10;

export type PageView<T> = {
  rows: T[];
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
};

export function paginate<T>(items: T[], page: number, pageSize: number = DEFAULT_PAGE_SIZE): PageView<T> {
  const size = Math.max(1, Math.trunc(pageSize));
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / size));
  const current = clamp(page, 1, pageCount);
  const start = (current - 1) * size;
  const rows = items.slice(start, start + size);

  return {
    rows,
    page: current,
    pageCount,
    total,
    from: total === 0 ? 0 : start + 1,
    to: start + rows.length,
  };
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(Math.trunc(value), min), max);
}
