"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  HomeContent,
  HeroBlock,
  AboutBlock,
  ServicesSectionBlock,
  SectionHeader,
  TestimonialsHeader,
  FaqHeader,
  BlogHeader,
  CtaBlock,
  FounderBlock,
} from "@jhb/shared/home";
import { composeHeroHeading } from "@jhb/shared/home";
import { saveHomeDraft, publishHome } from "@/app/actions";
import EditorHeader from "./EditorHeader";
import type { InternalPage } from "@jhb/shared/service-pages";
import type { HomeFaq } from "@jhb/shared/home-faqs";
import type { StatsContent } from "@jhb/shared/content";
import type { PartnersDoc } from "@jhb/shared/partners";
import RichText from "./RichText";
import RichEditor from "./RichEditor";
import ImagePicker from "./ImagePicker";
import AlignPicker from "./AlignPicker";
import HomeFaqManager from "./HomeFaqManager";
import StatsManager from "./StatsManager";
import PartnersManager from "./PartnersManager";
import { AddContainerModal, ContainerCard } from "./ContainerParts";
import { cloneContainer, createContainer, type ContainerType, type PageContainer } from "@jhb/shared/containers";
import { TEMPLATE_BY_ID } from "@jhb/shared/container-templates";
import { PageContainersView } from "@jhb/shared/container-view";
import FaqAccordionView from "@jhb/shared/faq-accordion-view";

// Minimal shape the FAQ manager reports up for the live preview (mirrors its Row).
type FaqPreviewRow = { id: string; question: string; answer: string; active: boolean };

// The home page's native sections in live-render order, each paired with the
// zone that sits AFTER it (matches the <PageContainers zone> points in the
// public home page). The top zone is "top".
const HOME_SECTIONS = [
  { label: "Hero", zone: "after-hero" },
  { label: "Partners", zone: "after-partners" },
  { label: "About", zone: "after-about" },
  { label: "Services", zone: "after-services" },
  { label: "Stats", zone: "after-stats" },
  { label: "Testimonials", zone: "after-testimonials" },
  { label: "Founder", zone: "after-founder" },
  { label: "Client Logos", zone: "after-clients" },
  { label: "FAQ", zone: "after-faq" },
  { label: "Blog Preview", zone: "after-blog" },
  { label: "Call to Action", zone: "after-cta" },
  { label: "Contact", zone: "bottom" },
];

type ServiceLite = { slug: string; title: string; short: string };
type Toast = { type: "success" | "error"; msg: string } | null;

