// Service Page Editor types — client-safe.

export type ServiceFeature = {
  title: string;
  desc: string;
  // Optional per-feature link. `link` is the URL; `linkText` is the anchor text
  // shown on the public page (falls back to the feature title when empty).
  link?: string;
  linkText?: string;
};
export type ServiceFaqItem = { question: string; answer: string };
export type ServiceCta = {
  heading: string;
  text: string;
  button_label: string;
  button_href: string;
};
export type ServiceStatus = "draft" | "published";

export const EMPTY_CTA: ServiceCta = {
  heading: "",
  text: "",
  button_label: "",
  button_href: "",
};

// Full editable page (DB row merged with code defaults from data.ts).
export type ServicePage = {
  key: string; // immutable id (original slug)
  title: string; // display title (from data.ts)
  slug: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  hero_heading: string;
  hero_description: string;
  // Optional "Word Link" for the hero — when set, the hero heading links here.
  hero_link: string;
  features: ServiceFeature[];
  faq: ServiceFaqItem[];
  cta: ServiceCta;
  image_url: string | null;
  image_alt: string | null;
  image_title: string | null;
  status: ServiceStatus;
  content_updated_at: string | null;
};

export type ServicePageSummary = {
  key: string;
  title: string;
  slug: string;
  status: ServiceStatus;
  content_updated_at: string | null;
};

// Payload the editor saves (everything except key/title which are fixed/derived).
export type ServicePagePayload = Omit<ServicePage, "key" | "title" | "content_updated_at">;

export type InternalPage = { label: string; url: string };

// Pull all hrefs out of a content HTML string (for link validation).
export function extractHrefs(html: string): string[] {
  const out: string[] = [];
  const re = /href\s*=\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}
