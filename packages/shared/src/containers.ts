// Reusable in-page "containers" model. An existing page keeps its native
// sections exactly as they are; admins can additionally insert these containers
// into zones BETWEEN those sections. Each container carries a `zone` telling the
// public renderer where it sits relative to the native sections. Pure types +
// helpers — safe to import from both the admin (client) and the website (server).

export type ContainerType =
  | "hero"
  | "herodesc"
  | "features"
  | "services"
  | "about"
  | "cards"
  | "imagecontent"
  | "richtext"
  | "image"
  | "imagebanner"
  | "gallery"
  | "video"
  | "testimonials"
  | "faq"
  | "cta"
  | "team"
  | "contactform"
  | "advantage"
  | "workflow"
  | "custom";

import type { HeadingTag } from "./heading";
import type { CSSProperties } from "react";

export type ContainerBg = "none" | "subtle" | "gradient" | "dark";
export type ContainerPad = "none" | "sm" | "md" | "lg";
export type ContainerAlign = "left" | "center" | "right";
export type ContainerStyle = { bg: ContainerBg; padding: ContainerPad; align: ContainerAlign };
export type Btn = { label: string; href: string };

// ─── Universal image presentation settings ───────────────────────────────────
// Optional + fully additive: an image with no `imageSettings` renders exactly as
// before. Shared by the admin controls (ImageSettingsControls) and the website
// renderers via smartImgAttrs(), so the live preview matches production. Sizes
// are free-form CSS lengths (px / % / rem / vw / vh / auto).
export type ImageObjectFit = "cover" | "contain" | "fill" | "scale-down" | "none";
export type ImageAlign = "left" | "center" | "right" | "full";
export type ImageBox = { width?: string; height?: string };
export type ImageSettings = {
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  minWidth?: string;
  minHeight?: string;
  tablet?: ImageBox; // applied at <= 1024px
  mobile?: ImageBox; // applied at <= 640px
  aspectRatio?: string; // e.g. "16 / 9" — locks height to width (aspect-ratio lock)
  objectFit?: ImageObjectFit;
  objectPosition?: string;
  align?: ImageAlign;
  radius?: string; // border-radius
  borderWidth?: string;
  borderColor?: string;
  shadow?: "none" | "sm" | "md" | "lg";
  opacity?: number; // 0..100
  rotate?: number; // degrees
  scale?: number; // 1 = 100%
  zIndex?: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "auto" | "high" | "low";
};

const IMG_SHADOW: Record<NonNullable<ImageSettings["shadow"]>, string> = {
  none: "none",
  sm: "0 1px 3px rgba(0,0,0,0.12)",
  md: "0 8px 24px -8px rgba(0,0,0,0.25)",
  lg: "0 20px 50px -12px rgba(0,0,0,0.35)",
};

export type SmartImgAttrs = {
  className: string;
  style: CSSProperties;
  loading: "lazy" | "eager";
  fetchPriority?: "auto" | "high" | "low";
};

/**
 * Turn optional ImageSettings into <img> attributes. With no sizing set the image
 * keeps its default width/fit classes (backward compatible); responsive
 * width/height flow through CSS custom properties consumed by the global
 * `.smart-img` rules (see globals.css) so they work with SSR and no JS.
 */
