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
  // Brand wordmark text shown next to the logo in the navbar and footer
  wordmarkPrimary: string;    // e.g. "JHB"
  wordmarkSecondary: string;  // e.g. "Automations"
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
  wordmarkPrimary: "JHB",
  wordmarkSecondary: "Automations",
};

// Per-item label + visibility override for the top-level navigation.
// Stored as `navItems` inside the jhb_settings "site" blob.
export type NavItemOverride = {
  id: string;       // stable key: normalized label e.g. "jhb-products"
  label: string;    // display label shown in the navbar
  visible: boolean; // false = hide this item from the nav
};

// Mirrors the static navItems order in data.ts (7 items).
export const NAV_ITEMS_CONFIG_DEFAULT: NavItemOverride[] = [
  { id: "home", label: "Home", visible: true },
  { id: "services", label: "Services", visible: true },
  { id: "jhb-products", label: "JHB Products", visible: true },
  { id: "testimonials", label: "Testimonials", visible: true },
  { id: "blog", label: "Blog", visible: true },
  { id: "about", label: "About", visible: true },
  { id: "contact", label: "Contact", visible: true },
];

// Hero copy for the three standalone landing pages (/services, /blog, /contact).
// Stored as `pageHeroes` inside the jhb_settings "site" blob; new fields are
// backfilled from PAGE_HEROES_DEFAULT when getSettings() reads an older doc.
export type PageHeroContent = {
  eyebrow: string;
  headingLead: string;
  headingHighlight: string;
  description: string;
};

export type PageHeroes = {
  services: PageHeroContent;
  blog: PageHeroContent;
  contact: PageHeroContent;
};

export const PAGE_HEROES_DEFAULT: PageHeroes = {
  services: {
    eyebrow: "What We Do",
    headingLead: "Our",
    headingHighlight: "Services",
    description: "Click any service to explore how we deliver measurable growth for your business.",
  },
  blog: {
    eyebrow: "Insights",
    headingLead: "From the",
    headingHighlight: "Blog",
    description: "Practical insights on AI automation, digital marketing and business growth.",
  },
  contact: {
    eyebrow: "Get in Touch",
    headingLead: "Let's Start Your",
    headingHighlight: "Growth Story",
    description:
      "Whether you're ready to automate, scale or just exploring — we'd love to hear from you. Reach out and our team will respond within 24 hours.",
  },
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
  // Office section visible chrome (eyebrow, heading, description)
  officeEyebrow: string;
  officeHeadingLead: string;
  officeHeadingHighlight: string;
  officeDesc: string;
  // Office JSON-LD schema fields
  officeSchemaDesc: string;
  officeSchemaKeywords: string;
  officeSchemaHours: string;
  officeDirectionsLabel: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  // "JHB Automation Tools" navbar CTA button (admin-managed).
  toolsButtonEnabled: boolean;
  toolsButtonLabel: string;
  toolsButtonHref: string;
  toolsButtonNewTab: boolean;
  branding: LogoSettings;
  pageHeroes: PageHeroes;
  // Navigation: per-item label + visibility overrides
  navItems: NavItemOverride[];
  // Footer chrome
  footerServicesTitle: string;
  footerCompanyTitle: string;
  footerCompanyLinks: { label: string; href: string }[];
  footerNewsletterTitle: string;
  footerNewsletterDesc: string;
  footerNewsletterPlaceholder: string;
  footerCopyrightName: string; // prepended with "© {year} " in the footer
  footerBottomTagline: string;
  // Contact form micro-copy
  contactFormName: string;
  contactFormCompany: string;
  contactFormEmail: string;
  contactFormPhone: string;
  contactFormMessage: string;
  contactFormSubmit: string;
  contactFormCallCta: string;
  contactSuccessHeading: string;
  contactSuccessText: string;
  contactInfoCallLabel: string;
  contactInfoEmailLabel: string;
  contactInfoVisitLabel: string;
  // Blog search micro-copy
  blogSearchPlaceholder: string;
  blogSearchButton: string;
  blogSearchNoMatch: string; // template: use {query} for the search term
  blogSearchEmpty: string;
  // FAQ display: show automatic "01." question numbers across all FAQ sections.
  faqShowNumbers: boolean;
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
  officeEyebrow: "Visit Us",
  officeHeadingLead: "Our Office in",
  officeHeadingHighlight: "Salem",
  officeDesc: "Digital Marketing, IT Services & AI Automation Company in Salem.",
  officeSchemaDesc:
    "Digital Marketing Company in Salem offering IT Services and AI Automation. JHB Automations helps businesses generate leads, automate workflows and scale faster.",
  officeSchemaKeywords:
    "Digital Marketing Company in Salem, IT Services in Salem, AI Automation Company in Salem",
  officeSchemaHours: "Mo-Sa 09:30-18:00",
  officeDirectionsLabel: "Get Directions",
  instagram: "https://instagram.com/jhb_automations_",
  facebook: "#",
  linkedin: "#",
  toolsButtonEnabled: true,
  toolsButtonLabel: "JHB HR Management System",
  toolsButtonHref: "/jhb-automation-tools",
  toolsButtonNewTab: false,
  branding: LOGO_DEFAULT,
  pageHeroes: PAGE_HEROES_DEFAULT,
  navItems: NAV_ITEMS_CONFIG_DEFAULT,
  footerServicesTitle: "Services",
  footerCompanyTitle: "Company",
  footerCompanyLinks: [
    { label: "About", href: "/about" },
    { label: "All Services", href: "/services" },
    { label: "Testimonials", href: "/#testimonials" },
    { label: "Contact", href: "/contact" },
  ],
  footerNewsletterTitle: "Newsletter",
  footerNewsletterDesc: "Get automation insights and growth tips in your inbox.",
  footerNewsletterPlaceholder: "you@company.com",
  footerCopyrightName: "JHB Automations. All rights reserved.",
  footerBottomTagline: "Crafted with ⚡ for the future.",
  // Contact form micro-copy
  contactFormName: "Full Name",
  contactFormCompany: "Company Name",
  contactFormEmail: "Email Address",
  contactFormPhone: "Phone Number",
  contactFormMessage: "Project Details",
  contactFormSubmit: "Send Message →",
  contactFormCallCta: "Contact Team",
  contactSuccessHeading: "Message Sent!",
  contactSuccessText: "Our team will reach out within 24 hours.",
  contactInfoCallLabel: "Call us",
  contactInfoEmailLabel: "Email us",
  contactInfoVisitLabel: "Visit us",
  // Blog search micro-copy
  blogSearchPlaceholder: "Search articles…",
  blogSearchButton: "Search",
  blogSearchNoMatch: 'No articles match "{query}".',
  blogSearchEmpty: "No articles published yet. Check back soon!",
  faqShowNumbers: true,
};

