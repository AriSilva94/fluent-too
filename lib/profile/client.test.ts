import { describe, expect, it, vi } from "vitest";
import { createProfileClient } from "./client";

function fetcherReturning(body: unknown, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

describe("cliente de perfil", () => {
  it("torna o chamador estudante enviando o token", async () => {
    const fetcher = fetcherReturning({ data: { role: "student" } });
    const client = createProfileClient({ baseUrl: "http://api", fetcher });

    const result = await client.becomeStudent("token-aluno");

    expect(result).toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledWith(
      "http://api/api/profile/student",
      expect.objectContaining({
        method: "POST",
        headers: { Authorization: "Bearer token-aluno" },
      })
    );
  });

  it("recusa virar estudante quando o perfil já está definido", async () => {
    const client = createProfileClient({
      baseUrl: "http://api",
      fetcher: fetcherReturning({ error: { message: "PROFILE_ALREADY_SET" } }, 403),
    });

    expect(await client.becomeStudent("token-aluno")).toEqual({
      ok: false,
      error: "PROFILE_ALREADY_SET",
      status: 403,
    });
  });

  it("envia a candidatura de professor como FormData sem definir Content-Type", async () => {
    const fetcher = fetcherReturning({ data: { role: "teacher_pending" } });
    const client = createProfileClient({ baseUrl: "http://api", fetcher });
    const formData = new FormData();
    formData.append("bio", "Professor de inglês.");

    const result = await client.becomeTeacher("token-prof", formData);

    expect(result).toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledWith(
      "http://api/api/profile/teacher",
      expect.objectContaining({
        method: "POST",
        body: formData,
        headers: { Authorization: "Bearer token-prof" },
      })
    );
  });

  it("propaga candidatura duplicada", async () => {
    const client = createProfileClient({
      baseUrl: "http://api",
      fetcher: fetcherReturning({ error: { message: "TEACHER_APPLICATION_EXISTS" } }, 400),
    });

    expect(await client.becomeTeacher("token-prof", new FormData())).toEqual({
      ok: false,
      error: "TEACHER_APPLICATION_EXISTS",
      status: 400,
    });
  });

  it("devolve a candidatura do próprio usuário", async () => {
    const fetcher = fetcherReturning({ data: { status: "pending", reviewNote: null, createdAt: "2026-01-01" } });
    const client = createProfileClient({ baseUrl: "http://api", fetcher });

    const result = await client.myApplication("token-prof");

    expect(result).toEqual({ ok: true, data: { status: "pending", reviewNote: null, createdAt: "2026-01-01" } });
    expect(fetcher).toHaveBeenCalledWith(
      "http://api/api/profile/application",
      expect.objectContaining({ headers: { Authorization: "Bearer token-prof" } })
    );
  });

  it("devolve null quando não há candidatura", async () => {
    const client = createProfileClient({ baseUrl: "http://api", fetcher: fetcherReturning({ data: null }) });

    expect(await client.myApplication("token-prof")).toEqual({ ok: true, data: null });
  });

  it("não repassa mensagem de erro desconhecida do upstream", async () => {
    const client = createProfileClient({
      baseUrl: "http://api",
      fetcher: fetcherReturning({ error: { message: "<html>Bad Gateway</html>" } }, 502),
    });

    expect(await client.becomeStudent("token-aluno")).toEqual({
      ok: false,
      error: "UNKNOWN_ERROR",
      status: 502,
    });
  });

  it("sinaliza falha de rede sem lançar", async () => {
    const client = createProfileClient({
      baseUrl: "http://api",
      fetcher: async () => {
        throw new Error("rede fora");
      },
    });

    expect(await client.becomeStudent("token")).toEqual({ ok: false, error: "UNKNOWN_ERROR" });
    expect(await client.becomeTeacher("token", new FormData())).toEqual({ ok: false, error: "UNKNOWN_ERROR" });
    expect(await client.myApplication("token")).toEqual({ ok: false, error: "UNKNOWN_ERROR" });
  });
});
