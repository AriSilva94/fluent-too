import { afterEach, describe, expect, it, vi } from "vitest";
import { parseApplicationId, parseReviewAction, validateRejectNote, POST } from "./route";

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

describe("parseApplicationId", () => {
  it("aceita inteiros positivos", () => {
    expect(parseApplicationId("1")).toBe(1);
    expect(parseApplicationId("42")).toBe(42);
  });

  it("rejeita valores não numéricos, zero, negativos e não inteiros", () => {
    expect(parseApplicationId("NaN")).toBeNull();
    expect(parseApplicationId("abc")).toBeNull();
    expect(parseApplicationId("0")).toBeNull();
    expect(parseApplicationId("-1")).toBeNull();
    expect(parseApplicationId("1.5")).toBeNull();
    expect(parseApplicationId("")).toBeNull();
  });
});

describe("POST /api/teacher-applications/[id]/[action]", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function makeRequest(action: string, id = "1", origin = "http://localhost:3000") {
    return new Request(`http://localhost:3000/api/teacher-applications/${id}/${action}`, {
      method: "POST",
      headers: { origin, "content-type": "application/json" },
      body: JSON.stringify({}),
    });
  }

  function makeAuthenticatedRequest(action: string, id: string) {
    return new Request(`http://localhost:3000/api/teacher-applications/${id}/${action}`, {
      method: "POST",
      headers: {
        origin: "http://localhost:3000",
        "content-type": "application/json",
        cookie: "fluent_too_access=access-token; fluent_too_refresh=refresh-token",
      },
      body: JSON.stringify({}),
    });
  }

  it("devolve 404 para uma ação desconhecida", async () => {
    const response = await POST(makeRequest("delete"), { params: Promise.resolve({ id: "1", action: "delete" }) });
    expect(response.status).toBe(404);
  });

  it("devolve 403 para origem não confiável", async () => {
    const response = await POST(makeRequest("approve", "1", "http://evil.example"), {
      params: Promise.resolve({ id: "1", action: "approve" }),
    });
    expect(response.status).toBe(403);
  });

  it("devolve 401 sem accessToken", async () => {
    const response = await POST(makeRequest("approve"), { params: Promise.resolve({ id: "1", action: "approve" }) });
    expect(response.status).toBe(401);
  });

  it("devolve 400 para um id inválido, sem chamar o backend", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes("/api/users/me")) {
        return new Response(
          JSON.stringify({ id: 1, email: "admin@fluenttoo.com", role: { id: 1, name: "App Admin", type: "app_admin" } }),
          { status: 200 }
        );
      }
      throw new Error(`unexpected fetch call: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(makeAuthenticatedRequest("approve", "not-a-number"), {
      params: Promise.resolve({ id: "not-a-number", action: "approve" }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false, error: "INVALID_ID" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
