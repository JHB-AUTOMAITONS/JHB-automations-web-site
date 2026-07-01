// "JHB Products" — client-safe types + seeded defaults.
// One editable document in jhb_content ("products"). Products can carry rich
// content (overview, feature sections, pricing, FAQs) rendered by the reusable
// /products/[slug] page — so new products are added from the admin, no code.

import type { PageContainer } from "./containers";

export type ProductFeature = { title: string; desc: string };
export type ProductSection = { title: string; subtitle: string; items: ProductFeature[] };
export type PricingPlan = {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted: boolean;
  ctaLabel: string;
  ctaHref: string;
};
export type ProductFaq = { question: string; answer: string };
export type ProductStat = { value: string; label: string };

// "About <Product>" sub-page (always rendered at /products/{slug}/about).
export type ProductAbout = {
  heroTitle: string;
  heroDescription: string;
  image: string | null;
  imageAlt: string;
  overview: string;
  features: ProductFeature[];
  benefits: ProductFeature[];
  stats: ProductStat[];
  ctaHeading: string;
  ctaText: string;
  ctaButtonLabel: string;
  ctaButtonHref: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  ogTitle: string;
  ogDescription: string;
  canonical: string;
  // Page-builder containers inserted between the About page's native sections.
  containers?: PageContainer[];
};

export const ABOUT_DEFAULT: ProductAbout = {
  heroTitle: "",
  heroDescription: "",
  image: null,
  imageAlt: "",
  overview: "",
  features: [],
  benefits: [],
  stats: [],
  ctaHeading: "",
  ctaText: "",
  ctaButtonLabel: "Book a Free Demo",
  ctaButtonHref: "/#contact",
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  ogTitle: "",
  ogDescription: "",
  canonical: "",
  containers: [],
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  highlight: string; // gradient phrase in the hero heading
  description: string; // hero supporting text
  overview: string; // "Product Overview" paragraph
  image: string | null;
  imageAlt: string;
  // Optional link override. If set, the nav links here (e.g. an existing page);
  // if empty, the product renders the rich detail page at /products/{slug}.
  href: string;
  sections: ProductSection[];
  pricing: PricingPlan[];
  faqs: ProductFaq[];
  about: ProductAbout;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  status: "draft" | "published";
  sortOrder: number;
  // Page-builder containers inserted between the product page's native sections.
  containers?: PageContainer[];
};

export type ProductsDoc = { items: Product[] };

export const productHref = (p: Product): string =>
  p.href && p.href.trim() ? p.href.trim() : `/products/${p.slug}`;

// Defaults applied per product so older saved docs never break on new fields.
export const PRODUCT_DEFAULTS: Omit<Product, "id" | "title" | "slug"> = {
  highlight: "",
  description: "",
  overview: "",
  image: null,
  imageAlt: "",
  href: "",
  sections: [],
  pricing: [],
  faqs: [],
  about: ABOUT_DEFAULT,
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  canonical: "",
  ogTitle: "",
  ogDescription: "",
  status: "draft",
  sortOrder: 0,
};

