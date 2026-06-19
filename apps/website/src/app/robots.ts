import type { MetadataRoute } from "next";

// Static content — generate robots.txt once at build time.
export const dynamic = "force-static";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/dashboard", "/login", "/api", "/_next/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