export function smartImgAttrs(
  s: ImageSettings | null | undefined,
  o: { extraClass?: string; fallbackWidth?: string; fallbackFit?: string } = {},
): SmartImgAttrs {
  const extra = o.extraClass ?? "";
  const fallbackWidth = o.fallbackWidth ?? "w-full";
  const fallbackFit = o.fallbackFit ?? "object-cover";
  if (!s) {
    return { className: [extra, fallbackWidth, fallbackFit].filter(Boolean).join(" "), style: {}, loading: "lazy" };
  }
  const style: CSSProperties = {};
  // CSS custom properties aren't in the CSSProperties type; set them via a cast.
  const vars = style as Record<string, string | number>;
  const hasSize = !!(
    s.width || s.height || s.tablet?.width || s.tablet?.height || s.mobile?.width || s.mobile?.height || s.align === "full"
  );
  if (s.width) vars["--siw"] = s.width;
  if (s.height) vars["--sih"] = s.height;
  if (s.tablet?.width) vars["--siw-t"] = s.tablet.width;
  if (s.tablet?.height) vars["--sih-t"] = s.tablet.height;
  if (s.mobile?.width) vars["--siw-m"] = s.mobile.width;
  if (s.mobile?.height) vars["--sih-m"] = s.mobile.height;
  if (s.align === "full" && !s.width) vars["--siw"] = "100%";
  if (s.maxWidth) style.maxWidth = s.maxWidth;
  if (s.maxHeight) style.maxHeight = s.maxHeight;
  if (s.minWidth) style.minWidth = s.minWidth;
  if (s.minHeight) style.minHeight = s.minHeight;
  if (s.aspectRatio) style.aspectRatio = s.aspectRatio;
  if (s.objectFit) style.objectFit = s.objectFit;
  if (s.objectPosition) style.objectPosition = s.objectPosition;
  if (s.radius) style.borderRadius = s.radius;
  if (s.borderWidth) style.border = `${s.borderWidth} solid ${s.borderColor || "rgba(0,0,0,0.1)"}`;
  if (s.shadow && s.shadow !== "none") style.boxShadow = IMG_SHADOW[s.shadow];
  if (typeof s.opacity === "number" && s.opacity !== 100) style.opacity = Math.max(0, Math.min(100, s.opacity)) / 100;
  const tf: string[] = [];
  if (s.rotate) tf.push(`rotate(${s.rotate}deg)`);
  if (typeof s.scale === "number" && s.scale !== 1) tf.push(`scale(${s.scale})`);
  if (tf.length) style.transform = tf.join(" ");
  if (typeof s.zIndex === "number") {
    style.zIndex = s.zIndex;
    style.position = "relative";
  }
  if (s.align === "center") {
    style.marginLeft = "auto";
    style.marginRight = "auto";
  } else if (s.align === "right") {
    style.marginLeft = "auto";
    style.marginRight = "0";
  }
  const className = [
    extra,
    hasSize ? "smart-img" : fallbackWidth,
    s.objectFit ? "" : fallbackFit,
    s.align === "center" || s.align === "right" ? "block" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return { className, style, loading: s.loading ?? "lazy", ...(s.fetchPriority ? { fetchPriority: s.fetchPriority } : {}) };
}

// `headingTag` is the semantic element of the container's MAIN heading (the admin
// picks it; defaults to h2 at render). Optional + on the shared base so every
// container — present and future — supports it with no per-type churn.
type Base = { id: string; zone: string; style: ContainerStyle; headingTag?: HeadingTag };

export type HeroContainer = Base & {
  type: "hero";
  props: { badge: string; heading: string; highlight: string; subtitle: string; primary: Btn; secondary: Btn; image: string | null; imageSettings?: ImageSettings };
};
export type RichTextContainer = Base & { type: "richtext"; props: { html: string; width: "narrow" | "wide" } };
export type FeatureItem = { id: string; icon: string; title: string; desc: string };
export type FeaturesContainer = Base & {
  type: "features";
  props: { heading: string; highlight: string; subtitle: string; columns: 2 | 3 | 4; items: FeatureItem[] };
};
export type Testimonial = { id: string; quote: string; name: string; role: string; avatar: string | null };
export type TestimonialsContainer = Base & {
  type: "testimonials";
  props: { heading: string; highlight: string; columns: 2 | 3; items: Testimonial[] };
};
export type FaqEntry = { id: string; q: string; a: string };
export type FaqContainer = Base & { type: "faq"; props: { heading: string; highlight: string; showNumbers?: boolean; items: FaqEntry[] } };
export type GalleryImg = { id: string; url: string; alt: string; imageSettings?: ImageSettings };
export type GalleryContainer = Base & { type: "gallery"; props: { heading: string; columns: 2 | 3 | 4; images: GalleryImg[] } };
export type ImageBannerContainer = Base & {
  type: "imagebanner";
  props: { image: string | null; heading: string; subtitle: string; button: Btn; overlay: boolean };
};
export type CtaContainer = Base & { type: "cta"; props: { heading: string; highlight: string; subtitle: string; button: Btn } };

// Hero Description — a rich-text block rendered in the prominent hero-subtitle
// style. Uses the same full RichEditor (bold/italic/lists/links/tables/colour/
// highlight) as the home page's Hero Description.
export type HeroDescContainer = Base & { type: "herodesc"; props: { html: string } };

// Card Section — a grid of fully editable cards.
export type CardItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string | null;
  link: string; // optional: makes the whole card a link
  button: Btn; // optional: empty label hides it
  bg: string; // optional background colour (hex/css) — "" = default card style
  bgImage: string | null; // optional background image (overrides bg colour)
  imageSettings?: ImageSettings; // optional universal size/style controls for the card image
};
export type CardsContainer = Base & {
  type: "cards";
  props: { heading: string; highlight: string; columns: 2 | 3 | 4; items: CardItem[] };
};

