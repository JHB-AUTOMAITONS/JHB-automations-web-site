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
export async function getMediaLibrary(): Promise<MediaLibraryItem[]> {
  try {
    const supabase = await createClient();
    const [media, posts, tts, home] = await Promise.all([
      supabase.from("jhb_media").select(IMG_COLS).like("mime", "image/%").order("created_at", { ascending: false }),
      supabase.from("jhb_posts").select("title, cover_image"),
      supabase.from("jhb_testimonials").select("name, photo_url"),
      supabase.from("jhb_home").select("data"),
    ]);

    const usage = new Map<string, string[]>();
    const add = (url: string | null | undefined, label: string) => {
      if (!url) return;
      const list = usage.get(url) ?? [];
      if (!list.includes(label)) list.push(label);
      usage.set(url, list);
    };
    for (const p of (posts.data ?? []) as { title: string; cover_image: string | null }[]) {
      add(p.cover_image, `Blog: ${p.title}`);
    }
    for (const t of (tts.data ?? []) as { name: string; photo_url: string | null }[]) {
      add(t.photo_url, `Testimonial: ${t.name}`);
    }
    for (const h of (home.data ?? []) as { data: { hero?: { image?: string | null } } }[]) {
      add(h.data?.hero?.image, "Hero / Banner");
    }

    return ((media.data as MediaImage[]) ?? []).map((m) => ({
      ...m,
      used_in: usage.get(m.url)?.join(", ") || "Unused",
    }));
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