// ---- Blog Banner ----
// ---- Blog Hero (full-width banner) ----
// The blog landing page's hero. Stored as its own jhb_content document
// ("blog_hero" + "blog_hero_draft") for Save-Draft / Publish isolation. Fully
// CMS-managed — image, badge, heading, overlay, height, alignment and radius are
// all editable; nothing is hardcoded (the default image is empty → gradient).
export type BlogHero = {
  enabled: boolean;
  image: string;
  imageAlt: string;
  imageTitle: string;
  imageCaption: string;
  imageDescription: string;
  badge: string;
  heading: string;
  overlayColor: string; // hex
  overlayOpacity: number; // 0–100
  align: "left" | "center" | "right";
  height: number; // desktop px (mobile/tablet scale down responsively)
  borderRadius: number; // bottom-corner radius in px
};

export const BLOG_HERO_DEFAULT: BlogHero = {
  enabled: true,
  image: "",
  imageAlt: "",
  imageTitle: "",
  imageCaption: "",
  imageDescription: "",
  badge: "INSIGHTS",
  heading: "The Blog",
  overlayColor: "#0a0e1a",
  overlayOpacity: 50,
  align: "left",
  height: 560,
  borderRadius: 24,
};

// ---- Blog Article Hero (full-width banner on each /blog/[slug] article) ----
// Global appearance config (its own jhb_content document "blog_article_hero" +
// "blog_article_hero_draft" for Save-Draft / Publish isolation). Only the
// BACKGROUND + overlay/height/radius are editable here; the breadcrumb, title,
// badge (category), author, date and reading time are pulled from each post
// automatically and are never edited here. Replaces the old featured image.
// Supports separate desktop/tablet/mobile backgrounds for responsive art.
export type BlogArticleHero = {
  enabled: boolean;
  imageDesktop: string;
  imageTablet: string;
  imageMobile: string;
  imageAlt: string; // SEO/accessibility for the background image
  overlayColor: string; // hex
  overlayOpacity: number; // 0–100
  height: number; // desktop px (mobile/tablet scale down responsively)
  borderRadius: number; // bottom-corner radius in px
};