export const PRODUCTS_DEFAULT: ProductsDoc = {
  items: [
    {
      ...PRODUCT_DEFAULTS,
      id: "jhb-automation-tools",
      title: "JHB Automation Tools",
      slug: "jhb-automation-tools",
      description:
        "CRM, lead management, marketing, WhatsApp, workflow and AI automation tools — one hub to centralise customers, automate follow-ups and grow.",
      href: "/jhb-automation-tools",
      metaTitle: "JHB Automation Tools — CRM, Lead Management & Workflow Automation",
      metaDescription:
        "Explore JHB Automation Tools: CRM software, lead management, marketing, WhatsApp and workflow automation, and AI business tools.",
      ogTitle: "JHB Automation Tools — Business Automation Hub",
      ogDescription:
        "CRM, lead management, marketing, WhatsApp, workflow and AI automation tools to grow your business.",
      status: "published",
      sortOrder: 0,
    },
    {
      ...PRODUCT_DEFAULTS,
      id: "vasool-app",
      title: "Vasool App",
      slug: "vasool-app",
      highlight: "loan collection, simplified",
      description:
        "A complete loan management and field-collection app — track loans, schedule collections, manage agents with live GPS, and see every rupee recovered in real time.",
      overview:
        "Vasool App is an all-in-one loan management and collection platform built for finance companies, NBFCs, chit funds and micro-lenders. Digitise your entire lending cycle — from issuing loans and scheduling repayments to dispatching field agents, verifying visits with GPS, and reconciling collections instantly. No more paper registers, missed follow-ups or untraceable cash. Everything your collection team needs, in one app that works even offline.",
      imageAlt: "Vasool App — loan collection management",
      href: "",
      sections: [
        {
          title: "Features",
          subtitle: "Everything you need to manage lending and collections end to end.",
          items: [
            { title: "Loan Management", desc: "Issue, track and close loans with full repayment schedules and balances." },
            { title: "Customer Database", desc: "A complete, searchable profile for every borrower — KYC, history and notes." },
            { title: "Collection Scheduling", desc: "Auto-generated daily collection lists assigned to the right agent." },
            { title: "Payment Tracking", desc: "Record cash, UPI and bank payments with instant balance updates." },
            { title: "Digital Receipts", desc: "Generate and share receipts on the spot via SMS or WhatsApp." },
            { title: "Offline Mode", desc: "Agents keep collecting with no signal — data syncs automatically when back online." },
          ],
        },
        {
          title: "Loan Types",
          subtitle: "Support every product your business offers.",
          items: [
            { title: "Daily Loans", desc: "High-frequency daily-repayment loans for street and market lending." },
            { title: "Weekly Loans", desc: "Flexible weekly EMIs with automatic schedule generation." },
            { title: "Monthly Loans", desc: "Standard monthly EMI loans with interest and penalty handling." },
            { title: "Gold Loans", desc: "Secured gold-backed loans with valuation and pledge tracking." },
            { title: "Personal Loans", desc: "Unsecured personal lending with custom tenures." },
            { title: "Business Loans", desc: "Working-capital loans for shops and small businesses." },
          ],
        },
        {
          title: "Staff Management",
          subtitle: "Run a productive, accountable collection team.",
          items: [
            { title: "Agent Assignment", desc: "Assign borrowers and areas to specific field agents." },
            { title: "Attendance & Check-in", desc: "Track agent attendance and daily start/end with timestamps." },
            { title: "Performance Tracking", desc: "See each agent's targets, collections and recovery rate." },
            { title: "Route Planning", desc: "Optimised daily routes so agents cover more, faster." },
            { title: "Commission & Incentives", desc: "Auto-calculate agent commissions on collected amounts." },
          ],
        },
        {
          title: "GPS Tracking",
          subtitle: "Know exactly where collections happen.",
          items: [
            { title: "Live Agent Location", desc: "See where every field agent is, in real time, on a map." },
            { title: "Visit Verification", desc: "Each collection is geo-stamped to confirm the agent was on-site." },
            { title: "Route History", desc: "Replay an agent's full day — every stop and distance covered." },
            { title: "Geo-fencing", desc: "Get alerts when agents move outside their assigned areas." },
          ],
        },
        {
          title: "Reports & Analytics",
          subtitle: "Make decisions backed by real-time data.",
          items: [
            { title: "Collection Reports", desc: "Daily, weekly and monthly collection summaries at a glance." },
            { title: "Overdue & NPA Reports", desc: "Instantly surface overdue accounts and at-risk loans." },
            { title: "Agent Performance", desc: "Compare agents on collections, visits and recovery rate." },
            { title: "Daily Cash Summary", desc: "Reconcile total cash collected vs deposited, every day." },
            { title: "Exports", desc: "Export any report to Excel/PDF for accounting and audits." },
          ],
        },
      ],
      pricing: [
        {
          name: "Starter",
          price: "₹1,999",
          period: "/month",
          features: ["Up to 3 agents", "Loan & customer management", "Collection scheduling", "Digital receipts", "Basic reports", "Email support"],
          highlighted: false,
          ctaLabel: "Book a Demo",
          ctaHref: "/#contact",
        },
        {
          name: "Growth",
          price: "₹4,999",
          period: "/month",
          features: ["Up to 15 agents", "Everything in Starter", "Live GPS tracking", "Route planning", "Agent performance & commissions", "Advanced reports & exports", "Priority support"],
          highlighted: true,
          ctaLabel: "Book a Demo",
          ctaHref: "/#contact",
        },
        {
          name: "Enterprise",
          price: "Custom",
          period: "",
          features: ["Unlimited agents", "Everything in Growth", "Custom loan products", "API & integrations", "Dedicated onboarding", "Custom reports", "Dedicated account manager"],
          highlighted: false,
          ctaLabel: "Contact Sales",
          ctaHref: "/#contact",
        },
      ],
      faqs: [
        { question: "What is Vasool App?", answer: "Vasool App is a loan management and field-collection platform that helps lenders issue loans, schedule repayments, dispatch agents with GPS tracking, and reconcile collections in real time — all from one app." },
        { question: "Who is Vasool App for?", answer: "It's built for finance companies, NBFCs, chit funds, micro-lenders and anyone running daily, weekly or monthly loan collections with a field team." },
        { question: "Does it work offline?", answer: "Yes. Agents can record collections and generate receipts with no internet; the data syncs automatically the moment they're back online." },
        { question: "Can I track my field agents live?", answer: "Yes. You can see every agent's live location, verify each visit with a geo-stamp, replay route history and set geo-fencing alerts." },
        { question: "What loan types are supported?", answer: "Daily, weekly and monthly EMI loans, plus gold, personal and business loans — each with automatic repayment schedules, interest and penalties." },
        { question: "Can borrowers get receipts?", answer: "Yes. The app generates a digital receipt for every payment, instantly shareable via SMS or WhatsApp." },
        { question: "How are agent commissions handled?", answer: "Commissions and incentives are auto-calculated on collected amounts, so payouts are accurate and transparent." },
        { question: "Can I export reports for accounting?", answer: "Every report — collections, overdue, agent performance, daily cash — can be exported to Excel or PDF for accounting and audits." },
      ],
      metaTitle: "Vasool App — Loan Collection & Field-Agent Management Software",
      metaDescription:
        "Vasool App is loan management and collection software for lenders, NBFCs and chit funds — track loans, schedule collections, manage agents with live GPS, and view recovery reports in real time.",
      ogTitle: "Vasool App — Loan Collection Management, Simplified",
      ogDescription:
        "Manage loans, field agents, GPS-verified collections, pricing and reports in one app. Book a free demo.",
      status: "published",
      sortOrder: 1,
      about: {
        heroTitle: "About Vasool App",
        heroDescription:
          "Vasool App was built to take the chaos out of lending and collections — replacing paper registers and untraceable cash with one clear, accountable system that field teams actually enjoy using.",
        image: "/vasool-logo.png",
        imageAlt: "Vasool Tamil Brand Logo",
        overview:
          "Lenders lose money not because borrowers won't pay, but because follow-ups slip, cash goes unrecorded and managers can't see what's happening in the field. We created Vasool App to close that gap. It gives finance companies, NBFCs, chit funds and micro-lenders a single source of truth for every loan, every agent and every rupee collected — with the live visibility and automation needed to recover more, faster, and with full accountability.",
        features: [
          { title: "Built for the Field", desc: "Designed around how agents actually work — fast entry, digital receipts and full offline support." },
          { title: "Accountable by Design", desc: "Every collection is GPS-verified and timestamped, so cash and visits are always traceable." },
          { title: "Made to Scale", desc: "From a three-person team to hundreds of agents across branches, on the same platform." },
          { title: "Local-Friendly", desc: "Supports daily, weekly and monthly lending models common across Indian markets." },
        ],
        benefits: [
          { title: "Recover More", desc: "Disciplined, automated follow-ups lift on-time recovery and shrink overdue accounts." },
          { title: "Total Visibility", desc: "See live agent locations, daily cash and at-risk loans without chasing anyone." },
          { title: "Less Manual Work", desc: "Auto-generated schedules, receipts and reports replace hours of paperwork." },
          { title: "Confident Decisions", desc: "Real-time analytics show exactly where to focus your team next." },
        ],
        stats: [
          { value: "3x", label: "Faster Follow-Up" },
          { value: "+30%", label: "On-Time Recovery" },
          { value: "100%", label: "GPS-Verified Visits" },
          { value: "24/7", label: "Offline-Ready" },
        ],
        ctaHeading: "See Vasool App in action",
        ctaText:
          "Book a free, no-obligation demo and we'll show you how Vasool App fits the way your lending business already works.",
        ctaButtonLabel: "Book a Free Demo",
        ctaButtonHref: "/#contact",
        metaTitle: "About Vasool App — Loan Collection Software Built for Field Teams",
        metaDescription:
          "Learn how Vasool App helps lenders, NBFCs and chit funds recover more with GPS-verified collections, automated follow-ups and real-time visibility into every loan and agent.",
        ogImage: "",
        ogTitle: "About Vasool App",
        ogDescription:
          "Why Vasool App exists, how it works and the results it drives for lending businesses.",
        canonical: "",
      },
    },
  ],
};

// Apply per-product defaults so saved docs missing newer fields still render.
export function withDefaults(p: Partial<Product> & { id: string; title: string; slug: string }): Product {
  return { ...PRODUCT_DEFAULTS, ...p, about: { ...ABOUT_DEFAULT, ...(p.about ?? {}) } } as Product;
}
