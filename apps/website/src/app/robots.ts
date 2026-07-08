import type { MetadataRoute } from "next";

// Static content — generate robots.txt once at build time.
export const dynamic = "force-static";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Note: do NOT disallow /_next/ — it holds the site's CSS/JS bundles, and
      // blocking them stops Googlebot from rendering pages (Google explicitly
      // advises keeping render-critical resources crawlable).
      disallow: ["/admin", "/admin/", "/dashboard", "/login", "/api"],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
