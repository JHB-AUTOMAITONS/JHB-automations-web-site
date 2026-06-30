// Home page content — client-safe types + defaults (no server-only imports).

import type { PageContainer } from "./containers";

export type HeroBlock = {
  badge: string;
  title: string;
  highlight: string;
  subtitle: string; // rich HTML (formatting + links)
  buttonText: string;
  buttonHref: string;
  buttonSecondaryText: string; // secondary (ghost) CTA label; "" hides it
  buttonSecondaryHref: string;
  marqueeLabel: string; // label above the in-hero tools/partners marquee
  image: string | null;
  imageTitle: string; // optional SEO title attribute for the hero image
};

export type AboutBlock = {
  enabled: boolean;
  eyebrow: string;
  title: string;
  descriptionHtml: string;
  image: string | null;
};

export type ServicesSectionBlock = {
  eyebrow: string; // section badge, e.g. "What We Do"
  title: string;
  subtitle: string;
  viewAllText: string; // "View All Services" button label
  learnMoreText: string; // per-card hover label
};

// Reusable "section header" chrome — the eyebrow + split heading + sub-text that
// sits above sections whose body content lives in its own table (stats,
// testimonials, client logos, blog, contact, faq). Defaults mirror the original
// hardcoded copy so an unedited page looks identical.
export type SectionHeader = {
  eyebrow: string;
  headingLead: string; // text before the gradient highlight
  headingHighlight: string; // gradient word(s)
  description: string;
};

export type TestimonialsHeader = SectionHeader & {
  ratingValue: string; // e.g. "4.9/5" (bold)
  ratingText: string; // e.g. "from 200+ happy clients" (muted)
};

export type FaqHeader = SectionHeader & {
  linkText: string; // inline help link label, e.g. "Talk to our team"
  linkHref: string;
};

export type BlogHeader = SectionHeader & {
  viewAllText: string; // "View All Blogs" button label
};

export type ServiceCardOverride = {
  slug: string;
  title: string;
  short: string;
};

export type CtaBlock = {
  enabled: boolean;
  title: string;
  textHtml: string;
  buttonText: string;
  buttonHref: string;
};

export type FounderBlock = {
  enabled: boolean;
  eyebrow: string;
  heading: string;
  highlight: string;
  descriptionHtml: string;
  focusTitle: string;
  focusPoints: string[];
  image: string | null; // null → falls back to the bundled /founder.jpg
  imageAlt: string;
  name: string; // badge line 1, e.g. "Founder & CEO"
  company: string; // badge line 2
};

export type HomeContent = {
  hero: HeroBlock;
  about: AboutBlock;
  servicesSection: ServicesSectionBlock;
  serviceCards: ServiceCardOverride[];
  // Section-header chrome for sections whose body content lives in its own
  // table (so the headings/eyebrows/sub-text are editable too).
  statsHeader: SectionHeader;
  testimonialsHeader: TestimonialsHeader;
  clientLogosHeader: SectionHeader;
  faqHeader: FaqHeader;
  blogHeader: BlogHeader;
  contactHeader: SectionHeader;
  cta: CtaBlock;
  founder: FounderBlock;
  // Extra page-builder containers inserted between the native sections.
  // Empty by default, so an unedited home page looks exactly as it always has.
  containers: PageContainer[];
};

