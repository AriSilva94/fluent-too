import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("health route", () => {
  it("retorna status ok", async () => {
    const response = await GET();
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });
});
