// "JHB Products" — client-safe types + seeded defaults.
// One editable document in jhb_content ("products"). Products can carry rich
// content (overview, feature sections, pricing, FAQs) rendered by the reusable
// /products/[slug] page — so new products are added from the admin, no code.

import type { PageContainer } from "./containers";

// ─── Visibility (`hidden`) — the ONE convention ──────────────────────────────
// Every section and every repeated card below carries an OPTIONAL
// `hidden?: boolean`, matching the page-builder containers' `Base.hidden`.
// Absent/false = SHOWN. That polarity is deliberate and load-bearing: content
// saved before this field existed has no such key, so it stays visible with no
// migration and nothing currently live disappears on deploy. Never invert this
// to `enabled`/`visible`, which would make every pre-existing record hidden.
// Section flags and card flags are independent: hiding a section hides it
// whatever its cards say; hiding a card removes only that card.
export type ProductFeature = { title: string; desc: string; hidden?: boolean };
// `linksHidden` powers the "Show section link" toggle. These sections carry no
// href/button field — the only links they can contain are ones the admin typed
// inside the rich text — so turning it off strips those anchors (keeping the
// words) rather than blanking a field. Absent/false = links shown, so every
// section already saved keeps its links. `hidden` is separate and hides the
// whole section.
export type ProductSection = { title: string; subtitle: string; items: ProductFeature[]; hidden?: boolean; linksHidden?: boolean };
export type PricingPlan = {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted: boolean;
  ctaLabel: string;
  ctaHref: string;
  hidden?: boolean;
};
export type ProductFaq = { question: string; answer: string; hidden?: boolean };
export type ProductStat = { value: string; label: string; hidden?: boolean };

