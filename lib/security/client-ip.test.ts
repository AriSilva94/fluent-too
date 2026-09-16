import { describe, expect, it } from "vitest";
import { buildClientIpHeaders, resolveRequestClientIp } from "./client-ip";

describe("IP do cliente", () => {
  it("prioriza o IP informado pelo Cloudflare", () => {
    const headers = new Headers({
      "cf-connecting-ip": "203.0.113.9",
      "x-forwarded-for": "1.1.1.1, 172.16.0.2",
    });

    expect(resolveRequestClientIp(headers)).toBe("203.0.113.9");
  });

  it("cai no primeiro X-Forwarded-For sem Cloudflare", () => {
    expect(resolveRequestClientIp(new Headers({ "x-forwarded-for": "198.51.100.3, 10.0.0.1" }))).toBe("198.51.100.3");
  });

  it("retorna nulo sem nenhum cabeçalho de IP", () => {
    expect(resolveRequestClientIp(new Headers())).toBeNull();
  });

  it("só repassa IP ao Strapi com segredo configurado", () => {
    expect(buildClientIpHeaders("203.0.113.9", "")).toEqual({});
    expect(buildClientIpHeaders(null, "segredo")).toEqual({});
    expect(buildClientIpHeaders("203.0.113.9", "segredo")).toEqual({
      "X-Fluent-Client-Ip": "203.0.113.9",
      "X-Fluent-Internal-Secret": "segredo",
    });
  });
});
