import type { MetadataRoute } from "next";

const SITE = "https://blog.jungwoonkwon.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/drafts",
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
