import { createClient } from "@jhb/shared/supabase/server";
import SeoEditor, { type SeoEntry } from "@/components/SeoEditor";
import HomeSeoEditor, { type HomeSeo } from "@/components/HomeSeoEditor";

// Other pages whose meta is driven by jhb_seo (Home has its own rich editor).
const OTHER_PATHS = ["/services", "/blog"];
const PATH_LABELS: Record<string, string> = {
  "/services": "Services listing",
  "/blog": "Blog listing",
};

const FULL_COLS =
  "path, title, meta_title, description, keywords, canonical, og_title, og_description, og_image, robots, structured_data, seo_content, slug";

const emptyEntry = (path: string): SeoEntry => ({
  path,
  title: null,
  description: null,
  keywords: null,
  og_image: null,
});

const emptyHome = (): HomeSeo => ({
  path: "/",
  title: null,
  meta_title: null,
  description: null,
  keywords: null,
  canonical: null,
  og_title: null,
  og_description: null,
  og_image: null,
  robots: null,
  structured_data: null,
  seo_content: null,
  slug: "/",
});

export default async function AdminSeo() {
  const supabase = await createClient();

  // (1) Simple cards — basic columns, always works even before the migration.
  const { data: basic } = await supabase
    .from("jhb_seo")
    .select("path, title, description, keywords, og_image")
    .order("path");

  // (2) Home row — full columns; errors gracefully if the migration isn't run.
  const { data: homeRow, error: homeErr } = await supabase
    .from("jhb_seo")
    .select(FULL_COLS)
    .eq("path", "/")
    .maybeSingle();
  if (homeErr) console.error("[seo] home load failed:", homeErr.message);

  const home = (homeRow as HomeSeo) ?? emptyHome();
  const rows = (basic as SeoEntry[]) ?? [];
  const byPath = new Map(rows.map((r) => [r.path, r]));
  const known = OTHER_PATHS.map((p) => byPath.get(p) ?? emptyEntry(p));
  const extra = rows.filter((r) => r.path !== "/" && !OTHER_PATHS.includes(r.path));
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

      <HomeSeoEditor entry={home} loadError={homeErr?.message ?? null} />

      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold">Other pages</h2>
        <SeoEditor entries={entries} labels={PATH_LABELS} loadError={null} />
      </div>
    </div>
  );
}
