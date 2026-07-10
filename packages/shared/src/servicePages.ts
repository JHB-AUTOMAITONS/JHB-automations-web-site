// Service Page Editor types — client-safe.

import type { ContainerAlign, ContainerBg, ContainerPad, ImageSettings, PageContainer } from "./containers";
import type { HeadingTag } from "./heading";

export type ServiceFeature = {
  title: string;
  desc: string;
  // Optional per-feature link. `link` is the URL; `linkText` is the anchor text
  // shown on the public page (falls back to "Learn more" when empty).
  link?: string;
  linkText?: string;
  // Optional richer fields for the editable "What's Included" cards. All are
  // additive — older rows simply lack them and fall back to the numbered badge.
  id?: string;
  icon?: string; // emoji; empty → numbered badge fallback
  image?: string | null; // overrides the icon/number when set
};

// "What's Included" — the section *chrome* (badge, heading, description, button,
// styling). The cards themselves are the `features` array above, so existing
// content is preserved automatically. Fully editable, one per service page.
export type WhatsIncludedContent = {
  enabled: boolean;
  badge: string; // eyebrow; "" = no badge (the current default)
  heading: string; // lead, e.g. "What's"
  highlight: string; // gradient text, e.g. "Included"
  description: string;
  columns: 1 | 2 | 3;
  button: { label: string; href: string }; // optional CTA below the grid
  bg: ContainerBg;
  padding: ContainerPad;
  align: ContainerAlign;
  // Semantic heading level for SEO. Absent → "h2" (a section heading under the
  // hero H1). The visual style never changes; only the rendered element does.
  headingTag?: HeadingTag;
};

// Defaults mirror the original hardcoded section so unedited pages look identical.
export function seedWhatsIncluded(title: string): WhatsIncludedContent {
  return {
    enabled: true,
    badge: "",
    heading: "What's",
    highlight: "Included",
    description: `Everything you get when you partner with us on ${title}.`,
    columns: 2,
    button: { label: "", href: "" },
    bg: "none",
    padding: "md",
    align: "left",
  };
}
export type ServiceFaqItem = { question: string; answer: string };

// "Why Choose Us / JHB Advantage" — fully editable, multiple containers per page.
export type WhyChooseBenefit = {
  id: string;
  title: string;
  enabled: boolean;
  // Legacy/optional fields. The editor no longer manages these, but older saved
  // benefits may still carry them and continue to render on the public page.
  icon?: string; // one of WHY_CHOOSE_ICONS; falls back to a ✓ badge when empty
  image?: string | null; // overrides the icon when set
  desc?: string;
};
export type WhyChooseContainer = {
  id: string;
  enabled: boolean;
  badge: string; // eyebrow, e.g. "Why Choose Us"
  heading: string; // e.g. "The JHB"
  highlight: string; // gradient text, e.g. "Advantage"
  description: string;
  // Independent horizontal alignment for the heading and the description.
  // Absent → "left" (the original design), so existing pages render unchanged.
  headingAlign?: ContainerAlign;
  descriptionAlign?: ContainerAlign;
  benefits: WhyChooseBenefit[];
};

// Icon names for the benefit picker — MUST match the keys in
// apps/website/src/components/Icon.tsx.
export const WHY_CHOOSE_ICONS = [
  "spark",
  "chat",
  "code",
  "crm",
  "whatsapp",
  "rocket",
  "search",
  "doc",
  "cart",
  "flow",
  "app",
  "settings",
] as const;

// Seed a single default container that mirrors the original hardcoded section,
// so existing pages keep their look/content until edited.
export function seedWhyChoose(opts: {
  title: string;
  benefits?: string[];
}): WhyChooseContainer[] {
  const benefits: WhyChooseBenefit[] = (opts.benefits ?? []).map((t, i) => ({
    id: `wc-0-b-${i}`,
    title: t,
    enabled: true,
  }));
  return [
    {
      id: "wc-0",
      enabled: true,
      badge: "Why Choose Us",
      heading: "The JHB",
      highlight: "Advantage",
      description: `We don't just deliver ${opts.title.toLowerCase()} — we deliver measurable business growth, with full transparency at every step.`,
      benefits,
    },
  ];
}
export type ServiceCta = {
  heading: string;
  text: string;
  button_label: string;
  button_href: string;
  // Semantic heading level for SEO. Absent → "h2".
  headingTag?: HeadingTag;
};

// "Explore Related Services" — fully editable section (header + cards). Stored
// inside the `chrome` jsonb so NO new column / migration is needed. Each card is
// independently styled and links to a chosen Service Page (or a custom URL).
export type RelatedHover = "lift" | "glow" | "none";
export type RelatedServiceCard = {
  id: string;
  name: string; // card title (auto-filled from the target service, editable)
  icon: string; // shared Icon name (used when no image is set)
  image: string | null; // optional uploaded image — overrides the icon
  description: string; // optional sub-text under the name
  target: string; // target Service Page key ("" = none / custom URL only)
  customUrl: string; // optional override URL (wins over the target's URL)
  bg: string; // card background colour ("" = default glass card)
  border: string; // border colour ("" = default)
  iconColor: string; // icon colour ("" = default)
  textColor: string; // title colour ("" = default muted)
  hover: RelatedHover; // hover effect: lift (default) / glow / none
  enabled: boolean; // disabled cards are hidden on the live page
};
export type RelatedServicesContent = {
  enabled: boolean;
  eyebrow: string;
  headingLead: string;
  headingHighlight: string; // gradient text
  headingTail: string;
  subtitle: string; // rich-text HTML
  cards: RelatedServiceCard[];
};

