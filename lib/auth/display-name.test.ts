import { describe, expect, it } from "vitest";
import { accountDisplayName } from "./display-name";

describe("nome de exibição da conta", () => {
  it("usa o username quando ele não é um e-mail", () => {
    expect(accountDisplayName({ username: "ana", email: "ana@x.com" })).toBe("ana");
  });

  it("corta o domínio quando o username é o próprio e-mail", () => {
    expect(accountDisplayName({ username: "prof@fluent.local", email: "prof@fluent.local" })).toBe("prof");
  });

  it("cai para o e-mail quando não há username", () => {
    expect(accountDisplayName({ email: "bruno.silva@x.com" })).toBe("bruno.silva");
  });

  it("devolve vazio sem dados", () => {
    expect(accountDisplayName({})).toBe("");
  });
});