export default function HomeManager({
  draft,
  published,
  services,
  faqs = [],
  stats,
  partners,
  internalPages = [],
}: {
  draft: HomeContent;
  published: HomeContent;
  services: ServiceLite[];
  faqs?: HomeFaq[];
  stats: StatsContent;
  partners: PartnersDoc;
  internalPages?: InternalPage[];
}) {
  const router = useRouter();

  // Initialise service-card editors from saved overrides or canonical content
  const initialCards = useMemo(() => {
    const map = new Map(draft.serviceCards.map((o) => [o.slug, o]));
    return services.map((s) => ({
      slug: s.slug,
      title: map.get(s.slug)?.title ?? s.title,
      short: map.get(s.slug)?.short ?? s.short,
    }));
  }, [draft.serviceCards, services]);

  const [hero, setHero] = useState<HeroBlock>(draft.hero);
  const [about, setAbout] = useState<AboutBlock>(draft.about);
  const [servicesSection, setServicesSection] = useState<ServicesSectionBlock>(
    draft.servicesSection
  );
  const [statsHeader, setStatsHeader] = useState<SectionHeader>(draft.statsHeader);
  const [testimonialsHeader, setTestimonialsHeader] = useState<TestimonialsHeader>(
    draft.testimonialsHeader
  );
  const [clientLogosHeader, setClientLogosHeader] = useState<SectionHeader>(
    draft.clientLogosHeader
  );
  const [faqHeader, setFaqHeader] = useState<FaqHeader>(draft.faqHeader);
  const [blogHeader, setBlogHeader] = useState<BlogHeader>(draft.blogHeader);
  const [contactHeader, setContactHeader] = useState<SectionHeader>(draft.contactHeader);
  const [cards, setCards] = useState(initialCards);
  const [cta, setCta] = useState<CtaBlock>(draft.cta);
  const [founder, setFounder] = useState<FounderBlock>(draft.founder);
  const [containers, setContainers] = useState<PageContainer[]>(draft.containers);
  // Live FAQ rows mirrored from the FAQ manager so the preview reflects edits
  // instantly (before they're saved). Seeded from the server-loaded FAQs.
  const [faqPreview, setFaqPreview] = useState<FaqPreviewRow[]>(
    faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer, active: f.active }))
  );
  const [addZone, setAddZone] = useState<string | null>(null);
  const setF = <K extends keyof FounderBlock>(k: K, v: FounderBlock[K]) =>
    setFounder((p) => ({ ...p, [k]: v }));

  const [busy, setBusy] = useState<"" | "save" | "publish">("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [toast, setToast] = useState<Toast>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [faqOpen, setFaqOpen] = useState(true);
  const [statsOpen, setStatsOpen] = useState(true);
  const [partnersOpen, setPartnersOpen] = useState(true);

  const flash = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  const assemble = (): HomeContent => ({
    hero,
    about,
    servicesSection,
    serviceCards: cards,
    statsHeader,
    testimonialsHeader,
    clientLogosHeader,
    faqHeader,
    blogHeader,
    contactHeader,
    cta,
    founder,
    containers,
  });

  const save = async () => {
    setBusy("save");
    const res = await saveHomeDraft(assemble() as unknown as Record<string, unknown>);
    setBusy("");
    if (res.ok) {
      setStatus("draft");
      flash({ type: "success", msg: "Draft saved." });
      router.refresh();
    } else flash({ type: "error", msg: res.error || "Save failed." });
  };

  const publish = async () => {
    setBusy("publish");
    const saveRes = await saveHomeDraft(
      assemble() as unknown as Record<string, unknown>
    );
    if (!saveRes.ok) {
      setBusy("");
      return flash({ type: "error", msg: saveRes.error || "Save failed." });
    }
    const res = await publishHome();
    setBusy("");
    if (res.ok) {
      setStatus("published");
      flash({ type: "success", msg: "Published! Live on the website." });
      router.refresh();
    } else flash({ type: "error", msg: res.error || "Publish failed." });
  };

  // ----- inserted-container helpers (page-builder; save-gated, publish to go live) -----
  const zoneItems = (zone: string) => containers.filter((c) => c.zone === zone);
  const addContainer = (zone: string, type: ContainerType) => {
    setContainers((cs) => [...cs, createContainer(type, zone)]);
    setAddZone(null);
  };
  const addTemplate = (zone: string, templateId: string) => {
    const t = TEMPLATE_BY_ID[templateId];
    if (!t) return;
    setContainers((cs) => [...cs, t.create(zone)]);
    setAddZone(null);
  };
  const updateContainer = (id: string, c: PageContainer) =>
    setContainers((cs) => cs.map((x) => (x.id === id ? c : x)));
  const removeContainer = (id: string) => setContainers((cs) => cs.filter((x) => x.id !== id));
  const duplicateContainer = (id: string) =>
    setContainers((cs) => {
      const i = cs.findIndex((x) => x.id === id);
      if (i === -1) return cs;
      return [...cs.slice(0, i + 1), cloneContainer(cs[i]), ...cs.slice(i + 1)];
    });
  const moveInZone = (id: string, dir: -1 | 1) =>
    setContainers((cs) => {
      const c = cs.find((x) => x.id === id);
      if (!c) return cs;
      const sib = cs.filter((x) => x.zone === c.zone);
      const pos = sib.findIndex((x) => x.id === id);
      const t = pos + dir;
      if (t < 0 || t >= sib.length) return cs;
      const a = cs.findIndex((x) => x.id === id);
      const b = cs.findIndex((x) => x.id === sib[t].id);
      const n = [...cs];
      [n[a], n[b]] = [n[b], n[a]];
      return n;
    });
  const moveToZone = (id: string, zone: string) =>
    setContainers((cs) => cs.map((x) => (x.id === id ? { ...x, zone } : x)));

  // A "＋ Add Container" insertion line + any containers already inserted at this
  // position, rendered inline between the native section editors.
  const renderSlot = (zone: string) => (
    <>
      <button
        type="button"
        onClick={() => setAddZone(zone)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink/15 py-2 text-xs font-medium text-muted transition hover:border-primary hover:bg-primary/5 hover:text-primary"
      >
        <span aria-hidden>＋</span> Add Container
      </button>
      {zoneItems(zone).map((c) => (
        <ContainerCard
          key={c.id}
          container={c}
          sections={HOME_SECTIONS}
          topZone="top"
          onChange={(nc) => updateContainer(c.id, nc)}
          onMoveUp={() => moveInZone(c.id, -1)}
          onMoveDown={() => moveInZone(c.id, 1)}
          onDuplicate={() => duplicateContainer(c.id)}
          onDelete={() => removeContainer(c.id)}
          onMoveToZone={(z) => moveToZone(c.id, z)}
        />
      ))}
    </>
  );

  const setHeroField = (k: keyof HeroBlock, v: string | null) =>
    setHero((p) => ({ ...p, [k]: v }));
  const setAboutField = (k: keyof AboutBlock, v: string | boolean | null) =>
    setAbout((p) => ({ ...p, [k]: v }));
  const setCtaField = (k: keyof CtaBlock, v: string | boolean) =>
    setCta((p) => ({ ...p, [k]: v }));

  return (
    <div>
      <EditorHeader
        title="Home Page"
        subtitle="Edit every section of the public home page. Save draft keeps changes private; Publish makes them live."
        status={status}
        busy={busy}
        toast={toast}
        onSave={save}
        onPublish={publish}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview((s) => !s)}
      />

      <div
        className={`mt-8 grid gap-6 ${
          showPreview ? "xl:grid-cols-[1fr_440px]" : ""
        }`}
      >
        {/* ---- Editor ---- */}
        <div className="space-y-6">
          {renderSlot("top")}

          {/* Hero */}
          <Card title="Hero Section">
            <Field label="Badge" value={hero.badge} onChange={(v) => setHeroField("badge", v)} />
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">
                Heading — select words and click{" "}
                <span className="grad-text font-semibold">Highlight</span> for the gradient
              </span>
              <RichEditor
                value={composeHeroHeading(hero.title, hero.highlight)}
                onChange={(html) => setHero((p) => ({ ...p, title: html, highlight: "" }))}
                internalPages={internalPages}
              />
            </div>
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">
                Hero Description
              </span>
              <RichEditor
                value={hero.subtitle}
                onChange={(html) => setHeroField("subtitle", html)}
                internalPages={internalPages}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Primary button text" value={hero.buttonText} onChange={(v) => setHeroField("buttonText", v)} />
              <Field label="Primary button link" value={hero.buttonHref} onChange={(v) => setHeroField("buttonHref", v)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Secondary button text (blank hides it)" value={hero.buttonSecondaryText} onChange={(v) => setHeroField("buttonSecondaryText", v)} />
              <Field label="Secondary button link" value={hero.buttonSecondaryHref} onChange={(v) => setHeroField("buttonSecondaryHref", v)} />
            </div>
            <Field label="Tools marquee label (above the partner logos)" value={hero.marqueeLabel} onChange={(v) => setHeroField("marqueeLabel", v)} />
            <ImagePicker label="Hero image (optional)" value={hero.image} onChange={(u) => setHeroField("image", u)} />
            <Field label="Image title (optional, SEO)" value={hero.imageTitle} onChange={(v) => setHeroField("imageTitle", v)} />
          </Card>

          {renderSlot("after-hero")}

          {/* Partners — managed inline (instant save via its own button, independent
              of the page Save/Publish). Moved here from the standalone Partners page. */}
          <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
            <button
              type="button"
              onClick={() => setPartnersOpen((o) => !o)}
              className="flex w-full items-center justify-between text-left"
            >
              <span>
                <span className="font-display text-lg font-semibold">Partners Section</span>
                <span className="ml-2 rounded-full bg-ink/[0.06] px-2 py-0.5 text-[11px] font-medium text-muted">
                  {partners.items.length} partner{partners.items.length === 1 ? "" : "s"}
                </span>
              </span>
              <span className="text-muted">{partnersOpen ? "▾" : "▸"}</span>
            </button>
            <p className="mt-1 text-sm text-muted">
              The &ldquo;Powered by&rdquo; logo strip below the hero. Saves and goes live{" "}
              <b>instantly</b> — independent of the Save/Publish buttons above.
            </p>
            {partnersOpen && (
              <div className="mt-4">
                <PartnersManager initial={partners} />
              </div>
            )}
          </section>

          {renderSlot("after-partners")}

          {/* About */}
          <Card title="About Section">
            <Toggle
              label="Show this section"
              checked={about.enabled}
              onChange={(v) => setAboutField("enabled", v)}
            />
            <Field label="Eyebrow" value={about.eyebrow} onChange={(v) => setAboutField("eyebrow", v)} />
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">Heading (rich text — font size, colour, word links)</span>
              <RichEditor value={about.title} onChange={(html) => setAboutField("title", html)} internalPages={internalPages} />
            </div>
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">Description (rich text)</span>
              <RichEditor value={about.descriptionHtml} onChange={(html) => setAboutField("descriptionHtml", html)} internalPages={internalPages} />
            </div>
            <ImagePicker label="About image" value={about.image} onChange={(u) => setAboutField("image", u)} />
          </Card>

          {renderSlot("after-about")}

          {/* Services section */}
          <Card title="Services Section">
            <Field label="Eyebrow / badge" value={servicesSection.eyebrow} onChange={(v) => setServicesSection((p) => ({ ...p, eyebrow: v }))} />
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">Heading (rich text — font size, colour, word links)</span>
              <RichEditor value={servicesSection.title} onChange={(html) => setServicesSection((p) => ({ ...p, title: html }))} internalPages={internalPages} />
            </div>
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">Subheading (rich text)</span>
              <RichEditor value={servicesSection.subtitle} onChange={(html) => setServicesSection((p) => ({ ...p, subtitle: html }))} internalPages={internalPages} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="“View all” button text" value={servicesSection.viewAllText} onChange={(v) => setServicesSection((p) => ({ ...p, viewAllText: v }))} />
              <Field label="Per-card “learn more” text" value={servicesSection.learnMoreText} onChange={(v) => setServicesSection((p) => ({ ...p, learnMoreText: v }))} />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Service Cards
              </p>
              {cards.map((c, i) => (
                <div key={c.slug} className="rounded-xl border border-ink/10 bg-base p-3">
                  <p className="mb-2 font-mono text-[11px] text-muted">/{c.slug}</p>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-muted">Card title</label>
                      <RichEditor
                        value={c.title}
                        onChange={(html) =>
                          setCards((p) => p.map((x, idx) => (idx === i ? { ...x, title: html } : x)))
                        }
                        internalPages={internalPages}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-muted">Card description</label>
                      <RichEditor
                        value={c.short}
                        onChange={(html) =>
                          setCards((p) => p.map((x, idx) => (idx === i ? { ...x, short: html } : x)))
                        }
                        internalPages={internalPages}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {renderSlot("after-services")}

          {/* Stats section header (the numbers band's eyebrow + heading) */}
          <HeaderCard
            title="Stats Section — Heading"
            hint="The eyebrow and heading above the animated numbers band. The numbers themselves are edited below."
            value={statsHeader}
            onChange={(patch) => setStatsHeader((p) => ({ ...p, ...patch }))}
            showDescription={false}
          />

          {/* Why Choose Us — Statistics (merged from the old Content page; live save) */}
          <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
            <button
              type="button"
              onClick={() => setStatsOpen((o) => !o)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="font-display text-lg font-semibold">Why Choose Us — Statistics</span>
              <span className="text-muted">{statsOpen ? "▾" : "▸"}</span>
            </button>
            <p className="mt-1 text-sm text-muted">
              The animated numbers band. Saves and goes live <b>instantly</b> — independent of the
              Save/Publish buttons above.
            </p>
            {statsOpen && (
              <div className="mt-4">
                <StatsManager initial={stats} />
              </div>
            )}
          </section>

          {renderSlot("after-stats")}

          {/* Testimonials section header (cards are edited on the Testimonials page) */}
          <HeaderCard
            title="Testimonials Section — Heading"
            hint="The eyebrow, heading and intro above the testimonial cards. The cards are edited on the Testimonials page."
            value={testimonialsHeader}
            onChange={(patch) => setTestimonialsHeader((p) => ({ ...p, ...patch }))}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Rating value (e.g. 4.9/5)" value={testimonialsHeader.ratingValue} onChange={(v) => setTestimonialsHeader((p) => ({ ...p, ratingValue: v }))} />
              <Field label="Rating text (e.g. from 200+ happy clients)" value={testimonialsHeader.ratingText} onChange={(v) => setTestimonialsHeader((p) => ({ ...p, ratingText: v }))} />
            </div>
          </HeaderCard>

          {/* Founder Section (part of draft/publish content) */}
          <Card title="Founder Section">
            <Toggle label="Show this section" checked={founder.enabled} onChange={(v) => setF("enabled", v)} />
            <Field label="Eyebrow" value={founder.eyebrow} onChange={(v) => setF("eyebrow", v)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Heading" value={founder.heading} onChange={(v) => setF("heading", v)} />
              <Field label="Highlighted phrase" value={founder.highlight} onChange={(v) => setF("highlight", v)} />
            </div>
            <AlignPicker
              label="Heading alignment"
              value={founder.headingAlign ?? "left"}
              onChange={(v) => setF("headingAlign", v)}
            />
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">Description</span>
              <RichText value={founder.descriptionHtml} onChange={(html) => setF("descriptionHtml", html)} />
            </div>
            <Field label="Focus list title" value={founder.focusTitle} onChange={(v) => setF("focusTitle", v)} />
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">Focus points</span>
              <div className="space-y-2">
                {founder.focusPoints.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={p}
                      onChange={(e) => setF("focusPoints", founder.focusPoints.map((x, idx) => (idx === i ? e.target.value : x)))}
                      className="input flex-1"
                    />
                    <button
                      onClick={() => setF("focusPoints", founder.focusPoints.filter((_, idx) => idx !== i))}
                      className="grid h-9 w-9 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setF("focusPoints", [...founder.focusPoints, ""])}
                  className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary"
                >
                  + Add focus point
                </button>
              </div>
            </div>
            <ImagePicker label="Founder image" value={founder.image} onChange={(u) => setF("image", u)} alt={false} />
            <Field label="Image alt text" value={founder.imageAlt} onChange={(v) => setF("imageAlt", v)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Badge name" value={founder.name} onChange={(v) => setF("name", v)} />
              <Field label="Badge company" value={founder.company} onChange={(v) => setF("company", v)} />
            </div>
          </Card>

          {renderSlot("after-founder")}

          {/* Client Logos section header (logos are edited on the Client Logos page) */}
          <HeaderCard
            title="Client Logos Section — Heading"
            hint="The eyebrow, heading and intro above the client-logo grid. The logos are uploaded on the Client Logos page."
            value={clientLogosHeader}
            onChange={(patch) => setClientLogosHeader((p) => ({ ...p, ...patch }))}
          />

          {/* FAQ section header (questions are edited in the FAQ manager below) */}
          <HeaderCard
            title="FAQ Section — Heading"
            hint="The eyebrow, heading and intro above the FAQ accordion. The questions are edited below."
            value={faqHeader}
            onChange={(patch) => setFaqHeader((p) => ({ ...p, ...patch }))}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Help link text (e.g. Talk to our team)" value={faqHeader.linkText} onChange={(v) => setFaqHeader((p) => ({ ...p, linkText: v }))} />
              <Field label="Help link URL" value={faqHeader.linkHref} onChange={(v) => setFaqHeader((p) => ({ ...p, linkHref: v }))} />
            </div>
            {/* FAQ illustration image — replaces the built-in artwork when set */}
            <div className="mt-4 rounded-xl border border-ink/10 bg-base p-3">
              <ImagePicker
                label="FAQ illustration image (optional — replaces the built-in artwork)"
                value={faqHeader.image ?? null}
                onChange={(u) => setFaqHeader((p) => ({ ...p, image: u }))}
                alt={false}
                settings={faqHeader.imageSettings}
                onChangeSettings={(imageSettings) => setFaqHeader((p) => ({ ...p, imageSettings }))}
              />
              <div className="mt-3 flex flex-wrap items-end gap-4">
                <AlignPicker
                  label="Image side"
                  options={["left", "right"]}
                  value={faqHeader.imageSide === "right" ? "right" : "left"}
                  onChange={(v) => setFaqHeader((p) => ({ ...p, imageSide: v === "right" ? "right" : "left" }))}
                />
                <label className="flex items-center gap-2 pb-1 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={faqHeader.showIllustration !== false}
                    onChange={(e) => setFaqHeader((p) => ({ ...p, showIllustration: e.target.checked }))}
                  />
                  Show the built-in artwork when no image is uploaded (off = FAQ list spans full width)
                </label>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Field label="Image alt text (SEO)" value={faqHeader.imageAlt ?? ""} onChange={(v) => setFaqHeader((p) => ({ ...p, imageAlt: v }))} />
                <Field label="Image title" value={faqHeader.imageTitle ?? ""} onChange={(v) => setFaqHeader((p) => ({ ...p, imageTitle: v }))} />
                <Field label="Image caption" value={faqHeader.imageCaption ?? ""} onChange={(v) => setFaqHeader((p) => ({ ...p, imageCaption: v }))} />
                <Field label="Image description" value={faqHeader.imageDescription ?? ""} onChange={(v) => setFaqHeader((p) => ({ ...p, imageDescription: v }))} />
              </div>
            </div>
          </HeaderCard>

          {/* FAQ Section — managed inline (live CRUD, independent of Save/Publish) */}
          <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
            <button
              type="button"
              onClick={() => setFaqOpen((o) => !o)}
              className="flex w-full items-center justify-between text-left"
            >
              <span>
                <span className="font-display text-lg font-semibold">FAQ Section</span>
                <span className="ml-2 rounded-full bg-ink/[0.06] px-2 py-0.5 text-[11px] font-medium text-muted">
                  {faqs.length} FAQ{faqs.length === 1 ? "" : "s"}
                </span>
              </span>
              <span className="text-muted">{faqOpen ? "▾" : "▸"}</span>
            </button>
            <p className="mt-1 text-sm text-muted">
              Add, edit, reorder (drag) and publish the homepage FAQ accordion. FAQ
              changes save and go live <b>instantly</b> — independent of the Save/Publish
              buttons above.
            </p>
            {faqOpen && <HomeFaqManager initial={faqs} internalPages={internalPages} onPreview={setFaqPreview} />}
          </section>

          {renderSlot("after-faq")}

          {/* Blog Preview section header (posts are edited on the Blog page) */}
          <HeaderCard
            title="Blog Preview Section — Heading"
            hint="The eyebrow, heading and intro above the latest-posts grid. The posts are managed on the Blog page."
            value={blogHeader}
            onChange={(patch) => setBlogHeader((p) => ({ ...p, ...patch }))}
          >
            <Field label="“View all” button text" value={blogHeader.viewAllText} onChange={(v) => setBlogHeader((p) => ({ ...p, viewAllText: v }))} />
          </HeaderCard>

          {/* CTA (placed near the end to mirror the live page order) */}
          <Card title="Call-to-Action Section">
            <Toggle label="Show this section" checked={cta.enabled} onChange={(v) => setCtaField("enabled", v)} />
            <Field label="Title" value={cta.title} onChange={(v) => setCtaField("title", v)} />
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">Text</span>
              <RichText value={cta.textHtml} onChange={(html) => setCtaField("textHtml", html)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button text" value={cta.buttonText} onChange={(v) => setCtaField("buttonText", v)} />
              <Field label="Button link" value={cta.buttonHref} onChange={(v) => setCtaField("buttonHref", v)} />
            </div>
          </Card>

          {renderSlot("after-cta")}

          {/* Contact section header (phone/email/address come from Settings) */}
          <HeaderCard
            title="Contact Section — Heading"
            hint="The eyebrow, heading and intro of the contact section. Phone, email and address come from Settings."
            value={contactHeader}
            onChange={(patch) => setContactHeader((p) => ({ ...p, ...patch }))}
          />

          <p className="text-xs text-muted">
            Footer content (company, contact, socials) is managed under{" "}
            <a href="/settings" className="text-primary underline">Settings</a>.
          </p>

          {renderSlot("bottom")}
        </div>

        {/* ---- Live preview ---- */}
        {showPreview && (
          <div className="xl:sticky xl:top-6 xl:h-fit">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Live preview (draft)
            </div>
            <Preview
              hero={hero}
              about={about}
              servicesSection={servicesSection}
              serviceCards={cards}
              stats={stats}
              partners={partners}
              faqs={faqPreview}
              faqHeader={faqHeader}
              founder={founder}
              cta={cta}
              containers={containers}
            />
            <p className="mt-3 text-[11px] text-muted">
              Published {published.hero.title === hero.title ? "matches" : "differs from"} this draft.
            </p>
          </div>
        )}
      </div>

      {addZone !== null && (
        <AddContainerModal
          onClose={() => setAddZone(null)}
          onPick={(t) => {
            if (addZone !== null) addContainer(addZone, t);
          }}
          onPickTemplate={(id) => {
            if (addZone !== null) addTemplate(addZone, id);
          }}
        />
      )}
    </div>
  );
}

/* ---------- small UI helpers ---------- */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-none rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      )}
    </label>
  );
}

// Editor for a section's "header chrome" — eyebrow + split heading + sub-text.
// Used for the sections whose body content lives on its own page (Stats,
// Testimonials, Client Logos, FAQ, Blog, Contact) so their headings are editable.
function HeaderCard({
  title,
  hint,
  value,
  onChange,
  showDescription = true,
  children,
}: {
  title: string;
  hint?: string;
  value: SectionHeader;
  onChange: (patch: Partial<SectionHeader>) => void;
  showDescription?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Card title={title}>
      {hint && <p className="-mt-1 text-xs text-muted">{hint}</p>}
      <Field label="Eyebrow / badge" value={value.eyebrow} onChange={(v) => onChange({ eyebrow: v })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Heading" value={value.headingLead} onChange={(v) => onChange({ headingLead: v })} />
        <Field label="Highlighted word(s)" value={value.headingHighlight} onChange={(v) => onChange({ headingHighlight: v })} />
      </div>
      {showDescription && (
        <Field label="Description" value={value.description} onChange={(v) => onChange({ description: v })} textarea />
      )}
      {children}
    </Card>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-ink/20"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
      <span className="text-muted">{label}</span>
    </label>
  );
}

function Preview({
  hero,
  about,
  servicesSection,
  serviceCards,
  stats,
  partners,
  faqs,
  faqHeader,
  founder,
  cta,
  containers,
}: {
  hero: HeroBlock;
  about: AboutBlock;
  servicesSection: ServicesSectionBlock;
  serviceCards: { slug: string; title: string; short: string }[];
  stats: StatsContent;
  partners: PartnersDoc;
  faqs: FaqPreviewRow[];
  faqHeader: FaqHeader;
  founder: FounderBlock;
  cta: CtaBlock;
  containers: PageContainer[];
}) {
  // Only the active questions appear on the live site, so the preview matches.
  const activeFaqs = faqs.filter((f) => f.active && f.question.trim());
  return (
    // Fixed-height viewport that scrolls internally (Hero -> Footer), so the
    // preview stays put while the editor on the left scrolls independently.
    <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-ink/10 bg-base shadow-soft xl:max-h-[calc(100vh-10rem)]">
      <PageContainersView containers={containers} zone="top" />
      {/* hero */}
      <div className="bg-surface p-5">
        <span className="eyebrow !text-[10px]">{hero.badge}</span>
        <h3
          className="mt-3 font-display text-lg font-bold leading-tight [&_p]:m-0 [&_p]:inline [&>div]:inline"
          dangerouslySetInnerHTML={{ __html: composeHeroHeading(hero.title, hero.highlight) }}
        />
        <div
          className="prose-jhb mt-2 text-xs text-muted [&_a]:text-primary"
          dangerouslySetInnerHTML={{ __html: hero.subtitle }}
        />
        <span className="btn btn-primary mt-3 !px-4 !py-2 !text-xs">{hero.buttonText}</span>
        {hero.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero.image} alt="" className="mt-3 aspect-[4/3] w-full rounded-lg object-cover" />
        )}
      </div>
      <PageContainersView containers={containers} zone="after-hero" />
      {/* partners */}
      {partners.enabled && partners.items.length > 0 && (
        <div className="border-t border-ink/10 p-5">
          <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted">{partners.heading}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {partners.items.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-base px-2.5 py-1 text-[11px] font-medium">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}
      <PageContainersView containers={containers} zone="after-partners" />
      {/* about */}
      {about.enabled && (
        <div className="border-t border-ink/10 p-5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{about.eyebrow}</span>
          <div className="mt-1 font-display text-base font-bold [&_p]:m-0 [&_a]:text-primary" dangerouslySetInnerHTML={{ __html: about.title }} />
          <div className="prose-jhb mt-1 text-xs text-muted [&_a]:text-primary" dangerouslySetInnerHTML={{ __html: about.descriptionHtml }} />
          {about.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={about.image} alt="" className="mt-2 aspect-[4/3] w-full rounded-lg object-cover" />
          )}
        </div>
      )}
      <PageContainersView containers={containers} zone="after-about" />
      {/* services heading + cards */}
      <div className="border-t border-ink/10 p-5 text-center">
        <div className="font-display text-base font-bold grad-text [&_p]:m-0" dangerouslySetInnerHTML={{ __html: servicesSection.title }} />
        <div className="mt-1 text-xs text-muted [&_p]:m-0 [&_a]:text-primary" dangerouslySetInnerHTML={{ __html: servicesSection.subtitle }} />
        {serviceCards.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2 text-left">
            {serviceCards.slice(0, 6).map((c) => (
              <div key={c.slug} className="rounded-lg border border-ink/10 bg-surface p-3">
                <p className="text-xs font-semibold leading-tight">{c.title}</p>
                <p className="mt-1 text-[11px] text-muted">{c.short}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <PageContainersView containers={containers} zone="after-services" />
      {/* why choose us (stats) */}
      {stats.items.length > 0 && (
        <div className="border-t border-ink/10 p-5">
          <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-primary">Why choose us</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.items.map((s, i) => (
              <div key={i} className="text-center">
                <p className="font-display text-lg font-bold grad-text">{s.value}{s.suffix}</p>
                <p className="text-[10px] text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <PageContainersView containers={containers} zone="after-stats" />
      {/* testimonials (managed elsewhere) */}
      <div className="border-t border-ink/10 p-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">What our clients say</p>
        <p className="mt-1 text-[11px] text-muted">Testimonials section · edit on the Testimonials page</p>
      </div>
      <PageContainersView containers={containers} zone="after-testimonials" />
      {/* founder */}
      {founder.enabled && (
        <div className="border-t border-ink/10 p-5">
          <div className={founder.headingAlign === "center" ? "text-center" : founder.headingAlign === "right" ? "text-right" : ""}>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{founder.eyebrow}</span>
            <div className="mt-1 font-display text-base font-bold">
              {founder.heading} <span className="grad-text">{founder.highlight}</span>
            </div>
          </div>
          <div className="prose-jhb mt-1 text-xs text-muted [&_a]:text-primary" dangerouslySetInnerHTML={{ __html: founder.descriptionHtml }} />
          {(founder.name || founder.company) && (
            <p className="mt-2 text-[11px] font-semibold">
              {founder.name}{founder.name && founder.company ? " · " : ""}{founder.company}
            </p>
          )}
        </div>
      )}
      <PageContainersView containers={containers} zone="after-founder" />
      <PageContainersView containers={containers} zone="after-clients" />
      {/* blog (managed elsewhere) */}
      <div className="border-t border-ink/10 p-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">From the blog</p>
        <p className="mt-1 text-[11px] text-muted">Latest posts · edit on the Blog page</p>
      </div>
      <PageContainersView containers={containers} zone="after-blog" />
      {/* faq — same accordion component as the live site (question + toggle +
          rich-text answer), updates instantly as the FAQ manager is edited. */}
      {activeFaqs.length > 0 && (
        <div className="border-t border-ink/10 p-5">
          <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-primary">FAQ</p>
          {faqHeader.image && (
            <div className={`mt-3 ${faqHeader.imageSide === "right" ? "text-right" : "text-left"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={faqHeader.image} alt={faqHeader.imageAlt ?? ""} className="inline-block max-h-32 rounded-xl border border-ink/10 object-contain" />
              {faqHeader.imageCaption ? <p className="mt-1 text-[10px] text-muted">{faqHeader.imageCaption}</p> : null}
            </div>
          )}
          <div className="mt-3">
            <FaqAccordionView items={activeFaqs} />
          </div>
        </div>
      )}
      <PageContainersView containers={containers} zone="after-faq" />
      {/* cta */}
      {cta.enabled && (
        <div className="border-t border-ink/10 bg-gradient-to-br from-primary/10 to-secondary/10 p-5 text-center">
          <h4 className="font-display text-base font-bold">{cta.title}</h4>
          <div className="prose-jhb mt-1 text-xs text-muted" dangerouslySetInnerHTML={{ __html: cta.textHtml }} />
          <span className="btn btn-primary mt-3 !px-4 !py-2 !text-xs">{cta.buttonText}</span>
        </div>
      )}
      <PageContainersView containers={containers} zone="after-cta" />
      {/* contact (managed elsewhere) */}
      <div className="border-t border-ink/10 p-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Contact</p>
        <p className="mt-1 text-[11px] text-muted">Contact form &amp; details · edit on the Settings page</p>
      </div>
      <PageContainersView containers={containers} zone="bottom" />
      {/* footer */}
      <div className="border-t border-ink/10 bg-surface p-5 text-center">
        <p className="font-display text-sm font-bold">JHB Automations</p>
        <p className="mt-1 text-[10px] text-muted">© JHB Automations · All rights reserved</p>
      </div>
    </div>
  );
}
