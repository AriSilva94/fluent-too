import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "./seo";

describe("serializeJsonLd", () => {
  it("impede que texto do conteúdo feche a tag script", () => {
    const serialized = serializeJsonLd({ headline: '</script><img src=x onerror="alert(1)">' });

    expect(serialized).not.toContain("</script>");
    expect(serialized).not.toContain("<img");
    expect(JSON.parse(serialized)).toEqual({ headline: '</script><img src=x onerror="alert(1)">' });
  });
});
