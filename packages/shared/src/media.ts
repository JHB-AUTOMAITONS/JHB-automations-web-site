// Media / image alt-text types + helpers — client-safe.

export type MediaImage = {
  id: string;
  name: string;
  path: string;
  url: string;
  mime: string | null;
  size: number | null;
  alt_text: string | null;
  image_title: string | null;
  image_caption: string | null;
  image_description: string | null;
  image_keywords: string[];
  image_filename: string | null;
  og_title: string | null;
  og_description: string | null;
  alt_updated_at: string | null;
  updated_at: string | null;
  created_at: string;
};

// Recommended lengths for SEO fields.
export const TITLE_MAX = 60;
export const CAPTION_MAX = 160;
export const OG_TITLE_MAX = 70;
export const OG_DESC_MAX = 200;

// Slugify a filename to an SEO-friendly form (keeps the extension).
export function slugifyFilename(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : "";
  const slug = base
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return (slug || "image") + ext;
}

// Parse comma/tag keyword input into a clean unique array.
export function parseKeywords(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    )
  );
}

// A library row enriched with where the image is used across the site.
export type MediaLibraryItem = MediaImage & { used_in: string };

// SEO guidance for alt text length.
export const ALT_MIN = 50;
export const ALT_MAX = 125;

export type AltStatus = "empty" | "short" | "ok" | "long";

export function altStatus(text: string): AltStatus {
  const len = text.trim().length;
  if (len === 0) return "empty";
  if (len < ALT_MIN) return "short";
  if (len > ALT_MAX) return "long";
  return "ok";
}

// Resolve the alt text for an image URL from a DB-driven map, with a fallback.
export function altFor(
  url: string | null | undefined,
  map: Record<string, string>,
  fallback = ""
): string {
  if (!url) return fallback;
  return map[url] || fallback;
}
