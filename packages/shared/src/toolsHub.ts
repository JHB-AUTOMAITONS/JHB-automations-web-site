// "JHB Automation Tools" hub — client-safe types + seeded defaults.
// The whole hub is one editable document stored in jhb_content ("tools_hub").

import type { PageContainer } from "./containers";

// ─── Visibility (`hidden`) — same convention as page-builder containers ──────
// Every section flag and every card below is an OPTIONAL `hidden?: boolean`.
// Absent/false = SHOWN. That polarity is deliberate: content saved before this
// field existed has no such key, so it stays visible with no migration. It
// matters doubly here because toolsHub.server.ts shallow-merges only the top
// level, so a saved `sections` object replaces the default wholesale — with an
// `enabled` flag every guard would need `!== false` and one miss would blank a
// live section. Never invert this.
export type ToolCategory = {
  id: string;
  title: string;
  desc: string;
  icon: string; // Icon component key (crm, flow, rocket, chat, settings, spark, app…)
  image: string | null;
  hidden?: boolean;
};
export type CrmFeature = { title: string; desc: string; hidden?: boolean };
export type HubBenefit = { title: string; desc: string; hidden?: boolean };
export type ToolsHubFaq = { question: string; answer: string; hidden?: boolean };

export type ToolsHub = {
  hero: {
    badge: string;
    heading: string;
    highlight: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
    image: string | null;
  };
  categories: ToolCategory[];
  crm: {
    heading: string;
    overviewHtml: string; // rich text
    features: CrmFeature[];
    benefits: string[];
    workflow: string[]; // ordered workflow steps
  };
  benefits: HubBenefit[];
  faqs: ToolsHubFaq[];
  cta: { heading: string; text: string; buttonLabel: string; buttonHref: string };
  // Editable section labels (eyebrows + split headings) for the hub's native
  // sections. The body content lives in the fields above; these are the chrome.
  sections: {
    categoriesEyebrow: string;
    categoriesHeadingLead: string;
    categoriesHeadingHighlight: string;
    crmEyebrow: string; // CRM section eyebrow ("Flagship Tool")
    crmWorkflowHeading: string;
    crmBenefitsHeading: string;
    benefitsEyebrow: string;
    benefitsHeadingLead: string;
    benefitsHeadingHighlight: string;
    otherToolsEyebrow: string;
    otherToolsHeadingLead: string;
    otherToolsHeadingHighlight: string;
    // Per-section visibility. Absent = shown (see the note above).
    heroHidden?: boolean;
    categoriesHidden?: boolean;
    crmHidden?: boolean; // parent — also suppresses the three CRM sub-blocks
    crmFeaturesHidden?: boolean;
    crmWorkflowHidden?: boolean;
    crmBenefitsHidden?: boolean;
    otherToolsHidden?: boolean;
    benefitsHidden?: boolean;
    faqsHidden?: boolean;
    ctaHidden?: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    // Optional so a hub saved before this field existed still loads.
    metaKeywords?: string;
    ogTitle: string;
    ogDescription: string;
  };
  // Page-builder containers inserted between the hub page's native sections.
  containers?: PageContainer[];
};

