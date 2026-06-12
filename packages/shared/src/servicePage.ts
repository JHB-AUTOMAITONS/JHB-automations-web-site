// Service-page section model — client-safe types + defaults/merge helpers.

export type HeroSec = {
  enabled: boolean;
  eyebrow: string;
  heading: string;
  subheading: string;
  ctaText: string;
  ctaLink: string;
  image: string | null;
};
export type AboutSec = {
  enabled: boolean;
  title: string;
  descriptionHtml: string;
  image: string | null;
};
export type BenefitItem = { title: string; desc: string };
export type BenefitsSec = { enabled: boolean; title: string; items: BenefitItem[] };
export type ProcessStep = { title: string; desc: string };
export type ProcessSec = { enabled: boolean; title: string; steps: ProcessStep[] };
export type WhyUsSec = {
  enabled: boolean;
  title: string;
  description: string;
  features: string[];
};
export type CtaSec = {
  enabled: boolean;
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
};

export type ServiceSections = {
  hero: HeroSec;
  about: AboutSec;
  benefits: BenefitsSec;
  process: ProcessSec;
  whyUs: WhyUsSec;
  cta: CtaSec;
};

export type ServiceContentInput = {
  title: string;
  tagline: string;
  intro: string;
  features: BenefitItem[];
  benefits: string[];
};

export function defaultSections(c: ServiceContentInput): ServiceSections {
  return {
    hero: {
      enabled: true,
      eyebrow: c.tagline,
      heading: c.title,
      subheading: c.intro,
      ctaText: "Book Free Consultation",
      ctaLink: "/#contact",
      image: null,
    },
    about: {
      enabled: false,
      title: `About Our ${c.title}`,
      descriptionHtml: `<p>${c.intro}</p>`,
      image: null,
    },
    benefits: {
      enabled: true,
      title: "What's Included",
      items: c.features,
    },
    process: {
      enabled: false,
      title: "How It Works",
      steps: [],
    },
    whyUs: {
      enabled: true,
      title: "The JHB Advantage",
      description: `We don't just deliver ${c.title.toLowerCase()} — we deliver measurable business growth, with full transparency at every step.`,
      features: c.benefits,
    },
    cta: {
      enabled: true,
      heading: `Ready to get started with ${c.title}?`,
      description:
        "Book a free consultation and we'll show you exactly how this can drive growth for your business.",
      buttonText: "Book Free Consultation",
      buttonLink: "/#contact",
    },
  };
}

export function mergeSections(
  d: ServiceSections,
  s: Partial<ServiceSections> | null | undefined
): ServiceSections {
  const o = s ?? {};
  return {
    hero: { ...d.hero, ...(o.hero ?? {}) },
    about: { ...d.about, ...(o.about ?? {}) },
    benefits: { ...d.benefits, ...(o.benefits ?? {}) },
    process: { ...d.process, ...(o.process ?? {}) },
    whyUs: { ...d.whyUs, ...(o.whyUs ?? {}) },
    cta: { ...d.cta, ...(o.cta ?? {}) },
  };
}
