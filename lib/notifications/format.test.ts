import { describe, expect, it } from "vitest";
import { badgeCount, interpolate, relativeTime } from "./format";

const now = new Date("2026-08-31T12:00:00.000Z");

describe("interpolação", () => {
  it("substitui os campos presentes", () => {
    expect(interpolate("{name} respondeu {quizTitle}", { name: "Ana", quizTitle: "Verbos" })).toBe("Ana respondeu Verbos");
  });

  it("mantém o marcador quando o dado falta", () => {
    expect(interpolate("{name} entrou", { name: null })).toBe("{name} entrou");
  });

  it("aceita número", () => {
    expect(interpolate("{score}%", { score: 80 })).toBe("80%");
  });
});

describe("tempo relativo", () => {
  it("usa o rótulo de agora abaixo de um minuto", () => {
    expect(relativeTime("2026-08-31T11:59:30.000Z", "pt-br", { now, justNow: "agora" })).toBe("agora");
  });

  it("conta minutos, horas e dias", () => {
    expect(relativeTime("2026-08-31T11:30:00.000Z", "pt-br", { now })).toBe("há 30 min.");
    expect(relativeTime("2026-08-31T09:00:00.000Z", "pt-br", { now })).toBe("há 3 h");
    expect(relativeTime("2026-08-29T12:00:00.000Z", "pt-br", { now })).toBe("há 2 dias");
  });

  it("vira data a partir de uma semana", () => {
    expect(relativeTime("2026-08-01T12:00:00.000Z", "en-us", { now })).toBe("Aug 1");
  });

  it("devolve vazio para data inválida", () => {
    expect(relativeTime("quando der", "pt-br", { now })).toBe("");
  });
});

describe("contador do sino", () => {
  it("some quando não há nada", () => {
    expect(badgeCount(0)).toBe("");
  });

  it("limita o número exibido", () => {
    expect(badgeCount(3)).toBe("3");
    expect(badgeCount(42)).toBe("9+");
  });
});
