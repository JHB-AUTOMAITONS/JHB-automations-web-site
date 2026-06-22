import { createClient } from "@jhb/shared/supabase/server";
import SeoEditor, { type SeoEntry } from "@/components/SeoEditor";

// Pages whose <title>/meta is driven by jhb_seo (via buildMetadata). These are
// always shown in the editor — pre-filled if a row exists, empty otherwise — so
// SEO can be set even before any row exists (the table starts empty).
const SEO_PATHS = ["/", "/services", "/blog"];
const PATH_LABELS: Record<string, string> = {
  "/": "Home page",
  "/services": "Services listing",
  "/blog": "Blog listing",
};

const emptyEntry = (path: string): SeoEntry => ({
  path,
  title: null,
  description: null,
  keywords: null,
  og_image: null,
});

export default async function AdminSeo() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jhb_seo")
    .select("path, title, description, keywords, og_image")
    .order("path");

  if (error) console.error("[seo] load failed:", error.message);

  const rows = (data as SeoEntry[]) ?? [];
  const byPath = new Map(rows.map((r) => [r.path, r]));
  // Always include the SEO-driven pages (default entries), then any other rows.
  const known = SEO_PATHS.map((p) => byPath.get(p) ?? emptyEntry(p));
  const extra = rows.filter((r) => !SEO_PATHS.includes(r.path));
  const entries = [...known, ...extra];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">SEO Management</h1>
      <p className="mt-1 text-sm text-muted">
        Page titles, meta descriptions, keywords and Open Graph images. A{" "}
        <a href="/sitemap.xml" target="_blank" className="text-primary underline">
          sitemap.xml
        </a>{" "}
        and{" "}
        <a href="/robots.txt" target="_blank" className="text-primary underline">
          robots.txt
        </a>{" "}
        are generated automatically.
      </p>
      <SeoEditor
        entries={entries}
        labels={PATH_LABELS}
        loadError={error?.message ?? null}
      />
    </div>
  );
}
