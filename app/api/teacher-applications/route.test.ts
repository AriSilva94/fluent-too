import { describe, expect, it } from "vitest";
import { GET, parseStatusParam } from "./route";

describe("parseStatusParam", () => {
  it("aceita status válidos", () => {
    expect(parseStatusParam("pending")).toBe("pending");
    expect(parseStatusParam("approved")).toBe("approved");
    expect(parseStatusParam("rejected")).toBe("rejected");
  });

  it("ignora valores inválidos ou ausentes", () => {
    expect(parseStatusParam("bogus")).toBeUndefined();
    expect(parseStatusParam(null)).toBeUndefined();
  });
});

describe("GET /api/teacher-applications", () => {
  it("recusa sem accessToken com 401", async () => {
    const request = new Request("http://localhost/api/teacher-applications");
    const response = await GET(request);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ ok: false, data: [] });
  });
});
