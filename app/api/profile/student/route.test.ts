import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

describe("POST /api/profile/student", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function makeRequest(origin = "http://localhost:3000", cookie?: string) {
    return new Request("http://localhost:3000/api/profile/student", {
      method: "POST",
      headers: {
        origin,
        ...(cookie ? { cookie } : {}),
      },
    });
  }

  it("devolve 403 para origem não confiável", async () => {
    const response = await POST(makeRequest("http://evil.example"));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ ok: false, error: "INVALID_ORIGIN" });
  });

  it("devolve 401 sem accessToken", async () => {
    const response = await POST(makeRequest());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ ok: false, error: "UNAUTHORIZED" });
  });

  it("repassa o token de acesso ao backend e devolve sucesso", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes("/api/users/me")) {
        return new Response(
          JSON.stringify({ id: 1, email: "aluno@fluenttoo.com", role: { id: 1, name: "Unassigned", type: "unassigned" } }),
          { status: 200 }
        );
      }
      if (url.includes("/api/profile/student")) {
        return new Response(JSON.stringify({ data: { role: "student" } }), { status: 200 });
      }
      throw new Error(`unexpected fetch call: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const request = makeRequest("http://localhost:3000", "fluent_too_access=access-token; fluent_too_refresh=refresh-token");
    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/profile/student"),
      expect.objectContaining({ headers: { Authorization: "Bearer access-token" } })
    );
  });
});
