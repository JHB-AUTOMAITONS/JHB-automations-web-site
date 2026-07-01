// Pre-designed, reusable SECTION TEMPLATES that appear as their own selectable
// options inside the SAME "Add Container" popup. Each template instantiates a
// complete, fully-editable PageContainer (a normal container under the hood) —
// so once inserted it supports edit / drag & drop / duplicate / delete /
// save-draft / publish / live preview / responsive rendering exactly like every
// other container. Nothing about it is special downstream.
//
// To add a NEW template later (Why Choose Us, Our Process, Success Stories,
// Pricing Table, Statistics, Team, Client Logos, Contact CTA, any custom
// section), append ONE entry to SECTION_TEMPLATES whose `create(zone)` returns a
// configured PageContainer. It then shows up automatically as another option in
// the popup. Several templates may share one container `type` (e.g. the
// two-column "advantage" design) while supplying different starter content.

import { cid, type PageContainer } from "./containers";

export type SectionTemplate = {
  /** Stable id stored nowhere — used only to look the template up at insert time. */
  id: string;
  /** Shown as the option label in the Add Container popup. */
  label: string;
  /** One-line tooltip describing what the template inserts. */
  description: string;
  /** Builds a fresh, fully-editable container instance for the given zone. */
  create: (zone: string) => PageContainer;
};

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: "jhb-advantage",
    label: "The JHB Advantage",
    description: "Why-choose-us badge, heading, description and an icon checklist (two-column glass card).",
    create: (zone) => ({
      id: cid(),
      zone,
      type: "advantage",
      style: { bg: "none", padding: "md", align: "left" },
      props: {
        badge: "Why Choose Us",
        heading: "The JHB",
        highlight: "Advantage",
        description:
          "We don't just deliver — we deliver measurable business growth, with full transparency at every step.",
        items: [
          { id: cid(), icon: "✓", image: null, title: "Proven, results-driven delivery", desc: "" },
          { id: cid(), icon: "✓", image: null, title: "Full transparency at every step", desc: "" },
          { id: cid(), icon: "✓", image: null, title: "Dedicated, responsive support", desc: "" },
          { id: cid(), icon: "✓", image: null, title: "Built to scale with your business", desc: "" },
        ],
      },
    }),
  },
];

/** Fast id → template lookup used when the popup picks a template. */
export const TEMPLATE_BY_ID: Record<string, SectionTemplate> = Object.fromEntries(
  SECTION_TEMPLATES.map((t) => [t.id, t]),
);