export const BLOG_ARTICLE_HERO_DEFAULT: BlogArticleHero = {
  enabled: true,
  imageDesktop: "",
  imageTablet: "",
  imageMobile: "",
  imageAlt: "",
  overlayColor: "#0a0e1a",
  overlayOpacity: 55,
  height: 460,
  borderRadius: 24,
};

// ---- Author & Publisher (SEO only) ----
// Powers E-E-A-T / Schema.org structured data (Person + Organization) — NEVER
// rendered as a visible section on the site. One jhb_content document
// ("author_publisher" + draft) holds GLOBAL defaults plus optional per-page
// overrides keyed by route. No migration (jhb_content already exists).
export type SeoAuthor = {
  name: string;
  jobTitle: string;
  profileUrl: string;
  image: string;
  bio: string;
  email: string;
};
export type SeoPublisher = {
  name: string;
  logo: string;
  website: string;
  orgType: string; // Schema.org @type, e.g. "Organization", "LocalBusiness"
  description: string;
};
export type AuthorPublisher = { author: SeoAuthor; publisher: SeoPublisher };
export type PageAuthorPublisher = AuthorPublisher & { useGlobal: boolean };
export type AuthorPublisherDoc = { global: AuthorPublisher; overrides: Record<string, PageAuthorPublisher> };

export const AUTHOR_PUBLISHER_DEFAULT: AuthorPublisher = {
  author: { name: "", jobTitle: "", profileUrl: "", image: "", bio: "", email: "" },
  publisher: { name: "JHB Automations", logo: "", website: "", orgType: "Organization", description: "" },
};

export const AUTHOR_PUBLISHER_DOC_DEFAULT: AuthorPublisherDoc = {
  global: AUTHOR_PUBLISHER_DEFAULT,
  overrides: {},
};

export function withAuthorPublisherDoc(saved: unknown): AuthorPublisherDoc {
  const s = (saved ?? {}) as Partial<AuthorPublisherDoc>;
  const g = (s.global ?? {}) as Partial<AuthorPublisher>;
  return {
    global: {
      author: { ...AUTHOR_PUBLISHER_DEFAULT.author, ...((g.author as Partial<SeoAuthor>) ?? {}) },
      publisher: { ...AUTHOR_PUBLISHER_DEFAULT.publisher, ...((g.publisher as Partial<SeoPublisher>) ?? {}) },
    },
    overrides: s.overrides && typeof s.overrides === "object" ? (s.overrides as Record<string, PageAuthorPublisher>) : {},
  };
}

// The effective author/publisher for a route: a page override (when present and
// not set to "use global") wins; otherwise the global values.
export function effectiveAuthorPublisher(doc: AuthorPublisherDoc, path: string): AuthorPublisher {
  const o = doc.overrides[path];
  if (o && o.useGlobal === false) {
    return {
      author: { ...doc.global.author, ...o.author },
      publisher: { ...doc.global.publisher, ...o.publisher },
    };
  }
  return doc.global;
}

// ---- Legal pages (Privacy Policy + Terms & Conditions) ----
// Both live in one jhb_content document ("legal" + "legal_draft") for true
// Save-Draft / Publish isolation. Content is fully CMS-managed — the public
// pages render entirely from here (no hardcoded body). Routes are fixed
// (/privacy-policy, /terms-and-conditions); `slug` feeds the canonical URL.
export type LegalDoc = {
  enabled: boolean;
  title: string;
  slug: string;
  lastUpdated: string; // free-text date, e.g. "27 June 2026"
  contentHtml: string;
  seoTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  structuredData: string; // JSON-LD string
};

export type LegalPages = {
  privacy: LegalDoc;
  terms: LegalDoc;
};