// Services — a grid of service cards (icon/title/desc + optional link).
export type ServiceItem = { id: string; icon: string; title: string; desc: string; href: string };
export type ServicesContainer = Base & {
  type: "services";
  props: { heading: string; highlight: string; subtitle: string; columns: 2 | 3 | 4; items: ServiceItem[] };
};

// About — a two-column eyebrow/heading/rich-body block with an image.
export type AboutContainer = Base & {
  type: "about";
  props: { eyebrow: string; heading: string; highlight: string; bodyHtml: string; image: string | null; imagePosition: "left" | "right"; imageSettings?: ImageSettings };
};

// Image + Content — a reusable marketing section with an image on one side and
// rich content (badge / heading / description / bullets / buttons) on the other.
// Fully editable: image side (left/right), column split, vertical alignment,
// per-breakpoint mobile order, and an optional solid-colour or image background
// (on top of the shared style.bg). Nothing is hardcoded.
export type ImageContentBullet = { id: string; text: string };
export type WidthSplit = "50-50" | "60-40" | "40-60" | "70-30" | "30-70";
export type ImageContentContainer = Base & {
  type: "imagecontent";
  props: {
    badge: string;
    heading: string; // rich-text HTML
    description: string; // rich-text HTML
    bullets: ImageContentBullet[];
    primary: Btn;
    secondary: Btn;
    image: string | null;
    imageAlt: string;
    imageTitle: string;
    imageCaption: string;
    imageDescription: string;
    imagePosition: "left" | "right";
    widthSplit: WidthSplit; // content : image proportions
    verticalAlign: "top" | "center" | "bottom";
    mobileOrder: "image-first" | "content-first";
    bgColor: string; // "" = use the shared style.bg
    bgImage: string | null; // overrides bgColor + style.bg when set
    imageSettings?: ImageSettings; // optional universal size/style controls
  };
};

// Image — a single image with optional caption.
export type ImageContainer = Base & {
  type: "image";
  props: { url: string | null; alt: string; caption: string; width: "container" | "full"; rounded: boolean; imageSettings?: ImageSettings };
};

// Video — an embedded video (YouTube/Vimeo URL or direct file).
export type VideoContainer = Base & {
  type: "video";
  props: { url: string; caption: string; aspect: "16:9" | "4:3" | "1:1" };
};

// Team — a grid of member cards.
export type TeamMember = { id: string; name: string; role: string; photo: string | null; bio: string };
export type TeamContainer = Base & {
  type: "team";
  props: { heading: string; highlight: string; columns: 2 | 3 | 4; items: TeamMember[] };
};

// Contact Form — renders a working lead form (submits to jhb_leads, like the site's Contact section).
export type ContactFormContainer = Base & {
  type: "contactform";
  props: { heading: string; highlight: string; subtitle: string; buttonLabel: string };
};

