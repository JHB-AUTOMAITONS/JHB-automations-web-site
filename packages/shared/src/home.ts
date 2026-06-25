// Home page content — client-safe types + defaults (no server-only imports).

export type HeroBlock = {
  badge: string;
  title: string;
  highlight: string;
  subtitle: string; // rich HTML (formatting + links)
  buttonText: string;
  buttonHref: string;
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
  title: string;
  subtitle: string;
};

// A fully dynamic Home service card. Stored as an ordered array inside the Home
// draft/published content (order = array index). No DB schema change required.
export type ServiceCard = {
  id: string; // stable id (crypto.randomUUID() in the admin)
  title: string; // rich HTML
  short: string; // rich HTML (description)
  icon: string; // one of SERVICE_CARD_ICONS; used when `image` is empty
  image: string | null; // optional; overrides the icon when set
  slug: string; // optional link target ("" = not linked)
  enabled: boolean;
};

// Icon names available to the card picker — MUST match the keys in
// apps/website/src/components/Icon.tsx.
export const SERVICE_CARD_ICONS = [
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

type ServiceSeed = { slug: string; title: string; short: string; icon: string };

// Resolve the stored serviceCards into a full, ordered card list. Tolerates the
// legacy `{slug,title,short}` override shape (and an empty list) by seeding from
// the live services — this preserves the existing cards on first load. Once the
// admin saves, the stored value is already the new shape and is returned as-is.
export function buildServiceCards(
  stored: unknown,
  services: ServiceSeed[]
): ServiceCard[] {
  const arr = Array.isArray(stored) ? stored : [];
  const isNewShape = arr.some(
    (c) => c && typeof c === "object" && "id" in c && "enabled" in c
  );

  if (isNewShape) {
    return arr
      .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
      .map((c, i) => ({
        id: typeof c.id === "string" && c.id ? c.id : `card-${i}`,
        title: typeof c.title === "string" ? c.title : "",
        short: typeof c.short === "string" ? c.short : "",
        icon: typeof c.icon === "string" && c.icon ? c.icon : "spark",
        image: typeof c.image === "string" && c.image ? c.image : null,
        slug: typeof c.slug === "string" ? c.slug : "",
        enabled: c.enabled !== false,
      }));
  }

  // Legacy: `stored` is a list of {slug,title,short} overrides — seed every
  // service into a card, applying any matching override.
  const overrides = new Map(
    arr
      .filter((o): o is Record<string, unknown> => !!o && typeof o === "object")
      .map((o) => [String(o.slug ?? ""), o])
  );
  return services.map((s, i) => {
    const o = overrides.get(s.slug);
    return {
      id: s.slug || `card-${i}`,
      title: (typeof o?.title === "string" && o.title) || s.title,
      short: (typeof o?.short === "string" && o.short) || s.short,
      icon: s.icon || "spark",
      image: null,
      slug: s.slug || "",
      enabled: true,
    };
  });
}

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
  serviceCards: ServiceCard[];
  cta: CtaBlock;
  founder: FounderBlock;
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
    title: "Premium AI & Growth Services",
    subtitle:
      "Everything you need to automate operations, generate leads and scale — engineered under one roof.",
  },
  serviceCards: [],
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
};

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
    cta: { ...HOME_DEFAULT.cta, ...(d.cta ?? {}) },
    founder: { ...HOME_DEFAULT.founder, ...(d.founder ?? {}) },
  };
}
