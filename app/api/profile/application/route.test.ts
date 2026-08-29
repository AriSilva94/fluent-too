import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

describe("GET /api/profile/application", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function makeRequest(cookie?: string) {
    return new Request("http://localhost:3000/api/profile/application", {
      headers: cookie ? { cookie } : {},
    });
  }

  it("devolve 401 sem accessToken", async () => {
    const response = await GET(makeRequest());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ ok: false, data: null });
  });

  it("repassa o token de acesso ao backend e devolve a candidatura do usuário", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes("/api/users/me")) {
        return new Response(
          JSON.stringify({ id: 1, email: "prof@fluenttoo.com", role: { id: 1, name: "Teacher Pending", type: "teacher_pending" } }),
          { status: 200 }
        );
      }
      if (url.includes("/api/profile/application")) {
        return new Response(
          JSON.stringify({ data: { status: "pending", reviewNote: null, createdAt: "2026-01-01" } }),
          { status: 200 }
        );
      }
      throw new Error(`unexpected fetch call: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const request = makeRequest("fluent_too_access=access-token; fluent_too_refresh=refresh-token");
    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: { status: "pending", reviewNote: null, createdAt: "2026-01-01" },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/profile/application"),
      expect.objectContaining({ headers: { Authorization: "Bearer access-token" } })
    );
  });
});
