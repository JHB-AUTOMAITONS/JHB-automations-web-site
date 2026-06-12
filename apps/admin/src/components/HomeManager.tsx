"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  HomeContent,
  HeroBlock,
  AboutBlock,
  ServicesSectionBlock,
  CtaBlock,
} from "@jhb/shared/home";
import { saveHomeDraft, publishHome } from "@/app/actions";
import RichText from "./RichText";
import ImagePicker from "./ImagePicker";

type ServiceLite = { slug: string; title: string; short: string };
type Toast = { type: "success" | "error"; msg: string } | null;

export default function HomeManager({
  draft,
  published,
  services,
}: {
  draft: HomeContent;
  published: HomeContent;
  services: ServiceLite[];
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
  const [cards, setCards] = useState(initialCards);
  const [cta, setCta] = useState<CtaBlock>(draft.cta);

  const [busy, setBusy] = useState<"" | "save" | "publish">("");
  const [toast, setToast] = useState<Toast>(null);
  const [showPreview, setShowPreview] = useState(true);

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
            <Field label="Subtitle" value={hero.subtitle} onChange={(v) => setHeroField("subtitle", v)} textarea />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Button text" value={hero.buttonText} onChange={(v) => setHeroField("buttonText", v)} />
              <Field label="Button link" value={hero.buttonHref} onChange={(v) => setHeroField("buttonHref", v)} />
            </div>
            <ImagePicker label="Hero image (optional)" value={hero.image} onChange={(u) => setHeroField("image", u)} />
          </Card>

          {/* About */}
          <Card title="About Section">
            <Toggle
              label="Show this section"
              checked={about.enabled}
              onChange={(v) => setAboutField("enabled", v)}
            />
            <Field label="Eyebrow" value={about.eyebrow} onChange={(v) => setAboutField("eyebrow", v)} />
            <Field label="Title" value={about.title} onChange={(v) => setAboutField("title", v)} />
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">Description</span>
              <RichText value={about.descriptionHtml} onChange={(html) => setAboutField("descriptionHtml", html)} />
            </div>
            <ImagePicker label="About image" value={about.image} onChange={(u) => setAboutField("image", u)} />
          </Card>

          {/* Services section */}
          <Card title="Services Section">
            <Field label="Heading" value={servicesSection.title} onChange={(v) => setServicesSection((p) => ({ ...p, title: v }))} />
            <Field label="Subheading" value={servicesSection.subtitle} onChange={(v) => setServicesSection((p) => ({ ...p, subtitle: v }))} textarea />
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Service Cards
              </p>
              {cards.map((c, i) => (
                <div key={c.slug} className="rounded-xl border border-ink/10 bg-base p-3">
                  <p className="mb-2 font-mono text-[11px] text-muted">/{c.slug}</p>
                  <div className="grid gap-2 sm:grid-cols-[1fr_1.6fr]">
                    <input
                      value={c.title}
                      onChange={(e) =>
                        setCards((p) => p.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))
                      }
                      className="rounded-lg border border-ink/10 bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                    <input
                      value={c.short}
                      onChange={(e) =>
                        setCards((p) => p.map((x, idx) => (idx === i ? { ...x, short: e.target.value } : x)))
                      }
                      className="rounded-lg border border-ink/10 bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

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
  cta,
}: {
  hero: HeroBlock;
  about: AboutBlock;
  servicesSection: ServicesSectionBlock;
  cta: CtaBlock;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-base shadow-soft">
      {/* hero */}
      <div className="bg-surface p-5">
        <span className="eyebrow !text-[10px]">{hero.badge}</span>
        <h3 className="mt-3 font-display text-lg font-bold leading-tight">
          {hero.title} <span className="grad-text">{hero.highlight}</span>
        </h3>
        <p className="mt-2 text-xs text-muted line-clamp-3">{hero.subtitle}</p>
        <span className="btn btn-primary mt-3 !px-4 !py-2 !text-xs">{hero.buttonText}</span>
        {hero.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero.image} alt="" className="mt-3 aspect-[4/3] w-full rounded-lg object-cover" />
        )}
      </div>
      {/* about */}
      {about.enabled && (
        <div className="border-t border-ink/10 p-5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{about.eyebrow}</span>
          <h4 className="mt-1 font-display text-base font-bold">{about.title}</h4>
          <div className="prose-jhb mt-1 text-xs text-muted [&_a]:text-primary" dangerouslySetInnerHTML={{ __html: about.descriptionHtml }} />
          {about.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={about.image} alt="" className="mt-2 aspect-[4/3] w-full rounded-lg object-cover" />
          )}
        </div>
      )}
      {/* services heading */}
      <div className="border-t border-ink/10 p-5 text-center">
        <h4 className="font-display text-base font-bold grad-text">{servicesSection.title}</h4>
        <p className="mt-1 text-xs text-muted">{servicesSection.subtitle}</p>
      </div>
      {/* cta */}
      {cta.enabled && (
        <div className="border-t border-ink/10 bg-gradient-to-br from-primary/10 to-secondary/10 p-5 text-center">
          <h4 className="font-display text-base font-bold">{cta.title}</h4>
          <div className="prose-jhb mt-1 text-xs text-muted" dangerouslySetInnerHTML={{ __html: cta.textHtml }} />
          <span className="btn btn-primary mt-3 !px-4 !py-2 !text-xs">{cta.buttonText}</span>
        </div>
      )}
    </div>
  );
}