export const TOOLS_HUB_DEFAULT: ToolsHub = {
  hero: {
    badge: "Automation Tools Hub",
    heading: "Every automation tool your business needs,",
    highlight: "in one place",
    description:
      "JHB Automation Tools brings your leads, customers, marketing and workflows together — so you can capture every opportunity, automate the busywork, and grow without the manual grind. Explore our suite of business automation solutions below.",
    ctaLabel: "Contact Us",
    ctaHref: "/#contact",
    image: null,
  },
  categories: [
    { id: "crm", title: "CRM Software", desc: "Centralise leads, contacts and deals — and automate every follow-up.", icon: "crm", image: null },
    { id: "lead-management", title: "Lead Management Tools", desc: "Capture, score and route leads from every channel automatically.", icon: "flow", image: null },
    { id: "marketing-automation", title: "Marketing Automation Tools", desc: "Email, ads and campaigns that nurture prospects on autopilot.", icon: "rocket", image: null },
    { id: "whatsapp-automation", title: "WhatsApp Automation Tools", desc: "Instant, personal WhatsApp replies and follow-up sequences.", icon: "chat", image: null },
    { id: "workflow-automation", title: "Workflow Automation Tools", desc: "Connect your apps and remove repetitive manual steps.", icon: "settings", image: null },
    { id: "ai-business", title: "AI Business Tools", desc: "AI assistants, chatbots and insights that work around the clock.", icon: "spark", image: null },
    { id: "future-tools", title: "Future Tools", desc: "New automation solutions added as your business scales.", icon: "app", image: null },
  ],
  crm: {
    heading: "CRM Software",
    overviewHtml:
      "<p>Our CRM software gives your business one organised home for every lead, contact and conversation — so nothing slips through the cracks. Capture enquiries from any channel, automate follow-ups, move deals through a visual pipeline, and see exactly where your revenue comes from.</p>",
    features: [
      { title: "Lead Management", desc: "Capture leads from your website, ads, WhatsApp and calls into one inbox — auto-assigned and prioritised so none are missed." },
      { title: "Contact Management", desc: "A complete, searchable profile for every customer — details, history and notes organised in one place." },
      { title: "Sales Pipeline Tracking", desc: "A visual, drag-and-drop pipeline that shows which deals are hot and exactly what to do next." },
      { title: "Follow-Up Automation", desc: "Automated reminders, emails and WhatsApp sequences so every lead is followed up on time, every time." },
      { title: "Customer Communication History", desc: "Every call, email and message logged against the contact — full context the moment you open it." },
      { title: "Team Collaboration", desc: "Shared notes, clear ownership and clean handoffs that keep sales and support on the same page." },
      { title: "Workflow Automation", desc: "Trigger tasks, hand-offs and notifications automatically as deals progress." },
      { title: "Reporting & Analytics", desc: "Real-time dashboards on leads, conversion rates and revenue so decisions are backed by data." },
    ],
    benefits: [
      "Respond to new leads in minutes, not days",
      "A more personal, consistent customer experience",
      "Higher conversion from disciplined follow-up",
      "More productive teams with far less manual tracking",
      "All customer data centralised, secure and searchable",
      "Confident decisions backed by real-time reporting",
    ],
    workflow: [
      "Lead Capture",
      "Lead Qualification",
      "Follow-Up Automation",
      "Sales Pipeline",
      "Deal Closure",
      "Customer Retention",
    ],
  },
  benefits: [
    { title: "Centralised Customer Data", desc: "One secure source of truth for every lead, customer and conversation." },
    { title: "Automated Follow-Ups", desc: "Never lose a lead to a missed follow-up again — the system handles it." },
    { title: "Sales Pipeline Visibility", desc: "See every deal and its stage at a glance, in real time." },
    { title: "Higher Productivity", desc: "Cut hours of manual admin so your team focuses on closing." },
    { title: "Better Customer Relationships", desc: "Faster, more personal communication backed by full history." },
    { title: "Scalable Business Growth", desc: "Automation that grows with you — add tools as your needs evolve." },
  ],
  faqs: [
    { question: "What is CRM software and how does it help my business?", answer: "A CRM (Customer Relationship Management) system is a single place to store every lead, customer and conversation. It helps you respond faster, follow up consistently and see your whole sales pipeline — so you close more deals with less manual work." },
    { question: "Is this CRM suitable for small and growing businesses?", answer: "Yes. It is simple enough for small teams yet powerful enough to scale. Start with lead and contact management, then add automation, reporting and integrations as you grow." },
    { question: "Can it capture leads from my website, ads and WhatsApp automatically?", answer: "Absolutely. Enquiries from website forms, ad campaigns, WhatsApp and calls flow straight into the CRM, where they are automatically assigned and prioritised so nothing is missed." },
    { question: "Does the CRM automate follow-ups?", answer: "Yes. You can set up automated reminders, emails and WhatsApp sequences that follow up with leads on schedule, keeping every prospect engaged without manual effort." },
    { question: "Can I track deals through a sales pipeline?", answer: "Every deal moves through a visual, drag-and-drop pipeline. You can see which opportunities are hot, what stage each is in and what action is needed next, at a glance." },
    { question: "Will my whole team be able to collaborate in the tools?", answer: "Yes. Shared records, notes, task assignments and clear ownership keep sales and support aligned, with a full history of every interaction available to the team." },
    { question: "Can the tools integrate with what I already use?", answer: "We offer integration services to connect the CRM and automation tools with your website, email, WhatsApp, calendars and other business tools, so your data stays in sync." },
    { question: "Is my customer data safe and secure?", answer: "Your data is centralised and protected with secure, role-based access. Information is backed up and only available to the team members you authorise." },
    { question: "How long does it take to set up?", answer: "Most businesses are up and running quickly. We handle implementation, import your existing contacts, configure your pipeline and automations, and train your team. Timelines depend on the complexity of your workflows." },
    { question: "Do you provide training and ongoing support?", answer: "Yes. We provide hands-on onboarding, custom workflow setup and ongoing support so your team gets full value from the tools as your business evolves." },
  ],
  cta: {
    heading: "Ready to automate your business?",
    text: "Get in touch and we will map the right automation tools to your goals — from CRM and lead management to AI and workflow automation.",
    buttonLabel: "Contact Us",
    buttonHref: "/#contact",
  },
  sections: {
    categoriesEyebrow: "Tool Categories",
    categoriesHeadingLead: "Our",
    categoriesHeadingHighlight: "automation suite",
    crmEyebrow: "Flagship Tool",
    crmWorkflowHeading: "CRM Workflow Process",
    crmBenefitsHeading: "Key CRM Benefits",
    benefitsEyebrow: "Why Automate",
    benefitsHeadingLead: "Benefits of",
    benefitsHeadingHighlight: "business automation",
    otherToolsEyebrow: "More Tools",
    otherToolsHeadingLead: "Other",
    otherToolsHeadingHighlight: "automation tools",
  },
  seo: {
    metaTitle: "JHB Automation Tools — CRM, Lead Management & Workflow Automation",
    metaDescription:
      "Explore JHB Automation Tools: CRM software, lead management, marketing and WhatsApp automation, AI business tools and workflow automation — one hub to centralise customers, automate follow-ups and grow.",
    ogTitle: "JHB Automation Tools — Business Automation Hub",
    ogDescription:
      "CRM, lead management, marketing, WhatsApp, workflow and AI automation tools to centralise customers, automate follow-ups and grow your business.",
  },
  containers: [],
};