/** Members of a list that are not hidden. Absent `hidden` = shown. */
export const visibleItems = <T extends { hidden?: boolean }>(list: T[] | null | undefined): T[] =>
  (Array.isArray(list) ? list : []).filter((i) => !i.hidden);

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
  // Per-section visibility (see the `hidden` convention above). Absent = shown.
  heroHidden?: boolean;
  overviewHidden?: boolean;
  statsHidden?: boolean;
  featuresHidden?: boolean;
  benefitsHidden?: boolean;
  ctaHidden?: boolean;
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
  // Optional so every product saved before this field existed still loads.
  metaKeywords?: string;
  ogImage: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  status: "draft" | "published";
  sortOrder: number;
  // Per-section visibility (see the `hidden` convention above). Absent = shown.
  heroHidden?: boolean;
  overviewHidden?: boolean;
  pricingHidden?: boolean;
  faqsHidden?: boolean;
  ctaHidden?: boolean;
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
      title: "JHB HR Management System",
      slug: "jhb-automation-tools",
      description:
        "CRM, lead management, marketing, WhatsApp, workflow and AI automation tools — one hub to centralise customers, automate follow-ups and grow.",
      href: "/jhb-automation-tools",
      metaTitle: "JHB HR Management System — CRM, Lead Management & Workflow Automation",
      metaDescription:
        "Explore JHB HR Management System: CRM software, lead management, marketing, WhatsApp and workflow automation, and AI business tools.",
      ogTitle: "JHB HR Management System — Business Automation Hub",
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
    {
      ...PRODUCT_DEFAULTS,
      id: "jhb-clinic-management-system",
      title: "JHB Clinic Management System",
      slug: "jhb-clinic-management-system",
      highlight: "smarter clinic operations, simplified",
      description:
        "A complete clinic management platform — schedule appointments, manage patient records, handle billing, and keep doctors and staff coordinated, all from one system built for busy clinics.",
      overview:
        "JHB Clinic Management System is an all-in-one platform built for clinics, diagnostic centres and small hospitals to run day-to-day operations without the chaos of paper files and scattered spreadsheets. Manage patient records, appointments, billing and staff schedules from a single dashboard, so the front desk, doctors and admin team always see the same up-to-date picture, with the reporting needed to keep the practice running smoothly.",
      href: "",
      sections: [
        {
          title: "Patient Management",
          subtitle: "Keep every patient record organised and instantly accessible.",
          items: [
            { title: "Patient Records", desc: "A complete digital record for every patient — history, visits, prescriptions and notes in one place." },
            { title: "Digital Registration", desc: "Register new patients in seconds with a simple, guided intake form." },
            { title: "Medical History Tracking", desc: "See a full visit and treatment history at a glance before every consultation." },
            { title: "Document Storage", desc: "Attach lab reports, prescriptions and scans directly to a patient profile." },
          ],
        },
        {
          title: "Appointment Scheduling",
          subtitle: "Reduce no-shows and keep doctor calendars organised.",
          items: [
            { title: "Online Booking", desc: "Patients book available slots online, with instant confirmation." },
            { title: "Doctor Calendars", desc: "A clear, conflict-free calendar for every doctor across departments." },
            { title: "Automated Reminders", desc: "SMS and WhatsApp reminders that cut down missed appointments." },
            { title: "Queue Management", desc: "A digital token and queue system so patients know the expected wait time." },
          ],
        },
        {
          title: "Billing & Invoicing",
          subtitle: "Get paid accurately, every time, without the manual paperwork.",
          items: [
            { title: "Invoice Generation", desc: "Generate itemised invoices for consultations, tests and procedures instantly." },
            { title: "Payment Tracking", desc: "Record cash, card, UPI and insurance payments with real-time balance updates." },
            { title: "Insurance Claims", desc: "Track insurance-linked bills and claim status without leaving the system." },
            { title: "Financial Reports", desc: "Daily, weekly and monthly revenue summaries ready for accounting." },
          ],
        },
        {
          title: "Doctor & Staff Management",
          subtitle: "Run a coordinated clinical and admin team.",
          items: [
            { title: "Staff Scheduling", desc: "Plan doctor and staff shifts, leave and department assignments." },
            { title: "Role-Based Access", desc: "Give doctors, front desk and admin exactly the access they need, nothing more." },
            { title: "Department Management", desc: "Organise the clinic into departments with their own doctors and schedules." },
            { title: "Performance Overview", desc: "See patient load and appointment volume per doctor at a glance." },
          ],
        },
        {
          title: "Reports & Analytics",
          subtitle: "Make decisions backed by real clinic data.",
          items: [
            { title: "Patient Analytics", desc: "Track new vs returning patients, visit trends and peak hours." },
            { title: "Revenue Reports", desc: "See revenue by department, doctor or service, over any period." },
            { title: "Appointment Reports", desc: "Monitor booking volume, cancellations and no-show rates." },
            { title: "Exports", desc: "Export any report to Excel or PDF for audits and management reviews." },
          ],
        },
      ],
      pricing: [
        {
          name: "Starter",
          price: "₹1,499",
          period: "/month",
          features: ["Up to 2 doctors", "Patient records and registration", "Appointment scheduling", "Basic billing", "Email support"],
          highlighted: false,
          ctaLabel: "Book a Demo",
          ctaHref: "/#contact",
        },
        {
          name: "Growth",
          price: "₹3,999",
          period: "/month",
          features: ["Up to 8 doctors", "Everything in Starter", "Automated reminders", "Insurance claim tracking", "Staff scheduling", "Advanced reports", "Priority support"],
          highlighted: true,
          ctaLabel: "Book a Demo",
          ctaHref: "/#contact",
        },
        {
          name: "Enterprise",
          price: "Custom",
          period: "",
          features: ["Unlimited doctors", "Everything in Growth", "Multi-branch support", "Custom integrations", "Dedicated onboarding", "Dedicated account manager"],
          highlighted: false,
          ctaLabel: "Contact Sales",
          ctaHref: "/#contact",
        },
      ],
      faqs: [
        { question: "What is JHB Clinic Management System?", answer: "JHB Clinic Management System is a clinic management platform that helps clinics, diagnostic centres and small hospitals manage patient records, appointments, billing and staff, all from one system." },
        { question: "Who is JHB Clinic Management System for?", answer: "It is built for clinics, diagnostic centres, polyclinics and small hospitals that want to move away from paper records and scattered spreadsheets." },
        { question: "Can patients book appointments online?", answer: "Yes. Patients can view available slots and book online, with automated SMS and WhatsApp reminders to reduce no-shows." },
        { question: "Does it handle billing and insurance?", answer: "Yes. Generate itemised invoices, track cash, card, UPI and insurance payments, and monitor insurance claim status in one place." },
        { question: "Can multiple doctors and departments be managed?", answer: "Yes. Each doctor gets an individual calendar, and the clinic can be organised into departments with role-based access for staff." },
        { question: "Is patient data secure?", answer: "Yes. Patient records are centralised and protected with role-based access, so only authorised staff can view sensitive information." },
        { question: "Can I generate reports for my clinic?", answer: "Yes. Get patient, revenue and appointment reports by day, week, month, doctor or department, exportable to Excel or PDF." },
        { question: "How long does it take to get started?", answer: "Most clinics are up and running quickly. Setup, data import where possible, and staff training are handled as part of onboarding." },
      ],
      metaTitle: "JHB Clinic Management System — Patient, Appointment and Billing Software",
      metaDescription:
        "JHB Clinic Management System is clinic management software for clinics, diagnostic centres and small hospitals — manage patient records, appointments, billing and staff in one platform.",
      ogTitle: "JHB Clinic Management System — Clinic Operations, Simplified",
      ogDescription:
        "Manage patients, appointments, doctors, billing and reports in one system. Book a free demo.",
      status: "published",
      sortOrder: 2,
      about: {
        heroTitle: "About JHB Clinic Management System",
        heroDescription:
          "JHB Clinic Management System was built to take the chaos out of running a clinic, replacing paper files, missed follow-ups and scattered spreadsheets with one clear system the front desk, doctors and admin team can rely on.",
        image: null,
        imageAlt: "",
        overview:
          "Clinics lose time and revenue not because care is not good, but because records are scattered, appointments clash, and billing falls behind. JHB Clinic Management System closes that gap, giving clinics, diagnostic centres and small hospitals a single source of truth for every patient, appointment and rupee billed, with the visibility and automation needed to run a tighter, more profitable practice.",
        features: [
          { title: "Built for Clinics", desc: "Designed around how clinics actually run — fast patient intake, clear doctor calendars and simple billing." },
          { title: "Organised by Design", desc: "Every patient record, appointment and invoice lives in one searchable system, not scattered files." },
          { title: "Made to Scale", desc: "From a single-doctor clinic to a multi-department, multi-branch practice, on the same platform." },
          { title: "Local-Friendly", desc: "Supports the billing, insurance and communication patterns common across Indian clinics." },
        ],
        benefits: [
          { title: "Fewer No-Shows", desc: "Automated reminders keep patients showing up, protecting doctor time." },
          { title: "Total Visibility", desc: "See appointments, revenue and patient load for the day without chasing anyone." },
          { title: "Less Manual Work", desc: "Auto-generated invoices, reminders and reports replace hours of paperwork." },
          { title: "Confident Decisions", desc: "Real-time analytics show exactly where the clinic needs attention next." },
        ],
        stats: [
          { value: "2x", label: "Faster Patient Check-In" },
          { value: "-30%", label: "Fewer No-Shows" },
          { value: "100%", label: "Digital Patient Records" },
          { value: "24/7", label: "Access From Anywhere" },
        ],
        ctaHeading: "See JHB Clinic Management System in action",
        ctaText:
          "Book a free, no-obligation demo and see how it fits the way the clinic already runs.",
        ctaButtonLabel: "Book a Free Demo",
        ctaButtonHref: "/#contact",
        metaTitle: "About JHB Clinic Management System — Clinic Software Built for Everyday Practice",
        metaDescription:
          "Learn how JHB Clinic Management System helps clinics and small hospitals run smoother with organised patient records, automated reminders and real-time billing visibility.",
        ogImage: "",
        ogTitle: "About JHB Clinic Management System",
        ogDescription:
          "Why JHB Clinic Management System exists, how it works, and the results it drives for clinics.",
        canonical: "",
      },
    },
    {
      ...PRODUCT_DEFAULTS,
      id: "jhb-operations",
      title: "JHB Operations",
      slug: "jhb-operations",
      highlight: "every moving part, under control",
      description:
        "An operations platform that brings workflows, tasks, teams and approvals into one place — so work moves on schedule, nothing gets dropped, and you can see exactly where every job stands.",
      overview:
        "JHB Operations is an all-in-one operations management platform for businesses whose work spans multiple people, steps and sites. Standardise how work gets done with repeatable workflows, assign and track every task to an owner and a deadline, route approvals automatically, and see live status across the whole operation from one dashboard. No more chasing updates on WhatsApp, rebuilding the same spreadsheet each month, or discovering a missed step after the customer does.",
      href: "",
      sections: [
        {
          title: "Operations Management",
          subtitle: "One place to run the whole operation.",
          items: [
            { title: "Central Dashboard", desc: "Live status of every job, team and site on a single screen." },
            { title: "SOP Library", desc: "Standard operating procedures stored once and reused on every job." },
            { title: "Resource Planning", desc: "Plan people, equipment and capacity before the work starts." },
            { title: "Multi-Site Support", desc: "Run several branches or sites from one account, with their own teams." },
          ],
        },
        {
          title: "Workflow & Process Automation",
          subtitle: "Standardise the work, then let the system move it along.",
          items: [
            { title: "Workflow Builder", desc: "Lay out each process step by step, with owners and due dates." },
            { title: "Approval Chains", desc: "Route approvals to the right person automatically, in the right order." },
            { title: "Automated Handoffs", desc: "The next stage opens the moment the previous one is signed off." },
            { title: "Escalation Rules", desc: "Overdue work escalates on its own, so nothing quietly stalls." },
          ],
        },
        {
          title: "Task & Team Coordination",
          subtitle: "Everyone knows what they own and what is next.",
          items: [
            { title: "Task Assignment", desc: "Assign work to a person with a clear deadline and priority." },
            { title: "Shift & Roster Planning", desc: "Plan shifts and duty rosters, and see who is available." },
            { title: "Team Workload", desc: "Spot who is overloaded and rebalance before deadlines slip." },
            { title: "Checklists", desc: "Step-by-step checklists so every job is completed the same way." },
          ],
        },
        {
          title: "Tracking & Compliance",
          subtitle: "A verifiable record of what happened, and when.",
          items: [
            { title: "Real-Time Status", desc: "See exactly which stage every job is in, without asking anyone." },
            { title: "Audit Trail", desc: "Every action timestamped against the person who performed it." },
            { title: "Issue Logging", desc: "Raise, assign and close operational issues against the job." },
            { title: "Document Control", desc: "Attach and version the documents each job depends on." },
          ],
        },
        {
          title: "Reports & Analytics",
          subtitle: "Run the operation on numbers, not impressions.",
          items: [
            { title: "Operations Dashboard", desc: "Throughput, on-time completion and workload at a glance." },
            { title: "Productivity Reports", desc: "Compare output by team, site or period over any date range." },
            { title: "Bottleneck Analysis", desc: "Find the stage where work consistently piles up." },
            { title: "Exports", desc: "Export any report to Excel or PDF for reviews and audits." },
          ],
        },
      ],
      pricing: [
        {
          name: "Starter",
          price: "₹1,999",
          period: "/month",
          features: ["Up to 10 users", "Task and checklist management", "Basic workflows", "Operations dashboard", "Email support"],
          highlighted: false,
          ctaLabel: "Book a Demo",
          ctaHref: "/#contact",
        },
        {
          name: "Growth",
          price: "₹4,999",
          period: "/month",
          features: ["Up to 50 users", "Everything in Starter", "Approval chains and escalations", "Shift and roster planning", "Audit trail", "Advanced reports and exports", "Priority support"],
          highlighted: true,
          ctaLabel: "Book a Demo",
          ctaHref: "/#contact",
        },
        {
          name: "Enterprise",
          price: "Custom",
          period: "",
          features: ["Unlimited users", "Everything in Growth", "Multi-site operations", "Custom workflows and integrations", "Dedicated onboarding", "Dedicated account manager"],
          highlighted: false,
          ctaLabel: "Contact Sales",
          ctaHref: "/#contact",
        },
      ],
      faqs: [
        { question: "What is JHB Operations?", answer: "JHB Operations is an operations management platform that brings workflows, tasks, teams, approvals and reporting into one system, so work moves on schedule and nothing gets dropped between people or stages." },
        { question: "Who is JHB Operations for?", answer: "It is built for businesses whose work runs across multiple people, steps or sites — service teams, field operations, manufacturing and processing units, and back-office teams that depend on repeatable processes." },
        { question: "How is it different from a task app?", answer: "A task app tracks to-dos. JHB Operations models the whole process: each stage has an owner, approvals route automatically, overdue work escalates, and every action is recorded for audit." },
        { question: "Can we build our own workflows?", answer: "Yes. Lay out each process step by step with owners, deadlines and approvals, and reuse it for every job of that type so the work is done the same way every time." },
        { question: "Does it handle approvals?", answer: "Yes. Approvals route to the right person in the right order, and the next stage only opens once the previous one is signed off." },
        { question: "Can we manage more than one location?", answer: "Yes. Run multiple branches or sites from one account, each with its own teams and schedules, while management keeps a consolidated view." },
        { question: "What reports do we get?", answer: "Throughput, on-time completion, productivity by team or site, and bottleneck analysis showing where work piles up — all exportable to Excel or PDF." },
        { question: "How long does it take to get started?", answer: "Most teams are running quickly. Setup covers mapping your existing processes into workflows, importing your team, and training — the timeline depends on how many processes you start with." },
      ],
      metaTitle: "JHB Operations — Workflow, Task and Operations Management Software",
      metaDescription:
        "JHB Operations is operations management software for growing businesses — build workflows, assign and track tasks, route approvals, coordinate teams across sites, and report on throughput in real time.",
      ogTitle: "JHB Operations — Business Operations, Under Control",
      ogDescription:
        "Workflows, tasks, approvals, teams and reporting in one operations platform. Book a free demo.",
      status: "published",
      sortOrder: 3,
      about: {
        heroTitle: "About JHB Operations",
        heroDescription:
          "JHB Operations was built for the moment a business outgrows spreadsheets and group chats — when the work is still getting done, but nobody can say with confidence where any of it stands.",
        image: null,
        imageAlt: "",
        overview:
          "Operations rarely break because people stop working. They break because a step is skipped, an approval sits unread, or the only person who knew the process is on leave. JHB Operations closes those gaps by making the process itself the system: every job follows a defined workflow, every stage has an owner and a deadline, approvals move on their own, and management can see live status without chasing a single update.",
        features: [
          { title: "Process-First", desc: "The workflow is the product — jobs follow a defined path instead of living in someone's head." },
          { title: "Accountable by Design", desc: "Every stage has a named owner and a timestamped record of what was done." },
          { title: "Built to Scale", desc: "From one team to multiple sites and departments, on the same platform." },
          { title: "Practical to Adopt", desc: "Designed around how teams already work, so rollout does not stall on training." },
        ],
        benefits: [
          { title: "Fewer Dropped Jobs", desc: "Automated handoffs and escalations mean work cannot quietly stall." },
          { title: "Total Visibility", desc: "See the live status of every job without asking anyone for an update." },
          { title: "Less Manual Follow-Up", desc: "Reminders, approvals and reports run themselves instead of chasing people." },
          { title: "Confident Decisions", desc: "Real throughput and bottleneck data shows exactly where to act next." },
        ],
        stats: [
          { value: "2x", label: "Faster Handoffs" },
          { value: "+35%", label: "On-Time Completion" },
          { value: "100%", label: "Audit-Tracked Actions" },
          { value: "24/7", label: "Live Operations View" },
        ],
        ctaHeading: "See JHB Operations in action",
        ctaText:
          "Book a free, no-obligation demo and we'll map one of your existing processes into the system so you can see it working on your own operation.",
        ctaButtonLabel: "Book a Free Demo",
        ctaButtonHref: "/#contact",
        metaTitle: "About JHB Operations — Operations Management Built Around Your Process",
        metaDescription:
          "Learn how JHB Operations helps growing businesses standardise processes, keep every job accountable to an owner and a deadline, and see live operational status without chasing updates.",
        ogImage: "",
        ogTitle: "About JHB Operations",
        ogDescription:
          "Why JHB Operations exists, how it works, and the results it drives for operations teams.",
        canonical: "",
      },
    },
  ],
};

// Apply per-product defaults so saved docs missing newer fields still render.
export function withDefaults(p: Partial<Product> & { id: string; title: string; slug: string }): Product {
  return { ...PRODUCT_DEFAULTS, ...p, about: { ...ABOUT_DEFAULT, ...(p.about ?? {}) } } as Product;
}
