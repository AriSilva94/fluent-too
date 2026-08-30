import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

describe("POST /api/quiz-attempts", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function makeRequest(cookie?: string, body?: unknown) {
    return new Request("http://localhost:3000/api/quiz-attempts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(cookie ? { cookie } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  it("devolve 401 sem accessToken", async () => {
    const response = await POST(makeRequest());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ ok: false });
  });

  it("devolve 403 PROFILE_REQUIRED para usuário unassigned", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes("/api/users/me")) {
        return new Response(
          JSON.stringify({ id: 1, email: "novo@fluenttoo.com", role: { id: 1, name: "Unassigned", type: "unassigned" } }),
          { status: 200 }
        );
      }
      throw new Error(`unexpected fetch call: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const request = makeRequest("fluent_too_access=access-token; fluent_too_refresh=refresh-token", { score: 100 });
    const response = await POST(request);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ ok: false, error: "PROFILE_REQUIRED" });
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining("/api/quiz-attempts"), expect.anything());
  });

  it("aplica os cookies renovados mesmo ao recusar por PROFILE_REQUIRED", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes("/api/users/me")) {
        const headers = new Headers(input instanceof Request ? input.headers : init?.headers);
        if (headers.get("Authorization") === "Bearer access-token") {
          return new Response(JSON.stringify({ error: { message: "Invalid token" } }), { status: 401 });
        }
        return new Response(
          JSON.stringify({ id: 1, email: "novo@fluenttoo.com", role: { id: 1, name: "Unassigned", type: "unassigned" } }),
          { status: 200 }
        );
      }
      if (url.includes("/api/auth/refresh")) {
        return new Response(JSON.stringify({ jwt: "new-access-token", refreshToken: "new-refresh-token" }), { status: 200 });
      }
      throw new Error(`unexpected fetch call: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const request = makeRequest("fluent_too_access=access-token; fluent_too_refresh=refresh-token", { score: 100 });
    const response = await POST(request);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ ok: false, error: "PROFILE_REQUIRED" });
    const setCookies = response.headers.getSetCookie();
    expect(setCookies.some((cookie) => cookie.startsWith("fluent_too_access=new-access-token"))).toBe(true);
    expect(setCookies.some((cookie) => cookie.startsWith("fluent_too_refresh=new-refresh-token"))).toBe(true);
  });

  it("devolve 403 PROFILE_REQUIRED para usuário com role null", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes("/api/users/me")) {
        return new Response(JSON.stringify({ id: 1, email: "sem-role@fluenttoo.com", role: null }), { status: 200 });
      }
      throw new Error(`unexpected fetch call: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const request = makeRequest("fluent_too_access=access-token; fluent_too_refresh=refresh-token", { score: 100 });
    const response = await POST(request);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ ok: false, error: "PROFILE_REQUIRED" });
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining("/api/quiz-attempts"), expect.anything());
  });

  it("salva a tentativa quando o usuário tem perfil de aluno", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes("/api/users/me")) {
        return new Response(
          JSON.stringify({ id: 1, email: "aluno@fluenttoo.com", role: { id: 2, name: "Student", type: "student" } }),
          { status: 200 }
        );
      }
      if (url.includes("/api/quiz-attempts")) {
        return new Response(JSON.stringify({ data: { id: 1 } }), { status: 200 });
      }
      throw new Error(`unexpected fetch call: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const request = makeRequest("fluent_too_access=access-token; fluent_too_refresh=refresh-token", { score: 100 });
    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
