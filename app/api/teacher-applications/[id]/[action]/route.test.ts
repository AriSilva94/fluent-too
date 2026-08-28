import { describe, expect, it } from "vitest";
import { parseReviewAction, validateRejectNote, POST } from "./route";

describe("parseReviewAction", () => {
  it("aceita approve e reject", () => {
    expect(parseReviewAction("approve")).toBe("approve");
    expect(parseReviewAction("reject")).toBe("reject");
  });

  it("rejeita qualquer outra ação", () => {
    expect(parseReviewAction("delete")).toBeNull();
    expect(parseReviewAction("")).toBeNull();
  });
});

describe("validateRejectNote", () => {
  it("exige uma nota não vazia", () => {
    expect(validateRejectNote(undefined)).toEqual({ ok: false, error: "REVIEW_NOTE_REQUIRED" });
    expect(validateRejectNote("")).toEqual({ ok: false, error: "REVIEW_NOTE_REQUIRED" });
    expect(validateRejectNote("   ")).toEqual({ ok: false, error: "REVIEW_NOTE_REQUIRED" });
  });

  it("aceita uma nota preenchida", () => {
    expect(validateRejectNote("Sem comprovação")).toEqual({ ok: true, note: "Sem comprovação" });
  });
});

describe("POST /api/teacher-applications/[id]/[action]", () => {
  function makeRequest(action: string, origin = "http://localhost:3000") {
    return new Request(`http://localhost:3000/api/teacher-applications/1/${action}`, {
      method: "POST",
      headers: { origin, "content-type": "application/json" },
      body: JSON.stringify({}),
    });
  }

  it("devolve 404 para uma ação desconhecida", async () => {
    const response = await POST(makeRequest("delete"), { params: Promise.resolve({ id: "1", action: "delete" }) });
    expect(response.status).toBe(404);
  });

  it("devolve 403 para origem não confiável", async () => {
    const response = await POST(makeRequest("approve", "http://evil.example"), {
      params: Promise.resolve({ id: "1", action: "approve" }),
    });
    expect(response.status).toBe(403);
  });

  it("devolve 401 sem accessToken", async () => {
    const response = await POST(makeRequest("approve"), { params: Promise.resolve({ id: "1", action: "approve" }) });
    expect(response.status).toBe(401);
  });
});
