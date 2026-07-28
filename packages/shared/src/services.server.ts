import { cache } from "react";
import { createClient } from "./supabase/server";
import { serviceDetails, type ServiceDetail } from "./data";

export type ResolvedService = ServiceDetail & {
  key: string; // immutable content id (original slug)
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
};

type ServiceRow = {
  key: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  sort_order: number;
};

// cache(): one jhb_services read per request, even though getServices /
// getServiceBySlug / getServiceLinks each call it within the same render.
const getRows = cache(async (): Promise<Map<string, ServiceRow>> => {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_services")
      .select("key, slug, meta_title, meta_description, meta_keywords, sort_order");
    const map = new Map<string, ServiceRow>();
    (data as ServiceRow[] | null)?.forEach((r) => map.set(r.key, r));
    return map;
  } catch {
    return new Map();
  }
});

function resolve(detail: ServiceDetail, row?: ServiceRow): ResolvedService {
  return {
    ...detail,
    key: detail.slug,
    slug: row?.slug ?? detail.slug, // effective public slug
    metaTitle: row?.meta_title || `${detail.title} — JHB Automations`,
    metaDescription: row?.meta_description || detail.intro,
    metaKeywords:
      row?.meta_keywords || `${detail.title}, JHB Automations, digital marketing Salem`,
  };
}

export async function getServices(): Promise<ResolvedService[]> {
  const rows = await getRows();
  return serviceDetails.map((d) => resolve(d, rows.get(d.slug)));
}

export async function getServiceBySlug(
  slug: string
): Promise<ResolvedService | null> {
  const rows = await getRows();
  // Find the row whose effective slug matches
  for (const [key, row] of rows) {
    if (row.slug === slug) {
      const detail = serviceDetails.find((d) => d.slug === key);
      if (detail) return resolve(detail, row);
    }
  }
  // Fallback: no DB override, match the original slug
  const detail = serviceDetails.find((d) => d.slug === slug);
  return detail ? resolve(detail, rows.get(detail.slug)) : null;
}

export type ServiceLink = { label: string; href: string; icon: string };

export async function getServiceLinks(): Promise<ServiceLink[]> {
  const services = await getServices();
  return services.map((s) => ({
    label: s.title,
    href: `/${s.slug}`,
    icon: s.icon,
  }));
}
