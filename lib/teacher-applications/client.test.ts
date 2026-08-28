import { describe, expect, it, vi } from "vitest";
import { createTeacherApplicationsClient } from "./client";

function fetcherReturning(body: unknown, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

describe("cliente de candidaturas", () => {
  it("lista filtrando por status com o token do admin", async () => {
    const fetcher = fetcherReturning({ data: [{ id: 1, status: "pending" }] });
    const client = createTeacherApplicationsClient({ baseUrl: "http://api", fetcher });

    const result = await client.list("token-admin", "pending");

    expect(result).toEqual([{ id: 1, status: "pending" }]);
    expect(fetcher).toHaveBeenCalledWith(
      "http://api/api/teacher-applications?status=pending",
      expect.objectContaining({ headers: { Authorization: "Bearer token-admin" } })
    );
  });

  it("devolve lista vazia quando a API falha", async () => {
    const client = createTeacherApplicationsClient({
      baseUrl: "http://api",
      fetcher: fetcherReturning({}, 500),
    });

    expect(await client.list("token-admin")).toEqual([]);
  });

  it("rejeita enviando a nota", async () => {
    const fetcher = fetcherReturning({ data: { id: 1, status: "rejected" } });
    const client = createTeacherApplicationsClient({ baseUrl: "http://api", fetcher });

    const result = await client.reject("token-admin", 1, "Sem comprovação");

    expect(result).toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledWith(
      "http://api/api/teacher-applications/1/reject",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ reviewNote: "Sem comprovação" }) })
    );
  });

  it("propaga conflito de candidatura já decidida", async () => {
    const client = createTeacherApplicationsClient({
      baseUrl: "http://api",
      fetcher: fetcherReturning({ error: { message: "ALREADY_REVIEWED" } }, 409),
    });

    expect(await client.approve("token-admin", 1)).toEqual({ ok: false, error: "ALREADY_REVIEWED" });
  });
});