export const HOME_DEFAULT: HomeContent = {
  hero: {
    badge: "Next-Gen AI Automation Agency",
    title: "Grow Your Business Online, Smarter and Faster With",
    highlight: "Best Digital Marketing Salem",
    subtitle:
      "We help businesses of all sizes attract the right customers, build trust, and boost sales. With data-driven strategies, SEO, content, and digital solutions, we deliver the best digital marketing Salem—your growth is our mission every step of the way.",
    buttonText: "Contact Us",
    buttonHref: "/#contact",
    buttonSecondaryText: "Explore Services",
    buttonSecondaryHref: "#services",
    marqueeLabel: "We work with industry-leading tools",
    image: null,
    imageTitle: "",
  },
  about: {
    enabled: true,
    eyebrow: "Who We Are",
    title: "We Build the Automated Future of Business",
    descriptionHtml:
      "<p>JHB Automations is a next-generation AI automation agency. We help ambitious businesses automate their operations, generate leads on autopilot and scale faster — combining intelligent AI systems, high-performance web development and data-driven marketing.</p>",
    image: null,
  },
  servicesSection: {
    eyebrow: "What We Do",
    title: "Premium AI & Growth Services",
    subtitle:
      "Everything you need to automate operations, generate leads and scale — engineered under one roof.",
    viewAllText: "View All Services",
    learnMoreText: "Learn more",
  },
  serviceCards: [],
  statsHeader: {
    eyebrow: "Why Choose Us",
    headingLead: "Numbers That",
    headingHighlight: "Speak",
    description: "",
  },
  testimonialsHeader: {
    eyebrow: "Social Proof",
    headingLead: "Trusted by",
    headingHighlight: "Ambitious Teams",
    description:
      "Real businesses. Real automation. Real growth. Hover any card to pause and read.",
    ratingValue: "4.9/5",
    ratingText: "from 200+ happy clients",
  },
  clientLogosHeader: {
    eyebrow: "Trusted Partnerships",
    headingLead: "Our Valuable",
    headingHighlight: "Clients",
    description: "Brands across industries trust JHB Automations to drive their growth.",
  },
  faqHeader: {
    eyebrow: "FAQ",
    headingLead: "Frequently Asked",
    headingHighlight: "Questions",
    description:
      "Everything you need to know about working with us. Can't find an answer?",
    linkText: "Talk to our team",
    linkHref: "/#contact",
  },
  blogHeader: {
    eyebrow: "Insights",
    headingLead: "Latest From the",
    headingHighlight: "Blog",
    description: "Practical tips on AI automation, marketing and growing your business.",
    viewAllText: "View All Blogs",
  },
  contactHeader: {
    eyebrow: "Let's Talk",
    headingLead: "Get in",
    headingHighlight: "Touch",
    description:
      "Tell us about your goals and we'll map the fastest path to automated, predictable growth — no obligation.",
  },
  cta: {
    enabled: true,
    title: "Ready to Digitalise Your Business?",
    textHtml:
      "<p>Get in touch and we will show you the fastest path to predictable, automated growth.</p>",
    buttonText: "Contact Us",
    buttonHref: "/#contact",
  },
  founder: {
    enabled: true,
    eyebrow: "Founder Perspective",
    heading: "Growth Depends on",
    highlight: "Predictable Systems",
    descriptionHtml:
      "<p>Growth depends on predictable systems, diversified lead channels, and automated workflows. Businesses that rely on a single source or manual operations limit their scalability. At JHB Automations, we help companies create multi-channel lead generation systems, optimize digital touchpoints, and implement automation that reduces operational effort and increases revenue efficiency.</p>",
    focusTitle: "We Focus On",
    focusPoints: [
      "Consistent Lead Flow",
      "Automated Customer Journeys",
      "Clear Messaging & Market Positioning",
      "Data-Driven Digital Systems",
    ],
    image: null,
    imageAlt: "Founder of JHB Automations",
    name: "Founder & CEO",
    company: "JHB Automations",
  },
  containers: [],
};

// The hero heading is now a single rich field with inline gradient highlights.
// For legacy content (plain `title` + separate `highlight`) we compose the old
// shape into one HTML string the first time it renders — so existing hero
// headings are preserved and migrate lazily once edited. Already-rich titles
// (anything containing a tag) are returned untouched.
export function composeHeroHeading(title: string, highlight?: string): string {
  const t = title ?? "";
  if (/<[a-z!/][\s\S]*>/i.test(t)) return t; // already rich HTML
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const h = (highlight ?? "").trim();
  return h ? `${esc(t)} <span class="grad-text">${esc(h)}</span>` : esc(t);
}

// Deep-merge a stored partial over the defaults so missing keys never break rendering.
export function mergeHome(data: Partial<HomeContent> | null | undefined): HomeContent {
  const d = data ?? {};
  return {
    hero: { ...HOME_DEFAULT.hero, ...(d.hero ?? {}) },
    about: { ...HOME_DEFAULT.about, ...(d.about ?? {}) },
    servicesSection: {
      ...HOME_DEFAULT.servicesSection,
      ...(d.servicesSection ?? {}),
    },
    serviceCards: d.serviceCards ?? HOME_DEFAULT.serviceCards,
    statsHeader: { ...HOME_DEFAULT.statsHeader, ...(d.statsHeader ?? {}) },
    testimonialsHeader: {
      ...HOME_DEFAULT.testimonialsHeader,
      ...(d.testimonialsHeader ?? {}),
    },
    clientLogosHeader: {
      ...HOME_DEFAULT.clientLogosHeader,
      ...(d.clientLogosHeader ?? {}),
    },
    faqHeader: { ...HOME_DEFAULT.faqHeader, ...(d.faqHeader ?? {}) },
    blogHeader: { ...HOME_DEFAULT.blogHeader, ...(d.blogHeader ?? {}) },
    contactHeader: { ...HOME_DEFAULT.contactHeader, ...(d.contactHeader ?? {}) },
    cta: { ...HOME_DEFAULT.cta, ...(d.cta ?? {}) },
    founder: { ...HOME_DEFAULT.founder, ...(d.founder ?? {}) },
    containers: Array.isArray(d.containers) ? d.containers : HOME_DEFAULT.containers,
  };
}
