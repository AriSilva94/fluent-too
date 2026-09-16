import { describe, expect, it } from "vitest";
import {
  ACCESS_TOKEN_LIFESPAN_SECONDS,
  AUTH_COOKIE_NAMES,
  IDLE_REFRESH_TOKEN_LIFESPAN_SECONDS,
  buildAuthCookieOptions,
  buildCookieInstructions,
  buildClearCookieInstructions,
} from "./cookies";

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

  it("expira os cookies junto com os tempos de vida do Strapi", () => {
    const [access, refresh] = buildCookieInstructions({ accessToken: "a", refreshToken: "r" }, true);

    expect(ACCESS_TOKEN_LIFESPAN_SECONDS).toBe(600);
    expect(IDLE_REFRESH_TOKEN_LIFESPAN_SECONDS).toBe(1209600);
    expect(access.options.maxAge).toBe(ACCESS_TOKEN_LIFESPAN_SECONDS);
    expect(refresh.options.maxAge).toBe(IDLE_REFRESH_TOKEN_LIFESPAN_SECONDS);
  });

  it("usa SameSite=Lax nos dois cookies para sobreviver a navegacao vinda de outro site", () => {
    const [access, refresh] = buildCookieInstructions({ accessToken: "a", refreshToken: "r" }, true);
    expect(access.options.sameSite).toBe("lax");
    expect(refresh.options.sameSite).toBe("lax");
  });

  it("gera instrucoes para gravar e limpar tokens", () => {
    expect(buildCookieInstructions({ accessToken: "a", refreshToken: "r" }, true)).toHaveLength(2);
    expect(buildClearCookieInstructions()).toEqual([
      { name: AUTH_COOKIE_NAMES.access, value: "", options: expect.objectContaining({ maxAge: 0 }) },
      { name: AUTH_COOKIE_NAMES.refresh, value: "", options: expect.objectContaining({ maxAge: 0 }) },
    ]);
  });
});