const PRIVACY_DEFAULT_HTML = `
<p>This Privacy Policy explains how JHB Automations ("we", "us", "our") collects, uses and protects your information when you visit our website or use our services.</p>
<h2>Introduction</h2>
<p>We are committed to protecting your privacy. By using our website you agree to the practices described in this policy.</p>
<h2>Information We Collect</h2>
<ul><li>Information you provide directly — name, email, phone and message when you contact us or request a quote.</li><li>Technical data — IP address, browser type, device and pages visited.</li><li>Usage data collected through cookies and analytics.</li></ul>
<h2>How We Use Your Information</h2>
<ul><li>To respond to enquiries and provide our services.</li><li>To improve our website, content and customer experience.</li><li>To send updates or marketing where you have consented.</li></ul>
<h2>Cookies</h2>
<p>We use cookies to remember preferences and understand how the site is used. You can disable cookies in your browser settings, though some features may not work as intended.</p>
<h2>Analytics</h2>
<p>We use analytics tools to measure traffic and engagement. These tools may collect anonymised usage data to help us improve the site.</p>
<h2>Third-Party Services</h2>
<p>We may use trusted third-party providers (e.g. hosting, analytics, payment and communication tools). They only receive the data needed to perform their service and are required to protect it.</p>
<h2>Data Security</h2>
<p>We apply reasonable technical and organisational measures to protect your data. No method of transmission over the internet is 100% secure, but we work to safeguard your information.</p>
<h2>User Rights</h2>
<p>You may request access to, correction of, or deletion of your personal data. To exercise these rights, contact us using the details below.</p>
<h2>Children's Privacy</h2>
<p>Our services are not directed at children under 13, and we do not knowingly collect their personal information.</p>
<h2>Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. The latest version will always be available on this page with its updated date.</p>
<h2>Contact Information</h2>
<p>If you have any questions about this Privacy Policy, contact us at <a href="mailto:jhbautomations@gmail.com">jhbautomations@gmail.com</a>.</p>
`.trim();

const TERMS_DEFAULT_HTML = `
<p>These Terms & Conditions govern your use of the JHB Automations website and services. By accessing our site you agree to these terms.</p>
<h2>Acceptance of Terms</h2>
<p>By using this website or our services, you confirm that you accept these terms and agree to comply with them.</p>
<h2>Services</h2>
<p>We provide AI automation, web development and digital-marketing services. Service scope, deliverables and timelines are agreed separately for each engagement.</p>
<h2>User Responsibilities</h2>
<ul><li>Provide accurate information when contacting us.</li><li>Use the website lawfully and not attempt to disrupt or misuse it.</li><li>Respect the rights of other users and third parties.</li></ul>
<h2>Intellectual Property</h2>
<p>All content on this website — text, graphics, logos and design — is owned by JHB Automations or its licensors and may not be reused without permission.</p>
<h2>Payments</h2>
<p>Where services are paid, payment terms, amounts and schedules are set out in the relevant proposal or invoice. Late or non-payment may result in suspension of services.</p>
<h2>Limitation of Liability</h2>
<p>To the maximum extent permitted by law, we are not liable for indirect or consequential losses arising from the use of our website or services.</p>
<h2>Third-Party Links</h2>
<p>Our website may link to third-party sites. We are not responsible for their content, policies or practices.</p>
<h2>Termination</h2>
<p>We may suspend or terminate access to our website or services if these terms are breached.</p>
<h2>Governing Law</h2>
<p>These terms are governed by the laws of India, and disputes are subject to the jurisdiction of the courts of Salem, Tamil Nadu.</p>
<h2>Changes to Terms</h2>
<p>We may update these terms from time to time. The current version will always be available on this page with its updated date.</p>
<h2>Contact Information</h2>
<p>For questions about these Terms & Conditions, contact us at <a href="mailto:jhbautomations@gmail.com">jhbautomations@gmail.com</a>.</p>
`.trim();

export const LEGAL_DEFAULT: LegalPages = {
  privacy: {
    enabled: true,
    title: "Privacy Policy",
    slug: "privacy-policy",
    lastUpdated: "",
    contentHtml: PRIVACY_DEFAULT_HTML,
    seoTitle: "Privacy Policy — JHB Automations",
    metaDescription: "How JHB Automations collects, uses and protects your personal information.",
    metaKeywords: "privacy policy, data protection, JHB Automations",
    canonical: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    structuredData: "",
  },
  terms: {
    enabled: true,
    title: "Terms & Conditions",
    slug: "terms-and-conditions",
    lastUpdated: "",
    contentHtml: TERMS_DEFAULT_HTML,
    seoTitle: "Terms & Conditions — JHB Automations",
    metaDescription: "The terms and conditions governing the use of JHB Automations' website and services.",
    metaKeywords: "terms and conditions, terms of service, JHB Automations",
    canonical: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    structuredData: "",
  },
};

// Deep-merge a stored legal document over the defaults so new fields always exist.
export function withLegalDefaults(saved: unknown): LegalPages {
  const s = (saved ?? {}) as Partial<LegalPages>;
  return {
    privacy: { ...LEGAL_DEFAULT.privacy, ...((s.privacy as Partial<LegalDoc>) ?? {}) },
    terms: { ...LEGAL_DEFAULT.terms, ...((s.terms as Partial<LegalDoc>) ?? {}) },
  };
}
