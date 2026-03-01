import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/login", "/pt-br/admin", "/pt-br/dashboard", "/pt-br/login", "/en-us/admin", "/en-us/dashboard", "/en-us/login", "/fr-fr/admin", "/fr-fr/dashboard", "/fr-fr/login"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
