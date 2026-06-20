import { createClient } from "./supabase/server";
import { serviceDetails } from "./data";
import {
  EMPTY_CTA,
  type InternalPage,
  type ServiceCta,
  type ServiceFaqItem,
  type ServiceFeature,
  type ServicePage,
  type ServicePageSummary,
  type ServiceStatus,
} from "./servicePages";

const COLS =
  "key, slug, meta_title, meta_description, meta_keywords, sort_order, status, hero_heading, hero_description, hero_link, features, faq, cta, image_url, image_alt, image_title, content_updated_at";

type Row = {
  key: string;
  slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  sort_order: number | null;
  status: ServiceStatus | null;
  hero_heading: string | null;
  hero_description: string | null;
  hero_link: string | null;
  features: ServiceFeature[] | null;
  faq: ServiceFaqItem[] | null;
  cta: ServiceCta | null;
  image_url: string | null;
  image_alt: string | null;
  image_title: string | null;
  content_updated_at: string | null;
};

function merge(key: string, row?: Row): ServicePage {
  const detail = serviceDetails.find((d) => d.slug === key);
  const title = detail?.title ?? key;
  return {
    key,
    title,
    slug: row?.slug || key,
    meta_title: row?.meta_title || `${title} — JHB Automations`,
    meta_description: row?.meta_description || detail?.intro || "",
    meta_keywords: row?.meta_keywords || "",
    // content fields fall back to the code defaults until edited
    hero_heading: row?.hero_heading || title,
    hero_description: row?.hero_description || detail?.intro || "",
    hero_link: row?.hero_link || "",
    features:
      row?.features && row.features.length > 0
        ? row.features
        : (detail?.features ?? []).map((f) => ({ title: f.title, desc: f.desc })),
    faq: row?.faq ?? [],
    cta: row?.cta || EMPTY_CTA,
    image_url: row?.image_url ?? null,
    image_alt: row?.image_alt ?? null,
    image_title: row?.image_title ?? null,
    status: row?.status || "draft",
    content_updated_at: row?.content_updated_at ?? null,
  };
}

export async function getServicePageSummaries(): Promise<ServicePageSummary[]> {
  let rows: Row[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("jhb_services").select(COLS);
    rows = (data as Row[]) ?? [];
  } catch {
    rows = [];
  }
  const byKey = new Map(rows.map((r) => [r.key, r]));
  return serviceDetails
    .map((d) => {
      const r = byKey.get(d.slug);
      return {
        key: d.slug,
        title: d.title,
        slug: r?.slug || d.slug,
        status: (r?.status || "draft") as ServiceStatus,
        content_updated_at: r?.content_updated_at ?? null,
      };
    })
    .sort((a, b) => (byKey.get(a.key)?.sort_order ?? 0) - (byKey.get(b.key)?.sort_order ?? 0));
}

// Public: raw stored editor content for a service (nulls preserved so the
// frontend can decide per-field whether to override the code defaults).
export type PublishedServiceContent = {
  status: ServiceStatus;
  hero_heading: string | null;
  hero_description: string | null;
  hero_link: string | null;
  features: ServiceFeature[] | null;
  image_url: string | null;
  image_alt: string | null;
  image_title: string | null;
};

export async function getPublishedServiceContent(
  key: string
): Promise<PublishedServiceContent | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_services")
      .select("status, hero_heading, hero_description, hero_link, features, image_url, image_alt, image_title")
      .eq("key", key)
      .maybeSingle();
    const row = (data as PublishedServiceContent) ?? null;
    console.log(
      `[service-page] fetch key="${key}" status=${row?.status ?? "none"} ` +
        `hasHero=${!!row?.hero_description} hasImage=${!!row?.image_url}`
    );
    return row;
  } catch (e) {
    console.error(`[service-page] fetch FAILED key="${key}"`, e);
    return null;
  }
}

export async function getServicePage(key: string): Promise<ServicePage | null> {
  const detail = serviceDetails.find((d) => d.slug === key);
  if (!detail) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("jhb_services").select(COLS).eq("key", key).maybeSingle();
    return merge(key, (data as Row) ?? undefined);
  } catch {
    return merge(key);
  }
}

// Internal pages available for linking / validation / suggestions.
export async function getInternalPages(): Promise<InternalPage[]> {
  const base: InternalPage[] = [
    { label: "Home", url: "/" },
    { label: "About", url: "/about" },
    { label: "Contact", url: "/contact" },
    { label: "Blog", url: "/blog" },
    { label: "All Services", url: "/services" },
  ];
  const services: InternalPage[] = [];
  const posts: InternalPage[] = [];
  try {
    const supabase = await createClient();
    const [svc, pst] = await Promise.all([
      supabase.from("jhb_services").select("key, slug"),
      supabase.from("jhb_posts").select("slug, title").eq("status", "published"),
    ]);
    for (const d of serviceDetails) {
      const row = ((svc.data as { key: string; slug: string }[]) ?? []).find((r) => r.key === d.slug);
      services.push({ label: `Service · ${d.title}`, url: `/${row?.slug || d.slug}` });
    }
    for (const p of (pst.data as { slug: string; title: string }[]) ?? []) {
      posts.push({ label: `Blog · ${p.title}`, url: `/blog/${p.slug}` });
    }
  } catch {
    /* fall through with base only */
  }
  return [...base, ...services, ...posts];
}