// Per-page chrome: hero CTA buttons + the Related Services section.
// Stored as `chrome` jsonb column; all fields are optional on the DB side and
// fall back to SERVICE_CHROME_DEFAULT when unset.
// Hero image layout — all optional so absent config renders the legacy design
// (the 160px icon tile on the right) unchanged. Lives inside `chrome` jsonb so
// no new column / migration is needed.
export type ServiceHeroImage = {
  mode?: "tile" | "image" | "hidden"; // tile = legacy icon tile (default)
  align?: "left" | "center" | "right"; // image column side; default right
  settings?: ImageSettings; // width/height/radius/fit/shadow… (universal panel)
  caption?: string;
  description?: string;
};

export type ServiceChrome = {
  heroPrimaryText: string;
  heroPrimaryHref: string;
  heroSecondaryText: string;
  heroSecondaryHref: string;
  // Horizontal alignment of the hero eyebrow + H1 only. "left" matches the
  // original design, so existing pages render unchanged until edited.
  heroHeadingAlign?: "left" | "center" | "right";
  // Semantic tag for the hero heading. Absent → "h1" (the page's single main
  // heading, correct for SEO). Change only if another element already owns the H1.
  heroHeadingTag?: HeadingTag;
  // Hero image layout (see ServiceHeroImage). Absent → legacy icon tile.
  heroImage?: ServiceHeroImage;
  // Legacy heading fields — kept for back-compat / fallback. The editable
  // Related Services section (`related`) supersedes them once seeded.
  relatedHeadingLead: string;
  relatedHeadingHighlight: string;
  // Fully editable Related Services section. Absent on un-migrated rows (the
  // editor seeds it from these legacy fields + the service list on first load).
  related?: RelatedServicesContent;
};

export const SERVICE_CHROME_DEFAULT: ServiceChrome = {
  heroPrimaryText: "Contact Us",
  heroPrimaryHref: "/#contact",
  heroSecondaryText: "All Services",
  heroSecondaryHref: "/services",
  relatedHeadingLead: "Explore Related",
  relatedHeadingHighlight: "Services",
};

// Build the editable Related Services section from the legacy heading + the list
// of service pages — reproducing the original auto-generated cards (first 4 OTHER
// services), so migrating loses no content. `enabled` cards link to their target.
export function seedRelatedServices(opts: {
  currentKey: string;
  chrome?: Partial<ServiceChrome> | null;
  services: { key: string; title: string; icon: string }[];
}): RelatedServicesContent {
  const cards: RelatedServiceCard[] = opts.services
    .filter((s) => s.key !== opts.currentKey)
    .slice(0, 4)
    .map((s, i) => ({
      id: `rs-${i}-${s.key}`,
      name: s.title,
      icon: s.icon || "spark",
      image: null,
      description: "",
      target: s.key,
      customUrl: "",
      bg: "",
      border: "",
      iconColor: "",
      textColor: "",
      hover: "lift",
      enabled: true,
    }));
  return {
    enabled: true,
    eyebrow: "",
    headingLead: opts.chrome?.relatedHeadingLead || SERVICE_CHROME_DEFAULT.relatedHeadingLead,
    headingHighlight: opts.chrome?.relatedHeadingHighlight || SERVICE_CHROME_DEFAULT.relatedHeadingHighlight,
    headingTail: "",
    subtitle: "",
    cards,
  };
}

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
  // Split hero heading — lead (plain) + highlight (brand gradient) + tail (plain),
  // matching the About hero and section headings sitewide. `hero_heading` is the
  // LEAD (legacy single-field values live here, so nothing is lost on migration).
  hero_heading: string;
  hero_highlight: string;
  hero_tail: string;
  hero_description: string;
  // Optional "Word Link" for the hero — when set, the hero heading links here.
  hero_link: string;
  features: ServiceFeature[];
  whats_included: WhatsIncludedContent;
  faq: ServiceFaqItem[];
  why_choose: WhyChooseContainer[];
  cta: ServiceCta;
  image_url: string | null;
  image_alt: string | null;
  image_title: string | null;
  status: ServiceStatus;
  content_updated_at: string | null;
  // Editor-only: when the working draft was last saved, and whether it holds
  // changes not yet published. Drive the editor's Save/Publish state (the live
  // site never reads these — it reads the published content columns).
  draft_updated_at?: string | null;
  pending_changes?: boolean;
  // Page-builder containers inserted between the native sections (jhb_services.containers).
  containers: PageContainer[];
  // Per-page chrome: hero CTA buttons + related-services section heading.
  chrome: ServiceChrome;
};

export type ServicePageSummary = {
  key: string;
  title: string;
  slug: string;
  status: ServiceStatus;
  content_updated_at: string | null;
};

// Payload the editor saves (everything except key/title which are fixed/derived,
// and the editor-only draft metadata which the server computes).
export type ServicePagePayload = Omit<
  ServicePage,
  "key" | "title" | "content_updated_at" | "draft_updated_at" | "pending_changes"
>;

export type InternalPage = { label: string; url: string };

// Pull all hrefs out of a content HTML string (for link validation).
export function extractHrefs(html: string): string[] {
  const out: string[] = [];
  const re = /href\s*=\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}
