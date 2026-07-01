import { cache } from "react";
import { createClient } from "./supabase/server";
import type { MediaImage, MediaLibraryItem } from "./media";

const IMG_COLS =
  "id, name, path, url, mime, size, alt_text, image_title, image_caption, image_description, image_keywords, image_filename, og_title, og_description, alt_updated_at, updated_at, created_at";

// Public: URL → alt_text map used to render DB-driven alt on the website.
// cache(): rendered by every page with images (home, blog, …) — dedupe per request.
export const getMediaAltMap = cache(async (): Promise<Record<string, string>> => {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_media")
      .select("url, alt_text")
      .not("alt_text", "is", null);
    const map: Record<string, string> = {};
    for (const row of (data ?? []) as { url: string; alt_text: string | null }[]) {
      const a = (row.alt_text ?? "").trim();
      if (a) map[row.url] = a;
    }
    return map;
  } catch {
    return {};
  }
});

// Public: URL → image_title map used to render the img title attribute.
export const getMediaTitleMap = cache(async (): Promise<Record<string, string>> => {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_media")
      .select("url, image_title")
      .not("image_title", "is", null);
    const map: Record<string, string> = {};
    for (const row of (data ?? []) as { url: string; image_title: string | null }[]) {
      const t = (row.image_title ?? "").trim();
      if (t) map[row.url] = t;
    }
    return map;
  } catch {
    return {};
  }
});

// Admin: all image media for the Image SEO management screen.
export async function getImageMedia(): Promise<MediaImage[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_media")
      .select(IMG_COLS)
      .like("mime", "image/%")
      .order("created_at", { ascending: false });
    return (data as MediaImage[]) ?? [];
  } catch {
    return [];
  }
}

// Admin: full Media Library — images + where each is used across the site.
// "Used in" is computed generically: every content source is reduced to a chunk
// of text (its raw value or JSON), and an image is "used" by that source if its
// public URL appears in it. This catches embedded blog images, hero/founder/about
// images, service & product images, logos, etc. without hardcoding every field.
export async function getMediaLibrary(): Promise<MediaLibraryItem[]> {
  try {
    const supabase = await createClient();
    const [media, posts, home, content, services, tts, logos, settings] = await Promise.all([
      supabase.from("jhb_media").select(IMG_COLS).like("mime", "image/%").order("created_at", { ascending: false }),
      supabase.from("jhb_posts").select("cover_image, content_html"),
      supabase.from("jhb_home").select("data"),
      supabase.from("jhb_content").select("key, data"),
      supabase.from("jhb_services").select("*"),
      supabase.from("jhb_testimonials").select("photo_url"),
      supabase.from("jhb_client_logos").select("data"),
      supabase.from("jhb_settings").select("key, data"),
    ]);

    // Labelled text blobs in which an image URL may appear.
    const sources: { label: string; text: string }[] = [];
    const push = (label: string, v: unknown) => {
      if (v == null) return;
      const text = typeof v === "string" ? v : JSON.stringify(v);
      if (text) sources.push({ label, text });
    };

    for (const p of (posts.data ?? []) as { cover_image: string | null; content_html: string | null }[]) {
      push("Blog", p.cover_image); // featured / cover image
      push("Blog Article", p.content_html); // images embedded in the article body
    }
    for (const h of (home.data ?? []) as { data: unknown }[]) push("Home", h.data);
    for (const c of (content.data ?? []) as { key: string; data: unknown }[]) {
      const key = (c.key || "").toLowerCase();
      if (key.includes("about")) push("About", c.data);
      else if (key.includes("product")) {
        // Split JHB Products vs Vasool per product item.
        const items = (c.data as { items?: { slug?: string }[] } | null)?.items ?? [];
        for (const it of items) push(it.slug === "vasool-app" ? "Vasool" : "JHB Products", it);
        if (items.length === 0) push("JHB Products", c.data);
      } else if (key.includes("tool")) push("JHB Products", c.data);
      else if (key.includes("partner")) push("Home", c.data);
      else push("Other", c.data);
    }
    push("Services", services.data);
    for (const t of (tts.data ?? []) as { photo_url: string | null }[]) push("Testimonials", t.photo_url);
    for (const l of (logos.data ?? []) as { data: unknown }[]) push("Logos", l.data);
    for (const s of (settings.data ?? []) as { data: unknown }[]) push("Logos", s.data); // branding logos / favicon

    return ((media.data as MediaImage[]) ?? []).map((m) => {
      const labels = new Set<string>();
      for (const s of sources) if (s.text.includes(m.url)) labels.add(s.label);
      return { ...m, used_in: labels.size ? Array.from(labels).join(", ") : "Unused" };
    });
  } catch {
    return [];
  }
}

// Optional "require alt text" setting (stored in jhb_settings under key 'image_seo').
export async function getImageSeoSettings(): Promise<{ requireAlt: boolean }> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_settings")
      .select("data")
      .eq("key", "image_seo")
      .maybeSingle();
    return { requireAlt: !!(data?.data as { requireAlt?: boolean } | null)?.requireAlt };
  } catch {
    return { requireAlt: false };
  }
}
