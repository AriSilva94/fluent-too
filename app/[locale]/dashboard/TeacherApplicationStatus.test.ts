import { describe, expect, it } from "vitest";
import { resolveTeacherApplicationView } from "./TeacherApplicationStatus";
import type { ApplicationResult } from "@/lib/profile/client";

describe("resolveTeacherApplicationView", () => {
  it("mostra 'rejected' com o motivo quando a candidatura foi recusada", () => {
    const result: ApplicationResult = {
      ok: true,
      data: { status: "rejected", reviewNote: "Faltou comprovante de experiência.", createdAt: "2026-01-01T00:00:00.000Z" },
    };

    expect(resolveTeacherApplicationView(result)).toEqual({
      view: "rejected",
      reviewNote: "Faltou comprovante de experiência.",
    });
  });

  it("mostra 'rejected' sem motivo quando reviewNote é nulo", () => {
    const result: ApplicationResult = {
      ok: true,
      data: { status: "rejected", reviewNote: null, createdAt: "2026-01-01T00:00:00.000Z" },
    };

    expect(resolveTeacherApplicationView(result)).toEqual({ view: "rejected", reviewNote: null });
  });

  it("mostra 'pending' quando a candidatura está pendente", () => {
    const result: ApplicationResult = {
      ok: true,
      data: { status: "pending", reviewNote: null, createdAt: "2026-01-01T00:00:00.000Z" },
    };

    expect(resolveTeacherApplicationView(result)).toEqual({ view: "pending", reviewNote: null });
  });

  it("mostra 'pending' sem motivo quando a busca falha — errar para o lado seguro", () => {
    const result: ApplicationResult = { ok: false, error: "UNKNOWN_ERROR", status: 502 };

    expect(resolveTeacherApplicationView(result)).toEqual({ view: "pending", reviewNote: null });
  });

  it("mostra 'pending' quando não há candidatura registrada", () => {
    const result: ApplicationResult = { ok: true, data: null };

    expect(resolveTeacherApplicationView(result)).toEqual({ view: "pending", reviewNote: null });
  });

  it("mostra 'pending' quando a candidatura já foi aprovada", () => {
    const result: ApplicationResult = {
      ok: true,
      data: { status: "approved", reviewNote: null, createdAt: "2026-01-01T00:00:00.000Z" },
    };

    expect(resolveTeacherApplicationView(result)).toEqual({ view: "pending", reviewNote: null });
  });
});
