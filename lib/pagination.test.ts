import { describe, expect, it } from "vitest";
import { paginate } from "./pagination";

const items = Array.from({ length: 20 }, (_, index) => index + 1);

describe("paginação de listas", () => {
  it("corta a página pedida e informa o intervalo", () => {
    const view = paginate(items, 2, 8);

    expect(view.rows).toEqual([9, 10, 11, 12, 13, 14, 15, 16]);
    expect(view).toMatchObject({ page: 2, pageCount: 3, from: 9, to: 16, total: 20 });
  });

  it("fecha a última página com o resto", () => {
    const view = paginate(items, 3, 8);

    expect(view.rows).toEqual([17, 18, 19, 20]);
    expect(view).toMatchObject({ from: 17, to: 20, pageCount: 3 });
  });

  it("prende a página dentro dos limites", () => {
    expect(paginate(items, 99, 8).page).toBe(3);
    expect(paginate(items, 0, 8).page).toBe(1);
    expect(paginate(items, Number.NaN, 8).page).toBe(1);
  });

  it("aguenta lista vazia", () => {
    const view = paginate([], 1, 8);

    expect(view).toMatchObject({ rows: [], page: 1, pageCount: 1, from: 0, to: 0, total: 0 });
  });
})