// Advantage / "Why Choose Us" — a two-column section: badge + heading +
// description on the left, a checklist (icon or image / title / optional
// sub-text) on the right, set inside a glass card. This is the design behind
// reusable section templates such as "The JHB Advantage" — but, like every
// other container, it is fully editable once inserted.
export type AdvantageItem = { id: string; icon: string; image: string | null; title: string; desc: string };
export type AdvantageContainer = Base & {
  type: "advantage";
  props: { badge: string; heading: string; highlight: string; description: string; items: AdvantageItem[] };
};

// Workflow Process — a sequential process/timeline (Lead Capture → Qualification
// → … → Retention), like the CRM workflow strip. Renders horizontally with arrows
// on desktop, wraps to multiple rows on tablet, and stacks vertically on mobile;
// the layout selector also offers always-vertical and zig-zag variants. Every
// step is fully editable, including its own background / border / text / arrow
// colours, optional icon or image, and an enable/disable toggle. Nothing hardcoded.
export type WorkflowStep = {
  id: string;
  title: string;
  desc: string;
  icon: string; // emoji icon (used when no image is set)
  image: string | null; // optional image — overrides the icon
  bg: string; // step background colour ("" = default glass card)
  border: string; // step border colour ("" = default)
  text: string; // step text colour ("" = inherit)
  arrow: string; // colour of the arrow AFTER this step ("" = default)
  enabled: boolean; // disabled steps are hidden on the live page
};
export type WorkflowLayout = "horizontal" | "vertical" | "zigzag";
export type WorkflowWidth = "narrow" | "default" | "wide" | "full";
export type WorkflowContainer = Base & {
  type: "workflow";
  props: {
    eyebrow: string;
    heading: string; // lead part of the heading
    highlight: string; // gradient-highlighted part
    headingTail: string; // trailing part after the highlight
    subtitle: string; // rich-text HTML
    layout: WorkflowLayout;
    width: WorkflowWidth;
    steps: WorkflowStep[];
  };
};

// Custom — raw HTML / embed block for anything not covered above.
export type CustomContainer = Base & { type: "custom"; props: { html: string } };

export type PageContainer =
  | HeroContainer
  | HeroDescContainer
  | RichTextContainer
  | FeaturesContainer
  | ServicesContainer
  | AboutContainer
  | CardsContainer
  | ImageContentContainer
  | ImageContainer
  | ImageBannerContainer
  | GalleryContainer
  | VideoContainer
  | TestimonialsContainer
  | FaqContainer
  | CtaContainer
  | TeamContainer
  | ContactFormContainer
  | AdvantageContainer
  | WorkflowContainer
  | CustomContainer;

export const CONTAINER_LABELS: Record<ContainerType, string> = {
  hero: "Hero",
  herodesc: "Hero Description",
  features: "Features",
  services: "Services",
  about: "About",
  cards: "Card Section",
  imagecontent: "Image + Content",
  richtext: "Rich Text",
  image: "Image",
  imagebanner: "Image Banner",
  gallery: "Gallery",
  video: "Video",
  testimonials: "Testimonials",
  faq: "FAQ",
  cta: "Call to Action",
  team: "Team",
  contactform: "Contact Form",
  advantage: "Why Choose Us",
  workflow: "Workflow Process",
  custom: "Custom Container",
};

// Order shown in the "Add Container" dialog.
export const CONTAINER_TYPES: ContainerType[] = [
  "hero",
  "herodesc",
  "features",
  "services",
  "workflow",
  "about",
  "cards",
  "imagecontent",
  "richtext",
  "image",
  "imagebanner",
  "gallery",
  "video",
  "testimonials",
  "faq",
  "cta",
  "team",
  "contactform",
  "custom",
];

export const cid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `c-${Date.now()}-${Math.round(Math.random() * 1e6)}`;

const DS: ContainerStyle = { bg: "none", padding: "lg", align: "left" };

