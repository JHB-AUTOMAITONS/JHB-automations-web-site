// Client-safe types + defaults for the /about page. Server fetcher in about.server.ts.
// Headings are split into a normal "lead" part and a gradient "highlight" part so
// the admin can edit the copy while keeping the site's visual style.

export type AboutValue = { icon: string; title: string; desc: string };

export type AboutDoc = {
  metaTitle: string;
  metaDescription: string;
  // Hero
  heroEyebrow: string;
  heroTitleLead: string;
  heroTitleHighlight: string;
  heroTitleTail: string;
  heroSubtitle: string;
  // Mission / Vision cards
  missionIcon: string;
  missionLabel: string;
  missionHighlight: string;
  missionBody: string;
  visionIcon: string;
  visionLabel: string;
  visionHighlight: string;
  visionBody: string;
  // Values
  valuesEyebrow: string;
  valuesHeadingLead: string;
  valuesHeadingHighlight: string;
  values: AboutValue[];
  // CTA
  ctaTitleLead: string;
  ctaTitleHighlight: string;
  ctaBody: string;
  ctaButtonLabel: string;
  ctaButtonHref: string;
};

export const ABOUT_DEFAULT: AboutDoc = {
  metaTitle: "About Us — JHB Automations",
  metaDescription:
    "We help businesses automate operations, generate leads and scale faster with intelligent AI systems, web development and data-driven marketing.",
  heroEyebrow: "Who We Are",
  heroTitleLead: "We Build the",
  heroTitleHighlight: "Automated Future",
  heroTitleTail: "of Business",
  heroSubtitle:
    "JHB Automations is a next-generation AI automation agency. We help ambitious businesses automate their operations, generate leads on autopilot and scale faster — combining intelligent AI systems, high-performance web development and data-driven marketing.",
  missionIcon: "🎯",
  missionLabel: "Our",
  missionHighlight: "Mission",
  missionBody:
    "To make world-class automation and digital growth accessible to every business — removing manual bottlenecks so teams can focus on what truly matters: serving customers and growing.",
  visionIcon: "🔭",
  visionLabel: "Our",
  visionHighlight: "Vision",
  visionBody:
    "A world where every business — from startup to enterprise — runs on intelligent systems that work 24/7, turning data into growth and conversations into customers.",
  valuesEyebrow: "Our Values",
  valuesHeadingLead: "What",
  valuesHeadingHighlight: "Drives Us",
  values: [
    {
      icon: "🎯",
      title: "Results Over Noise",
      desc: "We obsess over measurable outcomes — leads, revenue and ROI — not vanity metrics.",
    },
    {
      icon: "⚙️",
      title: "Engineering Mindset",
      desc: "We treat automation like engineering: reliable, tested and built to scale.",
    },
    {
      icon: "🤝",
      title: "Radical Transparency",
      desc: "Clear reporting, honest timelines and full visibility into everything we do.",
    },
    {
      icon: "🚀",
      title: "Always Innovating",
      desc: "We stay on the frontier of AI so your business is always a step ahead.",
    },
  ],
  ctaTitleLead: "Let's Build Something",
  ctaTitleHighlight: "Great",
  ctaBody:
    "Ready to automate and scale? Get in touch and we'll map your fastest path to growth.",
  ctaButtonLabel: "Contact Us →",
  ctaButtonHref: "/#contact",
};

// Merge a saved doc over the defaults so older/partial documents still render
// every field, and the values array is always a clean array.
export function withAboutDefaults(doc: Partial<AboutDoc> | null): AboutDoc {
  const values = Array.isArray(doc?.values)
    ? doc!.values.filter((v): v is AboutValue => !!v && typeof v.title === "string")
    : ABOUT_DEFAULT.values;
  return {
    ...ABOUT_DEFAULT,
    ...(doc ?? {}),
    values: values.length > 0 ? values : ABOUT_DEFAULT.values,
  };
}
