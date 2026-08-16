import { describe, expect, it } from "vitest";
import { AUTH_COOKIE_NAMES, buildAuthCookieOptions, buildCookieInstructions, buildClearCookieInstructions } from "./cookies";

describe("cookies", () => {
  it("constroi cookies HttpOnly seguros", () => {
    expect(buildAuthCookieOptions(600, true)).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 600,
    });
  });

  it("gera instrucoes para gravar e limpar tokens", () => {
    expect(buildCookieInstructions({ accessToken: "a", refreshToken: "r" }, true)).toHaveLength(2);
    expect(buildClearCookieInstructions()).toEqual([
      { name: AUTH_COOKIE_NAMES.access, value: "", options: expect.objectContaining({ maxAge: 0 }) },
      { name: AUTH_COOKIE_NAMES.refresh, value: "", options: expect.objectContaining({ maxAge: 0 }) },
    ]);
  });
});