/** New container of a type, assigned to a zone, with sensible starter content. */
export function createContainer(type: ContainerType, zone: string): PageContainer {
  const id = cid();
  switch (type) {
    case "hero":
      return { id, zone, type, style: { ...DS, align: "center" }, props: { badge: "", heading: "Your headline", highlight: "here", subtitle: "A short supporting sentence.", primary: { label: "Get started", href: "/#contact" }, secondary: { label: "", href: "" }, image: null } };
    case "herodesc":
      return { id, zone, type, style: { ...DS, align: "center", padding: "sm" }, props: { html: "<p>Hero description text — edit me with the full rich-text toolbar.</p>" } };
    case "features":
      return { id, zone, type, style: { ...DS }, props: { heading: "Why", highlight: "choose us", subtitle: "", columns: 3, items: [ { id: cid(), icon: "⚡", title: "Fast", desc: "Describe this." }, { id: cid(), icon: "🔒", title: "Secure", desc: "Describe this." }, { id: cid(), icon: "✨", title: "Polished", desc: "Describe this." } ] } };
    case "cards":
      return { id, zone, type, style: { ...DS }, props: { heading: "Featured", highlight: "", columns: 3, items: [ { id: cid(), title: "Card title", description: "Short description of this card.", icon: "✨", image: null, link: "", button: { label: "", href: "" }, bg: "", bgImage: null } ] } };
    case "testimonials":
      return { id, zone, type, style: { ...DS, bg: "subtle" }, props: { heading: "What clients", highlight: "say", columns: 3, items: [ { id: cid(), quote: "They delivered exactly what we needed.", name: "Client Name", role: "CEO, Company", avatar: null } ] } };
    case "faq":
      return { id, zone, type, style: { ...DS }, props: { heading: "Frequently asked", highlight: "questions", showNumbers: true, items: [ { id: cid(), q: "A question?", a: "The answer." } ] } };
    case "gallery":
      return { id, zone, type, style: { ...DS }, props: { heading: "Gallery", columns: 3, images: [] } };
    case "imagebanner":
      return { id, zone, type, style: { ...DS, align: "center", padding: "none" }, props: { image: null, heading: "", subtitle: "", button: { label: "", href: "" }, overlay: true } };
    case "richtext":
      return { id, zone, type, style: { ...DS }, props: { html: "<p>Write something…</p>", width: "narrow" } };
    case "cta":
      return { id, zone, type, style: { ...DS, align: "center", bg: "gradient" }, props: { heading: "Ready to", highlight: "get started?", subtitle: "", button: { label: "Contact us", href: "/#contact" } } };
    case "services":
      return { id, zone, type, style: { ...DS }, props: { heading: "Our", highlight: "Services", subtitle: "", columns: 3, items: [ { id: cid(), icon: "⚙️", title: "Service one", desc: "Describe this service.", href: "" }, { id: cid(), icon: "🚀", title: "Service two", desc: "Describe this service.", href: "" }, { id: cid(), icon: "📈", title: "Service three", desc: "Describe this service.", href: "" } ] } };
    case "about":
      return { id, zone, type, style: { ...DS }, props: { eyebrow: "About Us", heading: "Who", highlight: "we are", bodyHtml: "<p>Tell your story here — full rich-text formatting.</p>", image: null, imagePosition: "right" } };
    case "imagecontent":
      return { id, zone, type, style: { ...DS, padding: "lg", align: "left" }, props: {
        badge: "Why choose us",
        heading: "<p>A headline that <strong>converts</strong></p>",
        description: "<p>Briefly describe the value of this section. Use the toolbar for rich formatting.</p>",
        bullets: [ { id: cid(), text: "Key benefit one" }, { id: cid(), text: "Key benefit two" }, { id: cid(), text: "Key benefit three" } ],
        primary: { label: "Get started", href: "/#contact" },
        secondary: { label: "", href: "" },
        image: null, imageAlt: "", imageTitle: "", imageCaption: "", imageDescription: "",
        imagePosition: "right", widthSplit: "50-50", verticalAlign: "center", mobileOrder: "image-first",
        bgColor: "", bgImage: null,
      } };
    case "image":
      return { id, zone, type, style: { ...DS }, props: { url: null, alt: "", caption: "", width: "container", rounded: true } };
    case "video":
      return { id, zone, type, style: { ...DS, align: "center" }, props: { url: "", caption: "", aspect: "16:9" } };
    case "team":
      return { id, zone, type, style: { ...DS }, props: { heading: "Meet the", highlight: "team", columns: 3, items: [ { id: cid(), name: "Team member", role: "Role", photo: null, bio: "" } ] } };
    case "contactform":
      return { id, zone, type, style: { ...DS, bg: "subtle" }, props: { heading: "Get in", highlight: "touch", subtitle: "Send us a message and we'll get back to you shortly.", buttonLabel: "Send message" } };
    case "advantage":
      return { id, zone, type, style: { ...DS, padding: "md" }, props: { badge: "Why Choose Us", heading: "The JHB", highlight: "Advantage", description: "We don't just deliver — we deliver measurable business growth, with full transparency at every step.", items: [ { id: cid(), icon: "✓", image: null, title: "Benefit one", desc: "" }, { id: cid(), icon: "✓", image: null, title: "Benefit two", desc: "" }, { id: cid(), icon: "✓", image: null, title: "Benefit three", desc: "" } ] } };
    case "workflow":
      return { id, zone, type, style: { ...DS, align: "center" }, props: {
        eyebrow: "How it works",
        heading: "Our",
        highlight: "Workflow",
        headingTail: "Process",
        subtitle: "<p>A clear, sequential process — from first contact to long-term retention.</p>",
        layout: "horizontal",
        width: "default",
        steps: [
          { id: cid(), title: "Lead Capture", desc: "", icon: "🎯", image: null, bg: "", border: "", text: "", arrow: "", enabled: true },
          { id: cid(), title: "Lead Qualification", desc: "", icon: "🔍", image: null, bg: "", border: "", text: "", arrow: "", enabled: true },
          { id: cid(), title: "Follow-Up Automation", desc: "", icon: "🔁", image: null, bg: "", border: "", text: "", arrow: "", enabled: true },
          { id: cid(), title: "Sales Pipeline", desc: "", icon: "📊", image: null, bg: "", border: "", text: "", arrow: "", enabled: true },
          { id: cid(), title: "Deal Closure", desc: "", icon: "🤝", image: null, bg: "", border: "", text: "", arrow: "", enabled: true },
          { id: cid(), title: "Customer Retention", desc: "", icon: "💎", image: null, bg: "", border: "", text: "", arrow: "", enabled: true },
        ],
      } };
    case "custom":
      return { id, zone, type, style: { ...DS }, props: { html: "<!-- Paste any HTML or embed code here -->" } };
  }
}

