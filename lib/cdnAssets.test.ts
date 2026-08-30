import { afterEach, describe, expect, it, vi } from "vitest";

describe("cdnAssets", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("monta URL absoluta usando a base publica de assets", async () => {
    vi.stubEnv("NEXT_PUBLIC_ASSET_BASE_URL", "https://cdn-dev.fluent-too.com/");
    vi.resetModules();

    const { assetUrl } = await import("./cdnAssets");

    expect(assetUrl("/assets/images/FOTO-BANNER-TOPO.webp")).toBe("https://cdn-dev.fluent-too.com/assets/images/FOTO-BANNER-TOPO.webp");
  });

  it("usa CDN de dev como fallback local", async () => {
    vi.stubEnv("NEXT_PUBLIC_ASSET_BASE_URL", "");
    vi.resetModules();

    const { assetUrl } = await import("./cdnAssets");

    expect(assetUrl("assets/images/LOGOTIPO-TOPO.webp")).toBe("https://cdn-dev.fluent-too.com/assets/images/LOGOTIPO-TOPO.webp");
  });
});
