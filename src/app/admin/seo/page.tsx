import { createClient } from "@/lib/supabase/server";
import SeoEditor, { type SeoEntry } from "@/components/admin/SeoEditor";

export default async function AdminSeo() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jhb_seo")
    .select("path, title, description, keywords, og_image")
    .order("path");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">
        SEO Management
      </h1>
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
      <SeoEditor entries={(data as SeoEntry[]) ?? []} />
    </div>
  );
}
