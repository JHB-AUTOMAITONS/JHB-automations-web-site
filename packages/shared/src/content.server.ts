import { createClient } from "./supabase/server";
import {
  HERO_DEFAULT,
  STATS_DEFAULT,
  SETTINGS_DEFAULT,
  LOGO_DEFAULT,
  type HeroContent,
  type StatsContent,
  type StatItem,
  type SiteSettings,
  type LogoSettings,
} from "./content";

async function fetchBlock(
  table: "jhb_content" | "jhb_settings",
  key: string
): Promise<Record<string, unknown> | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from(table)
      .select("data")
      .eq("key", key)
      .maybeSingle();
    return (data?.data as Record<string, unknown>) ?? null;
  } catch {
    return null;
  }
}

export async function getHero(): Promise<HeroContent> {
  return { ...HERO_DEFAULT, ...(await fetchBlock("jhb_content", "hero")) };
}

export async function getStats(): Promise<StatsContent> {
  const data = await fetchBlock("jhb_content", "stats");
  const items = (data?.items as StatItem[]) ?? STATS_DEFAULT.items;
  return { items };
}

export async function getSettings(): Promise<SiteSettings> {
  const saved = (await fetchBlock("jhb_settings", "site")) ?? {};
  return {
    ...SETTINGS_DEFAULT,
    ...saved,
    // Deep-merge nested branding so older saved docs keep every default field.
    branding: { ...LOGO_DEFAULT, ...((saved.branding as Partial<LogoSettings>) ?? {}) },
  };
}

export type SeoRow = {
  path: string;
  title: string | null;
  meta_title: string | null;
  description: string | null;
  keywords: string | null;
  canonical: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  robots: string | null;
  structured_data: string | null;
  seo_content: string | null;
  slug: string | null;
};

const SEO_COLUMNS =
  "path, title, meta_title, description, keywords, canonical, og_title, og_description, og_image, robots, structured_data, seo_content, slug";

export async function getSeo(path: string): Promise<SeoRow | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_seo")
      .select(SEO_COLUMNS)
      .eq("path", path)
      .maybeSingle();
    return (data as SeoRow) ?? null;
  } catch {
    // If the extra columns don't exist yet (migration not run), fall back safely.
    return null;
  }
}

import type { Metadata } from "next";

export async function buildMetadata(
  path: string,
  fallback: Metadata
): Promise<Metadata> {
  const defaultCanonical = path === "/" ? "/" : path;
  const seo = await getSeo(path);
  if (!seo) return { ...fallback, alternates: { canonical: defaultCanonical } };

  const canonical = seo.canonical?.trim() || defaultCanonical;
  const seoTitle = seo.meta_title?.trim() || seo.title?.trim() || undefined;
  const seoDesc = seo.description?.trim() || undefined;

  return {
    ...fallback,
    title: seoTitle ?? fallback.title,
    description: seoDesc ?? fallback.description,
    keywords: seo.keywords
      ? seo.keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : fallback.keywords,
    alternates: { canonical },
    ...(seo.robots?.trim() ? { robots: seo.robots.trim() } : {}),
    openGraph: {
      ...(fallback.openGraph ?? {}),
      siteName: "JHB Automations",
      type: "website",
      url: canonical,
      title: seo.og_title?.trim() || seoTitle,
      description: seo.og_description?.trim() || seoDesc,
      images: seo.og_image ? [seo.og_image] : undefined,
    },
  };
}
