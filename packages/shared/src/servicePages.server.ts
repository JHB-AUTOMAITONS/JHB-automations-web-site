import { createClient } from "./supabase/server";
import { serviceDetails } from "./data";
import type { PageContainer } from "./containers";
import {
  EMPTY_CTA,
  SERVICE_CHROME_DEFAULT,
  seedRelatedServices,
  seedWhatsIncluded,
  seedWhyChoose,
  type InternalPage,
  type ServiceChrome,
  type ServiceCta,
  type ServiceFaqItem,
  type ServiceFeature,
  type ServicePage,
  type ServicePageSummary,
  type ServiceStatus,
  type WhatsIncludedContent,
  type WhyChooseContainer,
} from "./servicePages";

const COLS =
  "key, slug, meta_title, meta_description, meta_keywords, sort_order, status, hero_heading, hero_highlight, hero_tail, hero_description, hero_link, features, whats_included, faq, why_choose, cta, image_url, image_alt, image_title, containers, chrome, content_updated_at";

// Editor-only columns (the working draft). Kept separate from COLS so the public
// read path (getPublishedServiceContent) never pulls the draft.
const EDITOR_COLS = `${COLS}, draft, draft_updated_at`;

// A stored chrome object only counts as "set" once it carries real fields;
// an empty {} (the column default) falls back to the seeded defaults.
function hasWhatsIncluded(v: WhatsIncludedContent | null | undefined): v is WhatsIncludedContent {
  return !!v && typeof v === "object" && typeof v.heading === "string";
}

type Row = {
  key: string;
  slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  sort_order: number | null;
  status: ServiceStatus | null;
  hero_heading: string | null;
  hero_highlight: string | null;
  hero_tail: string | null;
  hero_description: string | null;
  hero_link: string | null;
  features: ServiceFeature[] | null;
  whats_included: WhatsIncludedContent | null;
  faq: ServiceFaqItem[] | null;
  why_choose: WhyChooseContainer[] | null;
  cta: ServiceCta | null;
  image_url: string | null;
  image_alt: string | null;
  image_title: string | null;
  containers: PageContainer[] | null;
  chrome: ServiceChrome | null;
  content_updated_at: string | null;
  // Editor-only working draft (a partial Row of content fields) + its save time.
  draft?: Partial<Row> | null;
  draft_updated_at?: string | null;
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
    hero_highlight: row?.hero_highlight || "",
    hero_tail: row?.hero_tail || "",
    hero_description: row?.hero_description || detail?.intro || "",
    hero_link: row?.hero_link || "",
    features:
      row?.features && row.features.length > 0
        ? row.features
        : (detail?.features ?? []).map((f) => ({ title: f.title, desc: f.desc })),
    whats_included: hasWhatsIncluded(row?.whats_included)
      ? row!.whats_included!
      : seedWhatsIncluded(title),
    faq: row?.faq ?? [],
    why_choose:
      row?.why_choose && row.why_choose.length > 0
        ? row.why_choose
        : seedWhyChoose({ title, benefits: detail?.benefits }),
    cta: row?.cta || EMPTY_CTA,
    image_url: row?.image_url ?? null,
    image_alt: row?.image_alt ?? null,
    image_title: row?.image_title ?? null,
    containers: row?.containers ?? [],
    chrome: (() => {
      const c = { ...SERVICE_CHROME_DEFAULT, ...(row?.chrome ?? {}) };
      // Migrate the legacy auto-generated Related Services into the editable
      // structure on first load, so the editor shows the current cards and
      // nothing is lost. Unsaved/unpublished pages keep the auto fallback live.
      if (!c.related) {
        c.related = seedRelatedServices({
          currentKey: key,
          chrome: c,
          services: serviceDetails.map((d) => ({ key: d.slug, title: d.title, icon: d.icon })),
        });
      }
      return c;
    })(),
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
  hero_highlight: string | null;
  hero_tail: string | null;
  hero_description: string | null;
  hero_link: string | null;
  features: ServiceFeature[] | null;
  whats_included: WhatsIncludedContent | null;
  faq: ServiceFaqItem[] | null;
  why_choose: WhyChooseContainer[] | null;
  cta: ServiceCta | null;
  image_url: string | null;
  image_alt: string | null;
  image_title: string | null;
  containers: PageContainer[] | null;
  chrome: ServiceChrome | null;
};

export async function getPublishedServiceContent(
  key: string
): Promise<PublishedServiceContent | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_services")
      .select("status, hero_heading, hero_highlight, hero_tail, hero_description, hero_link, features, whats_included, faq, why_choose, cta, image_url, image_alt, image_title, containers, chrome")
      .eq("key", key)
      .maybeSingle();
    return (data as PublishedServiceContent) ?? null;
  } catch (e) {
    console.error(`[service-page] fetch FAILED key="${key}"`, e);
    return null;
  }
}

// Editor loader: shows the working DRAFT (falling back to the published content
// columns until a draft exists), plus draft metadata so the editor can drive its
// Save Draft / Publish state. The live site never uses this — it reads the
// published columns via getPublishedServiceContent.
export async function getServicePage(key: string): Promise<ServicePage | null> {
  const detail = serviceDetails.find((d) => d.slug === key);
  if (!detail) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_services")
      .select(EDITOR_COLS)
      .eq("key", key)
      .maybeSingle();
    const row = (data as Row) ?? undefined;
    // Draft content (when present) overrides the published columns for the editor.
    // The draft holds content fields only, so status/timestamps stay row-level.
    const draft = row?.draft && typeof row.draft === "object" ? row.draft : null;
    const effective = row ? ({ ...row, ...(draft ?? {}) } as Row) : undefined;
    const base = merge(key, effective);
    return {
      ...base,
      // status pill + the public-content timestamp always reflect the LIVE row.
      status: (row?.status || "draft") as ServiceStatus,
      content_updated_at: row?.content_updated_at ?? null,
      draft_updated_at: row?.draft_updated_at ?? null,
      pending_changes: hasPendingChanges(row),
    };
  } catch {
    return merge(key);
  }
}

// A page has unpublished changes when it isn't live yet, or its draft was saved
// after the last publish.
function hasPendingChanges(row?: Row): boolean {
  if ((row?.status ?? "draft") !== "published") return true;
  const d = row?.draft_updated_at ? new Date(row.draft_updated_at).getTime() : 0;
  const p = row?.content_updated_at ? new Date(row.content_updated_at).getTime() : 0;
  return d > p;
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
