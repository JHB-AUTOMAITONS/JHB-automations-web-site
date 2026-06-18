// Client-safe content types + defaults (no server-only imports here).
// Server fetchers live in content.server.ts.

export type HeroContent = {
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
};

export type StatItem = { value: number; suffix: string; label: string };
export type StatsContent = { items: StatItem[] };

// Logo / branding — managed from Admin → Branding (Logo Management). Empty URL
// means "use the built-in default" (e.g. /logo.png) so nothing ever breaks.
export type LogoSettings = {
  headerLogo: string;
  footerLogo: string;
  adminLogo: string;
  favicon: string;
  mobileLogo: string;
  // Header logo-box appearance
  width: number;
  height: number;
  padding: number;
  radius: number;
  bgColor: string;
  align: "left" | "center";
};

export const LOGO_DEFAULT: LogoSettings = {
  headerLogo: "",
  footerLogo: "",
  adminLogo: "",
  favicon: "",
  mobileLogo: "",
  width: 48,
  height: 48,
  padding: 6,
  radius: 12,
  bgColor: "#ffffff",
  align: "center",
};

export type SiteSettings = {
  companyName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  // Office location block (home "Visit Us" + map). Empty values fall back to the
  // built-in defaults so the section never breaks.
  officeName: string;
  officeAddressLines: string; // multi-line display address (one line per row)
  officeMapQuery: string; // full single-line address used for the Google Map + directions
  addressStreet: string; // structured fields below feed the LocalBusiness JSON-LD schema
  addressLocality: string;
  addressRegion: string;
  addressPostalCode: string;
  addressCountry: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  // "JHB Automation Tools" navbar CTA button (admin-managed).
  toolsButtonEnabled: boolean;
  toolsButtonLabel: string;
  toolsButtonHref: string;
  toolsButtonNewTab: boolean;
  branding: LogoSettings;
};

export const HERO_DEFAULT: HeroContent = {
  badge: "Next-Gen AI Automation Agency",
  title: "Grow Your Business Online, Smarter and Faster With",
  highlight: "Best Digital Marketing Salem",
  subtitle:
    "We help businesses of all sizes attract the right customers, build trust, and boost sales. With data-driven strategies, SEO, content, and digital solutions, we deliver the best digital marketing Salem—your growth is our mission every step of the way.",
  ctaPrimaryLabel: "Contact Us",
  ctaPrimaryHref: "#contact",
  ctaSecondaryLabel: "Explore Services",
  ctaSecondaryHref: "#services",
};

export const STATS_DEFAULT: StatsContent = {
  items: [
    { value: 87, suffix: "%", label: "Client Retention" },
    { value: 3, suffix: "+", label: "Years of Service" },
    { value: 15, suffix: "+", label: "Professionals" },
    { value: 180, suffix: "+", label: "Satisfied Clients" },
  ],
};

export const SETTINGS_DEFAULT: SiteSettings = {
  companyName: "JHB Automations",
  tagline: "Digitalise your business with AI, web and data-driven marketing.",
  phone: "+91 97918 22718",
  email: "jhbautomations@gmail.com",
  address: "Indira Nagar, Narasothipatti, Salem-4, Tamil Nadu",
  hours: "Mon-Sat, 9:30 AM - 6:00 PM",
  // Empty by default — OfficeLocation falls back to its built-in address until
  // an admin fills these in.
  officeName: "",
  officeAddressLines: "",
  officeMapQuery: "",
  addressStreet: "",
  addressLocality: "",
  addressRegion: "",
  addressPostalCode: "",
  addressCountry: "",
  instagram: "https://instagram.com/jhb_automations_",
  facebook: "#",
  linkedin: "#",
  toolsButtonEnabled: true,
  toolsButtonLabel: "JHB Automation Tools",
  toolsButtonHref: "/jhb-automation-tools",
  toolsButtonNewTab: false,
  branding: LOGO_DEFAULT,
};
