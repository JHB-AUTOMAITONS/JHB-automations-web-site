import { cache } from "react";
import { createClient } from "./supabase/server";
import {
  HERO_DEFAULT,
  NAV_ITEMS_CONFIG_DEFAULT,
  PAGE_HEROES_DEFAULT,
  STATS_DEFAULT,
  SETTINGS_DEFAULT,
  LOGO_DEFAULT,
  BLOG_BANNER_DEFAULT,
  BLOG_HERO_DEFAULT,
  withLegalDefaults,
  withAuthorPublisherDoc,
  effectiveAuthorPublisher,
  type HeroContent,
  type NavItemOverride,
  type PageHeroContent,
  type StatsContent,
  type StatItem,
  type SiteSettings,
  type LogoSettings,
  type PageHeroes,
  type BlogBanner,
  type BlogHero,
  type LegalPages,
  type AuthorPublisher,
  type AuthorPublisherDoc,
} from "./content";

// Wrapped in React cache(): within a single server render, repeat reads of the
// same (table, key) are de-duplicated to one Supabase round-trip. The cache is
// per-request only, so there is no cross-request staleness.
const fetchBlock = cache(async (
  table: "jhb_content" | "jhb_settings",
  key: string
): Promise<Record<string, unknown> | null> => {
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
});

export async function getHero(): Promise<HeroContent> {
  return { ...HERO_DEFAULT, ...(await fetchBlock("jhb_content", "hero")) };
}

export async function getStats(): Promise<StatsContent> {
  const data = await fetchBlock("jhb_content", "stats");
  const items = (data?.items as StatItem[]) ?? STATS_DEFAULT.items;
  return { items };
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const saved = (await fetchBlock("jhb_settings", "site")) ?? {};
  const savedHeroes = (saved.pageHeroes as Partial<PageHeroes>) ?? {};

  // Nav items: merge saved overrides by id; new default items appear automatically.
  const savedNavItems = (saved.navItems as NavItemOverride[] | undefined) ?? [];
  const navItemsMerged = NAV_ITEMS_CONFIG_DEFAULT.map((item) => {
    const override = savedNavItems.find((o) => o.id === item.id);
    return override ? { ...item, ...override } : item;
  });

  // Footer company links: use saved non-empty array if present, else defaults.
  const savedFooterLinks = saved.footerCompanyLinks as { label: string; href: string }[] | undefined;
  const footerCompanyLinks =
    Array.isArray(savedFooterLinks) && savedFooterLinks.length > 0
      ? savedFooterLinks
      : SETTINGS_DEFAULT.footerCompanyLinks;

  return {
    ...SETTINGS_DEFAULT,
    ...saved,
    // Deep-merge nested branding so older saved docs keep every default field.
    branding: { ...LOGO_DEFAULT, ...((saved.branding as Partial<LogoSettings>) ?? {}) },
    // Deep-merge per-page hero so any missing fields fall back to the defaults.
    pageHeroes: {
      services: { ...PAGE_HEROES_DEFAULT.services, ...((savedHeroes.services as Partial<PageHeroContent>) ?? {}) },
      blog: { ...PAGE_HEROES_DEFAULT.blog, ...((savedHeroes.blog as Partial<PageHeroContent>) ?? {}) },
      contact: { ...PAGE_HEROES_DEFAULT.contact, ...((savedHeroes.contact as Partial<PageHeroContent>) ?? {}) },
    },
    navItems: navItemsMerged,
    footerCompanyLinks,
  };
});

// Published blog banner — what the public /blog page renders. Falls back to the
// hidden default until an admin publishes, so the live page is never affected
// by an in-progress draft.
export async function getBlogBanner(): Promise<BlogBanner> {
  return { ...BLOG_BANNER_DEFAULT, ...(await fetchBlock("jhb_content", "blog_banner")) };
}

// Admin editor seed — prefer the draft, then the published version, then the
// hidden default, so reopening the editor resumes the latest unsaved work.
export async function getBlogBannerDraft(): Promise<BlogBanner> {
  const [published, draft] = await Promise.all([
    fetchBlock("jhb_content", "blog_banner"),
    fetchBlock("jhb_content", "blog_banner_draft"),
  ]);
  return { ...BLOG_BANNER_DEFAULT, ...(published ?? {}), ...(draft ?? {}) };
}

// Published blog hero — the full-width banner on the public /blog page.
export async function getBlogHero(): Promise<BlogHero> {
  return { ...BLOG_HERO_DEFAULT, ...(await fetchBlock("jhb_content", "blog_hero")) };
}

// Admin editor seed — prefer the draft, then published, then defaults.
export async function getBlogHeroDraft(): Promise<BlogHero> {
  const [published, draft] = await Promise.all([
    fetchBlock("jhb_content", "blog_hero"),
    fetchBlock("jhb_content", "blog_hero_draft"),
  ]);
  return { ...BLOG_HERO_DEFAULT, ...(published ?? {}), ...(draft ?? {}) };
}

// Author & Publisher (SEO) — global defaults + per-page overrides.
export async function getAuthorPublisherDoc(): Promise<AuthorPublisherDoc> {
  return withAuthorPublisherDoc(await fetchBlock("jhb_content", "author_publisher"));
}

// Admin editor seed — prefer the draft, then published, then defaults.
export async function getAuthorPublisherDraftDoc(): Promise<AuthorPublisherDoc> {
  const [published, draft] = await Promise.all([
    fetchBlock("jhb_content", "author_publisher"),
    fetchBlock("jhb_content", "author_publisher_draft"),
  ]);
  return withAuthorPublisherDoc({ ...(published ?? {}), ...(draft ?? {}) });
}

// The effective author/publisher for a given route (override or global).
export async function getEffectiveAuthorPublisher(path: string): Promise<AuthorPublisher> {
  return effectiveAuthorPublisher(await getAuthorPublisherDoc(), path);
}

// Published legal pages (Privacy + Terms) — what the public pages render.
export async function getLegal(): Promise<LegalPages> {
  return withLegalDefaults(await fetchBlock("jhb_content", "legal"));
}

// Admin editor seed — prefer the draft, then published, then defaults.
export async function getLegalDraft(): Promise<LegalPages> {
  const [published, draft] = await Promise.all([
    fetchBlock("jhb_content", "legal"),
    fetchBlock("jhb_content", "legal_draft"),
  ]);
  return withLegalDefaults({ ...(published ?? {}), ...(draft ?? {}) });
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

export const getSeo = cache(async (path: string): Promise<SeoRow | null> => {
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
});

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
