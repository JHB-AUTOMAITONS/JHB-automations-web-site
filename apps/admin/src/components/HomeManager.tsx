"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildServiceCards,
  type HomeContent,
  type HeroBlock,
  type AboutBlock,
  type ServicesSectionBlock,
  type CtaBlock,
  type FounderBlock,
  type ServiceCard,
} from "@jhb/shared/home";
import { saveHomeDraft, publishHome } from "@/app/actions";
import type { InternalPage } from "@jhb/shared/service-pages";
import type { HomeFaq } from "@jhb/shared/home-faqs";
import type { StatsContent } from "@jhb/shared/content";
import type { PartnersDoc } from "@jhb/shared/partners";
import RichText from "./RichText";
import RichEditor from "./RichEditor";
import ImagePicker from "./ImagePicker";
import HomeFaqManager from "./HomeFaqManager";
import StatsManager from "./StatsManager";
import PartnersManager from "./PartnersManager";
import ServiceCardsManager from "./ServiceCardsManager";

type ServiceLite = { slug: string; title: string; short: string; icon: string };
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

  // Resolve the dynamic service cards: use the saved list, or seed from the live
  // services for legacy/empty data so existing cards are preserved.
  const initialCards = useMemo(
    () => buildServiceCards(draft.serviceCards, services),
    [draft.serviceCards, services]
  );

  const [hero, setHero] = useState<HeroBlock>(draft.hero);
  const [about, setAbout] = useState<AboutBlock>(draft.about);
  const [servicesSection, setServicesSection] = useState<ServicesSectionBlock>(
    draft.servicesSection
  );
  const [cards, setCards] = useState(initialCards);
  const [cta, setCta] = useState<CtaBlock>(draft.cta);
  const [founder, setFounder] = useState<FounderBlock>(draft.founder);
  const setF = <K extends keyof FounderBlock>(k: K, v: FounderBlock[K]) =>
    setFounder((p) => ({ ...p, [k]: v }));

  const [busy, setBusy] = useState<"" | "save" | "publish">("");
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
    cta,
    founder,
  });

  const save = async () => {
    setBusy("save");
    const res = await saveHomeDraft(assemble() as unknown as Record<string, unknown>);
    setBusy("");
    if (res.ok) {
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
      flash({ type: "success", msg: "Published! Live on the website." });
      router.refresh();
    } else flash({ type: "error", msg: res.error || "Publish failed." });
  };

  const setHeroField = (k: keyof HeroBlock, v: string | null) =>
    setHero((p) => ({ ...p, [k]: v }));
  const setAboutField = (k: keyof AboutBlock, v: string | boolean | null) =>
    setAbout((p) => ({ ...p, [k]: v }));
  const setCtaField = (k: keyof CtaBlock, v: string | boolean) =>
    setCta((p) => ({ ...p, [k]: v }));

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-soft-lg ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header + actions */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            Home Page Content
          </h1>
          <p className="mt-1 text-sm text-muted">
            Edit every section of the public home page. <b>Save</b> keeps a draft;{" "}
            <b>Publish</b> makes it live.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview((s) => !s)}
            className="rounded-lg border border-ink/10 px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-primary hover:text-primary"
          >
            {showPreview ? "Hide preview" : "Show preview"}
          </button>
          <button
            onClick={save}
            disabled={busy !== ""}
            className="btn btn-ghost !px-5 !py-2.5 !text-sm disabled:opacity-60"
          >
            {busy === "save" ? "Saving…" : "Save draft"}
          </button>
          <button
            onClick={publish}
            disabled={busy !== ""}
            className="btn btn-primary !px-5 !py-2.5 !text-sm disabled:opacity-60"
          >
            {busy === "publish" ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      <div
        className={`mt-8 grid gap-6 ${
          showPreview ? "xl:grid-cols-[1fr_440px]" : ""
        }`}
      >
        {/* ---- Editor ---- */}
        <div className="space-y-6">
          {/* Hero */}
          <Card title="Hero Section">
            <Field label="Badge" value={hero.badge} onChange={(v) => setHeroField("badge", v)} />
            <Field label="Title" value={hero.title} onChange={(v) => setHeroField("title", v)} textarea />
            <Field label="Highlighted phrase" value={hero.highlight} onChange={(v) => setHeroField("highlight", v)} />
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
              <Field label="Button text" value={hero.buttonText} onChange={(v) => setHeroField("buttonText", v)} />
              <Field label="Button link" value={hero.buttonHref} onChange={(v) => setHeroField("buttonHref", v)} />
            </div>
            <ImagePicker label="Hero image (optional)" value={hero.image} onChange={(u) => setHeroField("image", u)} />
            <Field label="Image title (optional, SEO)" value={hero.imageTitle} onChange={(v) => setHeroField("imageTitle", v)} />
          </Card>

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

          {/* Services section */}
          <Card title="Services Section">
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">Heading (rich text — font size, colour, word links)</span>
              <RichEditor value={servicesSection.title} onChange={(html) => setServicesSection((p) => ({ ...p, title: html }))} internalPages={internalPages} />
            </div>
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">Subheading (rich text)</span>
              <RichEditor value={servicesSection.subtitle} onChange={(html) => setServicesSection((p) => ({ ...p, subtitle: html }))} internalPages={internalPages} />
            </div>
            <ServiceCardsManager
              cards={cards}
              onChange={setCards}
              internalPages={internalPages}
            />
          </Card>

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

          {/* CTA */}
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

          {/* Founder Section (part of draft/publish content) */}
          <Card title="Founder Section">
            <Toggle label="Show this section" checked={founder.enabled} onChange={(v) => setF("enabled", v)} />
            <Field label="Eyebrow" value={founder.eyebrow} onChange={(v) => setF("eyebrow", v)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Heading" value={founder.heading} onChange={(v) => setF("heading", v)} />
              <Field label="Highlighted phrase" value={founder.highlight} onChange={(v) => setF("highlight", v)} />
            </div>
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
            {faqOpen && <HomeFaqManager initial={faqs} internalPages={internalPages} />}
          </section>

          <p className="text-xs text-muted">
            Footer content (company, contact, socials) is managed under{" "}
            <a href="/settings" className="text-primary underline">Settings</a>.
          </p>
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
              faqs={faqs}
              founder={founder}
              cta={cta}
            />
            <p className="mt-3 text-[11px] text-muted">
              Published {published.hero.title === hero.title ? "matches" : "differs from"} this draft.
            </p>
          </div>
        )}
      </div>
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
  founder,
  cta,
}: {
  hero: HeroBlock;
  about: AboutBlock;
  servicesSection: ServicesSectionBlock;
  serviceCards: ServiceCard[];
  stats: StatsContent;
  partners: PartnersDoc;
  faqs: HomeFaq[];
  founder: FounderBlock;
  cta: CtaBlock;
}) {
  return (
    // Fixed-height viewport that scrolls internally (Hero -> Footer), so the
    // preview stays put while the editor on the left scrolls independently.
    <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-ink/10 bg-base shadow-soft xl:max-h-[calc(100vh-10rem)]">
      {/* hero */}
      <div className="bg-surface p-5">
        <span className="eyebrow !text-[10px]">{hero.badge}</span>
        <h3 className="mt-3 font-display text-lg font-bold leading-tight">
          {hero.title} <span className="grad-text">{hero.highlight}</span>
        </h3>
        <div
          className="prose-jhb mt-2 text-xs text-muted [&_a]:text-primary [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: hero.subtitle }}
        />
        <span className="btn btn-primary mt-3 !px-4 !py-2 !text-xs">{hero.buttonText}</span>
        {hero.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero.image} alt="" className="mt-3 aspect-[4/3] w-full rounded-lg object-cover" />
        )}
      </div>
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
      {/* about */}
      {about.enabled && (
        <div className="border-t border-ink/10 p-5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{about.eyebrow}</span>
          <div className="mt-1 font-display text-base font-bold [&_p]:m-0 [&_a]:text-primary [&_a]:underline" dangerouslySetInnerHTML={{ __html: about.title }} />
          <div className="prose-jhb mt-1 text-xs text-muted [&_a]:text-primary" dangerouslySetInnerHTML={{ __html: about.descriptionHtml }} />
          {about.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={about.image} alt="" className="mt-2 aspect-[4/3] w-full rounded-lg object-cover" />
          )}
        </div>
      )}
      {/* services heading + cards */}
      <div className="border-t border-ink/10 p-5 text-center">
        <div className="font-display text-base font-bold grad-text [&_p]:m-0 [&_a]:underline" dangerouslySetInnerHTML={{ __html: servicesSection.title }} />
        <div className="mt-1 text-xs text-muted [&_p]:m-0 [&_a]:text-primary [&_a]:underline" dangerouslySetInnerHTML={{ __html: servicesSection.subtitle }} />
        {(() => {
          const visible = serviceCards.filter((c) => c.enabled);
          if (!visible.length) return null;
          return (
            <div className="mt-4 grid grid-cols-2 gap-2 text-left">
              {visible.map((c) => (
                <div key={c.id} className="rounded-lg border border-ink/10 bg-surface p-3">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image} alt="" className="mb-2 h-8 w-8 rounded-md object-cover" />
                  ) : (
                    <span className="mb-2 block h-8 w-8 rounded-md bg-gradient-to-br from-primary/30 to-secondary/30" />
                  )}
                  <div
                    className="text-xs font-semibold leading-tight [&_p]:m-0"
                    dangerouslySetInnerHTML={{ __html: c.title || "Untitled" }}
                  />
                  <div
                    className="mt-1 text-[11px] text-muted [&_p]:m-0"
                    dangerouslySetInnerHTML={{ __html: c.short }}
                  />
                </div>
              ))}
            </div>
          );
        })()}
      </div>
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
      {/* testimonials (managed elsewhere) */}
      <div className="border-t border-ink/10 p-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">What our clients say</p>
        <p className="mt-1 text-[11px] text-muted">Testimonials section · edit on the Testimonials page</p>
      </div>
      {/* founder */}
      {founder.enabled && (
        <div className="border-t border-ink/10 p-5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{founder.eyebrow}</span>
          <div className="mt-1 font-display text-base font-bold">
            {founder.heading} <span className="grad-text">{founder.highlight}</span>
          </div>
          <div className="prose-jhb mt-1 text-xs text-muted [&_a]:text-primary" dangerouslySetInnerHTML={{ __html: founder.descriptionHtml }} />
          {(founder.name || founder.company) && (
            <p className="mt-2 text-[11px] font-semibold">
              {founder.name}{founder.name && founder.company ? " · " : ""}{founder.company}
            </p>
          )}
        </div>
      )}
      {/* blog (managed elsewhere) */}
      <div className="border-t border-ink/10 p-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">From the blog</p>
        <p className="mt-1 text-[11px] text-muted">Latest posts · edit on the Blog page</p>
      </div>
      {/* faq */}
      {faqs.length > 0 && (
        <div className="border-t border-ink/10 p-5">
          <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-primary">FAQ</p>
          <div className="mt-3 space-y-1.5">
            {faqs.slice(0, 6).map((f, i) => (
              <div key={i} className="rounded-lg border border-ink/10 bg-surface px-3 py-2 text-xs font-medium">
                {f.question}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* cta */}
      {cta.enabled && (
        <div className="border-t border-ink/10 bg-gradient-to-br from-primary/10 to-secondary/10 p-5 text-center">
          <h4 className="font-display text-base font-bold">{cta.title}</h4>
          <div className="prose-jhb mt-1 text-xs text-muted" dangerouslySetInnerHTML={{ __html: cta.textHtml }} />
          <span className="btn btn-primary mt-3 !px-4 !py-2 !text-xs">{cta.buttonText}</span>
        </div>
      )}
      {/* contact (managed elsewhere) */}
      <div className="border-t border-ink/10 p-5 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Contact</p>
        <p className="mt-1 text-[11px] text-muted">Contact form &amp; details · edit on the Settings page</p>
      </div>
      {/* footer */}
      <div className="border-t border-ink/10 bg-surface p-5 text-center">
        <p className="font-display text-sm font-bold">JHB Automations</p>
        <p className="mt-1 text-[10px] text-muted">© JHB Automations · All rights reserved</p>
      </div>
    </div>
  );
}
