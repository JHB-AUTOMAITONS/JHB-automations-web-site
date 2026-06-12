// Home page content — client-safe types + defaults (no server-only imports).

export type HeroBlock = {
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  buttonText: string;
  buttonHref: string;
  image: string | null;
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

export type HomeContent = {
  hero: HeroBlock;
  about: AboutBlock;
  servicesSection: ServicesSectionBlock;
  serviceCards: ServiceCardOverride[];
  cta: CtaBlock;
};

export const HOME_DEFAULT: HomeContent = {
  hero: {
    badge: "Next-Gen AI Automation Agency",
    title: "Grow Your Business Online, Smarter and Faster With",
    highlight: "Best Digital Marketing Salem",
    subtitle:
      "We help businesses of all sizes attract the right customers, build trust, and boost sales. With data-driven strategies, SEO, content, and digital solutions, we deliver the best digital marketing Salem—your growth is our mission every step of the way.",
    buttonText: "Contact Us",
    buttonHref: "#contact",
    image: null,
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
      "<p>Book a free consultation and we will show you the fastest path to predictable, automated growth.</p>",
    buttonText: "Book Free Consultation",
    buttonHref: "#contact",
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
  };
}
