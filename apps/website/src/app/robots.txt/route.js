// A literal Route Handler (rather than the app/robots.js metadata-route
// convention this replaces) so we can append the llms.txt AI-discovery lines —
// Next's typed MetadataRoute.Robots object only has fields for rules/sitemap/
// host, with no way to emit an arbitrary comment or bare URL line. Everything
// else below reproduces that previous output byte-for-byte.
export const dynamic = "force-static";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function GET() {
  const body = `User-Agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /dashboard
Disallow: /login
Disallow: /api

Host: ${BASE}
Sitemap: ${BASE}/sitemap.xml

# AI Discovery
# llms.txt
${BASE}/llms.txt
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