/** Independent deep copy with brand-new IDs (container + nested children). */
export function cloneContainer(c: PageContainer): PageContainer {
  const copy: PageContainer = JSON.parse(JSON.stringify(c));
  copy.id = cid();
  if (copy.type === "features") copy.props.items = copy.props.items.map((i) => ({ ...i, id: cid() }));
  if (copy.type === "cards") copy.props.items = copy.props.items.map((i) => ({ ...i, id: cid() }));
  if (copy.type === "services") copy.props.items = copy.props.items.map((i) => ({ ...i, id: cid() }));
  if (copy.type === "team") copy.props.items = copy.props.items.map((i) => ({ ...i, id: cid() }));
  if (copy.type === "advantage") copy.props.items = copy.props.items.map((i) => ({ ...i, id: cid() }));
  if (copy.type === "workflow") copy.props.steps = copy.props.steps.map((s) => ({ ...s, id: cid() }));
  if (copy.type === "testimonials") copy.props.items = copy.props.items.map((i) => ({ ...i, id: cid() }));
  if (copy.type === "faq") copy.props.items = copy.props.items.map((i) => ({ ...i, id: cid() }));
  if (copy.type === "gallery") copy.props.images = copy.props.images.map((i) => ({ ...i, id: cid() }));
  if (copy.type === "imagecontent") copy.props.bullets = copy.props.bullets.map((b) => ({ ...b, id: cid() }));
  return copy;
}
