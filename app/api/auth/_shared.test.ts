import { afterEach, describe, expect, it } from "vitest";
import { routeOptions } from "./_shared";

const previousSecure = process.env.AUTH_COOKIE_SECURE;

describe("auth api shared helpers", () => {
  afterEach(() => {
    if (previousSecure === undefined) {
      delete process.env.AUTH_COOKIE_SECURE;
    } else {
      process.env.AUTH_COOKIE_SECURE = previousSecure;
    }
  });

  it("desativa cookies seguros em localhost quando AUTH_COOKIE_SECURE nao foi configurado", () => {
    delete process.env.AUTH_COOKIE_SECURE;

    const options = routeOptions(new Request("http://localhost:3000/api/auth/login"));

    expect(options.secureCookies).toBe(false);
  });

  it("mantem cookies seguros em https quando AUTH_COOKIE_SECURE nao foi configurado", () => {
    delete process.env.AUTH_COOKIE_SECURE;

    const options = routeOptions(new Request("https://app.example.com/api/auth/login"));

    expect(options.secureCookies).toBe(true);
  });
});
