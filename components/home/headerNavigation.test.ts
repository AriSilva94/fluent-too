import { describe, expect, it } from "vitest";
import { buildHomeAnchorHref, shouldHandleHomeAnchorScroll } from "./headerNavigation";

describe("header navigation", () => {
  it("cria href absoluto para ancora da home com locale", () => {
    expect(buildHomeAnchorHref("pt-br", "#recursos")).toBe("/pt-br/#recursos");
  });

  it("cria href da home para inicio", () => {
    expect(buildHomeAnchorHref("pt-br", "#inicio")).toBe("/pt-br/");
  });

  it("faz scroll suave somente quando ja esta na home do mesmo locale", () => {
    expect(shouldHandleHomeAnchorScroll("/pt-br", "pt-br")).toBe(true);
    expect(shouldHandleHomeAnchorScroll("/pt-br/", "pt-br")).toBe(true);
    expect(shouldHandleHomeAnchorScroll("/pt-br/dashboard", "pt-br")).toBe(false);
    expect(shouldHandleHomeAnchorScroll("/en-us", "pt-br")).toBe(false);
  });
});
