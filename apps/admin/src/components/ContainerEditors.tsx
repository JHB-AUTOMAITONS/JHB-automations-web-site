"use client";

import RichEditor from "./RichEditor";
import ImagePicker from "./ImagePicker";
import HeadingTagSelect from "./HeadingTagSelect";
import {
  cid,
  type AboutContainer,
  type AdvantageContainer,
  type CardsContainer,
  type ContactFormContainer,
  type ContainerAlign,
  type ContainerBg,
  type ContainerPad,
  type ContainerStyle,
  type CtaContainer,
  type CustomContainer,
  type FaqContainer,
  type FeaturesContainer,
  type GalleryContainer,
  type HeroContainer,
  type HeroDescContainer,
  type ImageBannerContainer,
  type ImageContainer,
  type ImageContentContainer,
  type PageContainer,
  type RichTextContainer,
  type ServicesContainer,
  type TeamContainer,
  type TestimonialsContainer,
  type VideoContainer,
  type WorkflowContainer,
} from "@jhb/shared/containers";

const input = "w-full rounded-lg border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary";
const lbl = "mb-1 block text-[11px] font-medium text-muted";

export function StyleControls({ style, onChange }: { style: ContainerStyle; onChange: (s: ContainerStyle) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <label className="block">
        <span className={lbl}>Background</span>
        <select className={input} value={style.bg} onChange={(e) => onChange({ ...style, bg: e.target.value as ContainerBg })}>
          <option value="none">None</option>
          <option value="subtle">Subtle</option>
          <option value="gradient">Gradient</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <label className="block">
        <span className={lbl}>Spacing</span>
        <select className={input} value={style.padding} onChange={(e) => onChange({ ...style, padding: e.target.value as ContainerPad })}>
          <option value="none">None</option>
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
        </select>
      </label>
      <label className="block">
        <span className={lbl}>Align</span>
        <select className={input} value={style.align} onChange={(e) => onChange({ ...style, align: e.target.value as ContainerAlign })}>
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>
    </div>
  );
}

const Btn2 = ({ label, value, onChange }: { label: string; value: { label: string; href: string }; onChange: (v: { label: string; href: string }) => void }) => (
  <div className="grid grid-cols-2 gap-2">
    <label className="block">
      <span className={lbl}>{label} label</span>
      <input className={input} value={value.label} onChange={(e) => onChange({ ...value, label: e.target.value })} />
    </label>
    <label className="block">
      <span className={lbl}>{label} link</span>
      <input className={input} value={value.href} onChange={(e) => onChange({ ...value, href: e.target.value })} />
    </label>
  </div>
);

function HeroEditor({ c, onChange }: { c: HeroContainer; onChange: (c: HeroContainer) => void }) {
  const p = c.props;
  const set = (patch: Partial<HeroContainer["props"]>) => onChange({ ...c, props: { ...p, ...patch } });
  return (
    <div className="space-y-3">
      {/* show / hide */}
      <div className="flex items-center justify-between gap-2 rounded-lg border border-ink/10 bg-base p-2">
        <span className="text-[11px] font-medium text-muted">Show this section</span>
        <button type="button" onClick={() => set({ hidden: !p.hidden })} className="flex items-center gap-1.5 rounded-lg border border-ink/10 px-2 py-1 text-xs">
          <span className={`relative h-4 w-7 rounded-full transition-colors ${!p.hidden ? "bg-primary" : "bg-ink/20"}`}>
            <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${!p.hidden ? "left-[14px]" : "left-0.5"}`} />
          </span>
          {p.hidden ? "Hidden" : "Visible"}
        </button>
      </div>

      <label className="block"><span className={lbl}>Badge</span><input className={input} value={p.badge} onChange={(e) => set({ badge: e.target.value })} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted">Heading (rich text)</span>
            <HeadingTagSelect value={c.headingTag} fallback="h2" onChange={(t) => onChange({ ...c, headingTag: t })} />
          </div>
          <RichEditor value={p.heading} onChange={(html) => set({ heading: html })} minHeight={90} />
        </div>
        <label className="block"><span className={lbl}>Highlight (gradient tail)</span><input className={input} value={p.highlight} onChange={(e) => set({ highlight: e.target.value })} /></label>
      </div>
      <div><span className={lbl}>Description (rich text)</span><RichEditor value={p.subtitle} onChange={(html) => set({ subtitle: html })} minHeight={120} /></div>

      <Btn2 label="Primary button" value={p.primary} onChange={(primary) => set({ primary })} />
      <Btn2 label="Secondary button" value={p.secondary} onChange={(secondary) => set({ secondary })} />

      {/* hero image + meta + size controls */}
      <div className="rounded-xl border border-ink/10 bg-base p-3">
        <ImagePicker label="Hero image" value={p.image} onChange={(url) => set({ image: url })} alt={false} settings={p.imageSettings} onChangeSettings={(imageSettings) => set({ imageSettings })} />
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label className="block"><span className={lbl}>Image alt (SEO)</span><input className={input} value={p.imageAlt ?? ""} onChange={(e) => set({ imageAlt: e.target.value })} /></label>
          <label className="block"><span className={lbl}>Image title</span><input className={input} value={p.imageTitle ?? ""} onChange={(e) => set({ imageTitle: e.target.value })} /></label>
          <label className="block"><span className={lbl}>Image caption</span><input className={input} value={p.imageCaption ?? ""} onChange={(e) => set({ imageCaption: e.target.value })} /></label>
          <label className="block"><span className={lbl}>Image description</span><input className={input} value={p.imageDescription ?? ""} onChange={(e) => set({ imageDescription: e.target.value })} /></label>
        </div>
      </div>

      {/* background (overrides Style → Background) */}
      <div className="rounded-xl border border-ink/10 bg-base p-3">
        <span className={lbl}>Background (optional — overrides the Style background)</span>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-muted">Colour / gradient</span>
          <input className={`${input} max-w-[240px]`} value={p.bgColor ?? ""} onChange={(e) => set({ bgColor: e.target.value })} placeholder="#0d1426 or linear-gradient(...)" />
          {p.bgColor ? <button type="button" onClick={() => set({ bgColor: "" })} className="rounded-lg border border-ink/10 px-2 py-1 text-[11px] text-muted hover:bg-ink/[0.04]">Clear</button> : null}
        </div>
        <div className="mt-2"><ImagePicker label="Background image (optional — overrides colour)" value={p.bgImage ?? null} onChange={(url) => set({ bgImage: url })} alt={false} /></div>
      </div>
    </div>
  );
}

function FeaturesEditor({ c, onChange }: { c: FeaturesContainer; onChange: (c: FeaturesContainer) => void }) {
  const p = c.props;
  const set = (patch: Partial<FeaturesContainer["props"]>) => onChange({ ...c, props: { ...p, ...patch } });
  const setItem = (id: string, patch: Partial<FeaturesContainer["props"]["items"][number]>) => set({ items: p.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  const move = (from: number, to: number) => { if (to < 0 || to >= p.items.length) return; const n = [...p.items]; const [m] = n.splice(from, 1); n.splice(to, 0, m); set({ items: n }); };
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted">Heading</span>
            <HeadingTagSelect value={c.headingTag} fallback="h2" onChange={(t) => onChange({ ...c, headingTag: t })} />
          </div>
          <input className={input} value={p.heading} onChange={(e) => set({ heading: e.target.value })} />
        </div>
        <label className="block"><span className={lbl}>Highlight</span><input className={input} value={p.highlight} onChange={(e) => set({ highlight: e.target.value })} /></label>
        <label className="block"><span className={lbl}>Columns</span><select className={input} value={p.columns} onChange={(e) => set({ columns: Number(e.target.value) as 2 | 3 | 4 })}><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></label>
      </div>
      <label className="block"><span className={lbl}>Subtitle</span><input className={input} value={p.subtitle} onChange={(e) => set({ subtitle: e.target.value })} /></label>
      <div className="space-y-2">
        {p.items.map((it, i) => (
          <div key={it.id} className="rounded-xl border border-ink/10 bg-base p-3">
            <div className="flex items-center gap-2">
              <input className="w-14 rounded-lg border border-ink/10 bg-surface px-2 py-1.5 text-center text-sm" value={it.icon} onChange={(e) => setItem(it.id, { icon: e.target.value })} title="Icon (emoji)" />
              <span className="min-w-0 flex-1 text-[11px] font-medium text-muted">Feature {i + 1}</span>
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↑</button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === p.items.length - 1} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↓</button>
              <button type="button" onClick={() => set({ items: p.items.filter((x) => x.id !== it.id) })} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500">✕</button>
            </div>
            <div className="mt-2"><span className={lbl}>Title — select a word, click 🔗 to link</span><RichEditor compact value={it.title} onChange={(html) => setItem(it.id, { title: html })} /></div>
            <div className="mt-2"><span className={lbl}>Description</span><RichEditor compact value={it.desc} onChange={(html) => setItem(it.id, { desc: html })} /></div>
          </div>
        ))}
        <button type="button" onClick={() => set({ items: [...p.items, { id: cid(), icon: "✦", title: "New feature", desc: "" }] })} className="rounded-lg border border-ink/10 px-2.5 py-1 text-xs font-medium hover:bg-ink/[0.04]">+ Add item</button>
      </div>
    </div>
  );
}

function TestimonialsEditor({ c, onChange }: { c: TestimonialsContainer; onChange: (c: TestimonialsContainer) => void }) {
  const p = c.props;
  const set = (patch: Partial<TestimonialsContainer["props"]>) => onChange({ ...c, props: { ...p, ...patch } });
  const setItem = (id: string, patch: Partial<TestimonialsContainer["props"]["items"][number]>) => set({ items: p.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted">Heading</span>
            <HeadingTagSelect value={c.headingTag} fallback="h2" onChange={(t) => onChange({ ...c, headingTag: t })} />
          </div>
          <input className={input} value={p.heading} onChange={(e) => set({ heading: e.target.value })} />
        </div>
        <label className="block"><span className={lbl}>Highlight</span><input className={input} value={p.highlight} onChange={(e) => set({ highlight: e.target.value })} /></label>
        <label className="block"><span className={lbl}>Columns</span><select className={input} value={p.columns} onChange={(e) => set({ columns: Number(e.target.value) as 2 | 3 })}><option value={2}>2</option><option value={3}>3</option></select></label>
      </div>
      <div className="space-y-2">
        {p.items.map((t) => (
          <div key={t.id} className="rounded-xl border border-ink/10 bg-base p-3">
            <div className="flex items-center justify-between"><span className="text-[11px] text-muted">Testimonial</span><button type="button" onClick={() => set({ items: p.items.filter((x) => x.id !== t.id) })} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500">✕</button></div>
            <textarea rows={2} className={`mt-2 ${input} resize-none`} value={t.quote} onChange={(e) => setItem(t.id, { quote: e.target.value })} placeholder="Quote" />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input className={input} value={t.name} onChange={(e) => setItem(t.id, { name: e.target.value })} placeholder="Name" />
              <input className={input} value={t.role} onChange={(e) => setItem(t.id, { role: e.target.value })} placeholder="Role / Company" />
            </div>
            <div className="mt-2"><ImagePicker label="Avatar (optional)" value={t.avatar} onChange={(url) => setItem(t.id, { avatar: url })} alt={false} /></div>
          </div>
        ))}
        <button type="button" onClick={() => set({ items: [...p.items, { id: cid(), quote: "", name: "", role: "", avatar: null }] })} className="rounded-lg border border-ink/10 px-2.5 py-1 text-xs font-medium hover:bg-ink/[0.04]">+ Add testimonial</button>
      </div>
    </div>
  );
}

function FaqEditor({ c, onChange }: { c: FaqContainer; onChange: (c: FaqContainer) => void }) {
  const p = c.props;
  const set = (patch: Partial<FaqContainer["props"]>) => onChange({ ...c, props: { ...p, ...patch } });
  const setItem = (id: string, patch: Partial<FaqContainer["props"]["items"][number]>) => set({ items: p.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted">Heading</span>
            <HeadingTagSelect value={c.headingTag} fallback="h2" onChange={(t) => onChange({ ...c, headingTag: t })} />
          </div>
          <input className={input} value={p.heading} onChange={(e) => set({ heading: e.target.value })} />
        </div>
        <label className="block"><span className={lbl}>Highlight</span><input className={input} value={p.highlight} onChange={(e) => set({ highlight: e.target.value })} /></label>
      </div>
      <label className="flex items-center gap-2 text-xs text-muted">
        <input type="checkbox" checked={p.showNumbers !== false} onChange={(e) => set({ showNumbers: e.target.checked })} />
        Show question numbers (01, 02, …)
      </label>
      <div className="space-y-2">
        {p.items.map((f) => (
          <div key={f.id} className="rounded-xl border border-ink/10 bg-base p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-muted">Q &amp; A — select a word, click 🔗 to link</span>
              <button type="button" onClick={() => set({ items: p.items.filter((x) => x.id !== f.id) })} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500">✕</button>
            </div>
            <div className="mt-2"><span className={lbl}>Question</span><RichEditor compact value={f.q} onChange={(html) => setItem(f.id, { q: html })} /></div>
            <div className="mt-2"><span className={lbl}>Answer</span><RichEditor compact value={f.a} onChange={(html) => setItem(f.id, { a: html })} /></div>
          </div>
        ))}
        <button type="button" onClick={() => set({ items: [...p.items, { id: cid(), q: "", a: "" }] })} className="rounded-lg border border-ink/10 px-2.5 py-1 text-xs font-medium hover:bg-ink/[0.04]">+ Add question</button>
      </div>
    </div>
  );
}

function GalleryEditor({ c, onChange }: { c: GalleryContainer; onChange: (c: GalleryContainer) => void }) {
  const p = c.props;
  const set = (patch: Partial<GalleryContainer["props"]>) => onChange({ ...c, props: { ...p, ...patch } });
  const setImg = (id: string, patch: Partial<GalleryContainer["props"]["images"][number]>) => set({ images: p.images.map((im) => (im.id === id ? { ...im, ...patch } : im)) });
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted">Heading</span>
            <HeadingTagSelect value={c.headingTag} fallback="h2" onChange={(t) => onChange({ ...c, headingTag: t })} />
          </div>
          <input className={input} value={p.heading} onChange={(e) => set({ heading: e.target.value })} />
        </div>
        <label className="block"><span className={lbl}>Columns</span><select className={input} value={p.columns} onChange={(e) => set({ columns: Number(e.target.value) as 2 | 3 | 4 })}><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></label>
      </div>
      <div className="space-y-2">
        {p.images.map((im) => (
          <div key={im.id} className="rounded-xl border border-ink/10 bg-base p-3">
            <div className="flex items-center justify-between"><span className="text-[11px] text-muted">Image</span><button type="button" onClick={() => set({ images: p.images.filter((x) => x.id !== im.id) })} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500">✕</button></div>
            <div className="mt-2"><ImagePicker value={im.url || null} onChange={(url) => setImg(im.id, { url: url || "" })} alt={false} settings={im.imageSettings} onChangeSettings={(imageSettings) => setImg(im.id, { imageSettings })} /></div>
            <input className="mt-2 w-full rounded-lg border border-ink/10 bg-surface px-3 py-1.5 text-xs" value={im.alt} onChange={(e) => setImg(im.id, { alt: e.target.value })} placeholder="Alt text (SEO)" />
          </div>
        ))}
        <button type="button" onClick={() => set({ images: [...p.images, { id: cid(), url: "", alt: "" }] })} className="rounded-lg border border-ink/10 px-2.5 py-1 text-xs font-medium hover:bg-ink/[0.04]">+ Add image</button>
      </div>
    </div>
  );
}

function ImageBannerEditor({ c, onChange }: { c: ImageBannerContainer; onChange: (c: ImageBannerContainer) => void }) {
  const p = c.props;
  const set = (patch: Partial<ImageBannerContainer["props"]>) => onChange({ ...c, props: { ...p, ...patch } });
  return (
    <div className="space-y-3">
      <ImagePicker label="Banner image" value={p.image} onChange={(url) => set({ image: url })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted">Heading (overlay)</span>
            <HeadingTagSelect value={c.headingTag} fallback="h2" onChange={(t) => onChange({ ...c, headingTag: t })} />
          </div>
          <input className={input} value={p.heading} onChange={(e) => set({ heading: e.target.value })} />
        </div>
        <label className="block"><span className={lbl}>Subtitle (overlay)</span><input className={input} value={p.subtitle} onChange={(e) => set({ subtitle: e.target.value })} /></label>
      </div>
      <Btn2 label="Button" value={p.button} onChange={(button) => set({ button })} />
      <label className="flex items-center gap-2 text-xs text-muted"><input type="checkbox" checked={p.overlay} onChange={(e) => set({ overlay: e.target.checked })} /> Darken image behind overlay text</label>
    </div>
  );
}

function RichTextEditor({ c, onChange }: { c: RichTextContainer; onChange: (c: RichTextContainer) => void }) {
  const p = c.props;
  const set = (patch: Partial<RichTextContainer["props"]>) => onChange({ ...c, props: { ...p, ...patch } });
  return (
    <div className="space-y-3">
      <label className="block max-w-[12rem]"><span className={lbl}>Width</span><select className={input} value={p.width} onChange={(e) => set({ width: e.target.value as "narrow" | "wide" })}><option value="narrow">Narrow</option><option value="wide">Wide</option></select></label>
      <div><span className={lbl}>Content</span><RichEditor value={p.html} onChange={(html) => set({ html })} /></div>
    </div>
  );
}

function CtaEditor({ c, onChange }: { c: CtaContainer; onChange: (c: CtaContainer) => void }) {
  const p = c.props;
  const set = (patch: Partial<CtaContainer["props"]>) => onChange({ ...c, props: { ...p, ...patch } });
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted">Heading</span>
            <HeadingTagSelect value={c.headingTag} fallback="h2" onChange={(t) => onChange({ ...c, headingTag: t })} />
          </div>
          <input className={input} value={p.heading} onChange={(e) => set({ heading: e.target.value })} />
        </div>
        <label className="block"><span className={lbl}>Highlight</span><input className={input} value={p.highlight} onChange={(e) => set({ highlight: e.target.value })} /></label>
      </div>
      <label className="block"><span className={lbl}>Subtitle</span><input className={input} value={p.subtitle} onChange={(e) => set({ subtitle: e.target.value })} /></label>
      <Btn2 label="Button" value={p.button} onChange={(button) => set({ button })} />
    </div>
  );
}

function HeroDescEditor({ c, onChange }: { c: HeroDescContainer; onChange: (c: HeroDescContainer) => void }) {
  return (
    <div>
      <span className={lbl}>Hero description — full formatting (bold, italic, lists, links, tables, colour, highlight)</span>
      <RichEditor value={c.props.html} onChange={(html) => onChange({ ...c, props: { html } })} />
    </div>
  );
}

function CardsEditor({ c, onChange }: { c: CardsContainer; onChange: (c: CardsContainer) => void }) {
  const p = c.props;
  const set = (patch: Partial<CardsContainer["props"]>) => onChange({ ...c, props: { ...p, ...patch } });
  const setCard = (id: string, patch: Partial<CardsContainer["props"]["items"][number]>) =>
    set({ items: p.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  const addCard = () =>
    set({ items: [...p.items, { id: cid(), title: "Card title", description: "", icon: "✨", image: null, link: "", button: { label: "", href: "" }, bg: "", bgImage: null }] });
  const removeCard = (id: string) => set({ items: p.items.filter((it) => it.id !== id) });
  const dupCard = (id: string) => {
    const i = p.items.findIndex((x) => x.id === id);
    if (i === -1) return;
    set({ items: [...p.items.slice(0, i + 1), { ...p.items[i], id: cid() }, ...p.items.slice(i + 1)] });
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= p.items.length) return;
    const n = [...p.items];
    const [m] = n.splice(from, 1);
    n.splice(to, 0, m);
    set({ items: n });
  };
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted">Heading</span>
            <HeadingTagSelect value={c.headingTag} fallback="h2" onChange={(t) => onChange({ ...c, headingTag: t })} />
          </div>
          <input className={input} value={p.heading} onChange={(e) => set({ heading: e.target.value })} />
        </div>
        <label className="block"><span className={lbl}>Highlight</span><input className={input} value={p.highlight} onChange={(e) => set({ highlight: e.target.value })} /></label>
        <label className="block"><span className={lbl}>Columns</span><select className={input} value={p.columns} onChange={(e) => set({ columns: Number(e.target.value) as 2 | 3 | 4 })}><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></label>
      </div>
      <div className="space-y-2">
        {p.items.map((card, i) => (
          <div
            key={card.id}
            className="rounded-xl border border-ink/10 bg-base p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-muted">Card {i + 1}</span>
              </span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↑</button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === p.items.length - 1} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↓</button>
                <button type="button" onClick={() => dupCard(card.id)} className="rounded-lg border border-ink/10 px-2 py-1 text-xs hover:bg-ink/[0.04]">Duplicate</button>
                <button type="button" onClick={() => removeCard(card.id)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500">✕</button>
              </div>
            </div>
            <div className="mt-2 grid items-start gap-2 sm:grid-cols-[1fr_5rem]">
              <div>
                <span className={lbl}>Card title</span>
                <RichEditor value={card.title} onChange={(html) => setCard(card.id, { title: html })} minHeight={48} />
              </div>
              <label className="block"><span className={lbl}>Icon</span><input className={`${input} text-center`} value={card.icon} onChange={(e) => setCard(card.id, { icon: e.target.value })} placeholder="🙂" title="Icon (emoji) — shown when no image is set" /></label>
            </div>
            <div className="mt-2">
              <span className={lbl}>Card description</span>
              <RichEditor value={card.description} onChange={(html) => setCard(card.id, { description: html })} minHeight={100} />
            </div>
            <input className={`mt-2 ${input}`} value={card.link} onChange={(e) => setCard(card.id, { link: e.target.value })} placeholder="Card link (optional — makes the whole card clickable)" />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input className={input} value={card.button.label} onChange={(e) => setCard(card.id, { button: { ...card.button, label: e.target.value } })} placeholder="Button label (optional)" />
              <input className={input} value={card.button.href} onChange={(e) => setCard(card.id, { button: { ...card.button, href: e.target.value } })} placeholder="Button link" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] text-muted">Background colour</span>
              <input type="color" value={card.bg || "#ffffff"} onChange={(e) => setCard(card.id, { bg: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-ink/10" />
              {card.bg && <button type="button" onClick={() => setCard(card.id, { bg: "" })} className="rounded-lg border border-ink/10 px-2 py-1 text-[11px] text-muted hover:bg-ink/[0.04]">Clear colour</button>}
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <ImagePicker label="Card image / icon" value={card.image} onChange={(url) => setCard(card.id, { image: url })} alt={false} settings={card.imageSettings} onChangeSettings={(imageSettings) => setCard(card.id, { imageSettings })} />
              <ImagePicker label="Background image (optional)" value={card.bgImage} onChange={(url) => setCard(card.id, { bgImage: url })} alt={false} />
            </div>
          </div>
        ))}
        <button type="button" onClick={addCard} className="rounded-lg border border-ink/10 px-2.5 py-1 text-xs font-medium hover:bg-ink/[0.04]">+ Add card</button>
      </div>
    </div>
  );
}

function ServicesEditor({ c, onChange }: { c: ServicesContainer; onChange: (c: ServicesContainer) => void }) {
  const p = c.props;
  const set = (patch: Partial<ServicesContainer["props"]>) => onChange({ ...c, props: { ...p, ...patch } });
  const setItem = (id: string, patch: Partial<ServicesContainer["props"]["items"][number]>) => set({ items: p.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  const move = (from: number, to: number) => { if (to < 0 || to >= p.items.length) return; const n = [...p.items]; const [m] = n.splice(from, 1); n.splice(to, 0, m); set({ items: n }); };
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted">Heading</span>
            <HeadingTagSelect value={c.headingTag} fallback="h2" onChange={(t) => onChange({ ...c, headingTag: t })} />
          </div>
          <input className={input} value={p.heading} onChange={(e) => set({ heading: e.target.value })} />
        </div>
        <label className="block"><span className={lbl}>Highlight</span><input className={input} value={p.highlight} onChange={(e) => set({ highlight: e.target.value })} /></label>
        <label className="block"><span className={lbl}>Columns</span><select className={input} value={p.columns} onChange={(e) => set({ columns: Number(e.target.value) as 2 | 3 | 4 })}><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></label>
      </div>
      <label className="block"><span className={lbl}>Subtitle</span><input className={input} value={p.subtitle} onChange={(e) => set({ subtitle: e.target.value })} /></label>
      <div className="space-y-2">
        {p.items.map((it, i) => (
          <div key={it.id} className="rounded-xl border border-ink/10 bg-base p-3">
            <div className="flex items-center gap-2">
              <input className="w-14 rounded-lg border border-ink/10 bg-surface px-2 py-1.5 text-center text-sm" value={it.icon} onChange={(e) => setItem(it.id, { icon: e.target.value })} title="Icon (emoji)" />
              <span className="min-w-0 flex-1 text-[11px] font-medium text-muted">Service {i + 1}</span>
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↑</button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === p.items.length - 1} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↓</button>
              <button type="button" onClick={() => set({ items: p.items.filter((x) => x.id !== it.id) })} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500">✕</button>
            </div>
            <div className="mt-2"><span className={lbl}>Title — select a word, click 🔗 to link</span><RichEditor compact value={it.title} onChange={(html) => setItem(it.id, { title: html })} /></div>
            <div className="mt-2"><span className={lbl}>Description</span><RichEditor compact value={it.desc} onChange={(html) => setItem(it.id, { desc: html })} /></div>
            <input className="mt-2 w-full rounded-lg border border-ink/10 bg-surface px-3 py-1.5 text-xs" value={it.href} onChange={(e) => setItem(it.id, { href: e.target.value })} placeholder="Link (optional)" />
          </div>
        ))}
        <button type="button" onClick={() => set({ items: [...p.items, { id: cid(), icon: "✦", title: "New service", desc: "", href: "" }] })} className="rounded-lg border border-ink/10 px-2.5 py-1 text-xs font-medium hover:bg-ink/[0.04]">+ Add service</button>
      </div>
    </div>
  );
}

function AboutEditor({ c, onChange }: { c: AboutContainer; onChange: (c: AboutContainer) => void }) {
  const p = c.props;
  const set = (patch: Partial<AboutContainer["props"]>) => onChange({ ...c, props: { ...p, ...patch } });
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block"><span className={lbl}>Eyebrow</span><input className={input} value={p.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} /></label>
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted">Heading</span>
            <HeadingTagSelect value={c.headingTag} fallback="h2" onChange={(t) => onChange({ ...c, headingTag: t })} />
          </div>
          <input className={input} value={p.heading} onChange={(e) => set({ heading: e.target.value })} />
        </div>
        <label className="block"><span className={lbl}>Highlight</span><input className={input} value={p.highlight} onChange={(e) => set({ highlight: e.target.value })} /></label>
      </div>
      <div><span className={lbl}>Body (rich text)</span><RichEditor value={p.bodyHtml} onChange={(html) => set({ bodyHtml: html })} /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ImagePicker label="Image" value={p.image} onChange={(url) => set({ image: url })} settings={p.imageSettings} onChangeSettings={(imageSettings) => set({ imageSettings })} />
        <label className="block"><span className={lbl}>Image position</span><select className={input} value={p.imagePosition} onChange={(e) => set({ imagePosition: e.target.value as "left" | "right" })}><option value="right">Right</option><option value="left">Left</option></select></label>
      </div>
    </div>
  );
}

function ImageContentEditor({ c, onChange }: { c: ImageContentContainer; onChange: (c: ImageContentContainer) => void }) {
  const p = c.props;
  const set = (patch: Partial<ImageContentContainer["props"]>) => onChange({ ...c, props: { ...p, ...patch } });
  const setBullet = (id: string, text: string) => set({ bullets: p.bullets.map((b) => (b.id === id ? { ...b, text } : b)) });
  const moveBullet = (from: number, to: number) => {
    if (to < 0 || to >= p.bullets.length) return;
    const n = [...p.bullets];
    const [m] = n.splice(from, 1);
    n.splice(to, 0, m);
    set({ bullets: n });
  };
  return (
    <div className="space-y-3">
      {/* layout controls */}
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="block"><span className={lbl}>Image position</span>
          <select className={input} value={p.imagePosition} onChange={(e) => set({ imagePosition: e.target.value as "left" | "right" })}>
            <option value="right">Right</option><option value="left">Left</option>
          </select>
        </label>
        <label className="block"><span className={lbl}>Width (content / image)</span>
          <select className={input} value={p.widthSplit} onChange={(e) => set({ widthSplit: e.target.value as ImageContentContainer["props"]["widthSplit"] })}>
            <option value="50-50">50 / 50</option><option value="60-40">60 / 40</option><option value="40-60">40 / 60</option><option value="70-30">70 / 30</option><option value="30-70">30 / 70</option>
          </select>
        </label>
        <label className="block"><span className={lbl}>Vertical align</span>
          <select className={input} value={p.verticalAlign} onChange={(e) => set({ verticalAlign: e.target.value as "top" | "center" | "bottom" })}>
            <option value="top">Top</option><option value="center">Center</option><option value="bottom">Bottom</option>
          </select>
        </label>
        <label className="block"><span className={lbl}>Mobile order</span>
          <select className={input} value={p.mobileOrder} onChange={(e) => set({ mobileOrder: e.target.value as "image-first" | "content-first" })}>
            <option value="image-first">Image first</option><option value="content-first">Content first</option>
          </select>
        </label>
      </div>

      {/* content */}
      <label className="block"><span className={lbl}>Badge</span><input className={input} value={p.badge} onChange={(e) => set({ badge: e.target.value })} /></label>
      <div><span className={lbl}>Heading (rich text)</span><RichEditor value={p.heading} onChange={(html) => set({ heading: html })} /></div>
      <div><span className={lbl}>Description (rich text)</span><RichEditor value={p.description} onChange={(html) => set({ description: html })} /></div>

      {/* bullets */}
      <div className="space-y-2">
        <span className={lbl}>Bullet list</span>
        {p.bullets.map((b, i) => (
          <div key={b.id} className="rounded-xl border border-ink/10 bg-base p-2">
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <span className="min-w-0 flex-1 text-[11px] font-medium text-muted">Bullet {i + 1} — select a word, click 🔗 to link</span>
              <button type="button" onClick={() => moveBullet(i, i - 1)} disabled={i === 0} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↑</button>
              <button type="button" onClick={() => moveBullet(i, i + 1)} disabled={i === p.bullets.length - 1} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↓</button>
              <button type="button" onClick={() => set({ bullets: p.bullets.filter((x) => x.id !== b.id) })} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500">✕</button>
            </div>
            <div className="mt-2"><RichEditor compact value={b.text} onChange={(html) => setBullet(b.id, html)} /></div>
          </div>
        ))}
        <button type="button" onClick={() => set({ bullets: [...p.bullets, { id: cid(), text: "" }] })} className="rounded-lg border border-ink/10 px-2.5 py-1 text-xs font-medium hover:bg-ink/[0.04]">+ Add bullet</button>
      </div>

      {/* buttons */}
      <Btn2 label="Primary" value={p.primary} onChange={(primary) => set({ primary })} />
      <Btn2 label="Secondary (optional)" value={p.secondary} onChange={(secondary) => set({ secondary })} />

      {/* image + meta */}
      <div className="rounded-xl border border-ink/10 bg-base p-3">
        <ImagePicker label="Image" value={p.image} onChange={(url) => set({ image: url })} alt={false} settings={p.imageSettings} onChangeSettings={(imageSettings) => set({ imageSettings })} />
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label className="block"><span className={lbl}>Image alt (SEO)</span><input className={input} value={p.imageAlt} onChange={(e) => set({ imageAlt: e.target.value })} /></label>
          <label className="block"><span className={lbl}>Image title</span><input className={input} value={p.imageTitle} onChange={(e) => set({ imageTitle: e.target.value })} /></label>
          <label className="block"><span className={lbl}>Image caption</span><input className={input} value={p.imageCaption} onChange={(e) => set({ imageCaption: e.target.value })} /></label>
          <label className="block"><span className={lbl}>Image description</span><input className={input} value={p.imageDescription} onChange={(e) => set({ imageDescription: e.target.value })} /></label>
        </div>
      </div>

      {/* background (Solid colour / Image — on top of the shared Style → Background) */}
      <div className="rounded-xl border border-ink/10 bg-base p-3">
        <span className={lbl}>Background (optional — overrides the Style background below)</span>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-muted">Solid colour</span>
          <input type="color" value={p.bgColor || "#ffffff"} onChange={(e) => set({ bgColor: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-ink/10" />
          {p.bgColor && <button type="button" onClick={() => set({ bgColor: "" })} className="rounded-lg border border-ink/10 px-2 py-1 text-[11px] text-muted hover:bg-ink/[0.04]">Clear colour</button>}
        </div>
        <div className="mt-2"><ImagePicker label="Background image (optional — overrides colour)" value={p.bgImage} onChange={(url) => set({ bgImage: url })} alt={false} /></div>
        <p className="mt-1 text-[11px] text-muted">For a gradient or transparent background, use <b>Style → Background</b> below and leave these empty.</p>
      </div>
    </div>
  );
}

function ImageEditor({ c, onChange }: { c: ImageContainer; onChange: (c: ImageContainer) => void }) {
  const p = c.props;
  const set = (patch: Partial<ImageContainer["props"]>) => onChange({ ...c, props: { ...p, ...patch } });
  return (
    <div className="space-y-3">
      <ImagePicker label="Image" value={p.url} onChange={(url) => set({ url })} alt={false} settings={p.imageSettings} onChangeSettings={(imageSettings) => set({ imageSettings })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><span className={lbl}>Alt text (SEO)</span><input className={input} value={p.alt} onChange={(e) => set({ alt: e.target.value })} /></label>
        <label className="block"><span className={lbl}>Caption (optional)</span><input className={input} value={p.caption} onChange={(e) => set({ caption: e.target.value })} /></label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><span className={lbl}>Width</span><select className={input} value={p.width} onChange={(e) => set({ width: e.target.value as "container" | "full" })}><option value="container">Contained</option><option value="full">Full width</option></select></label>
        <label className="flex items-center gap-2 pt-5 text-xs text-muted"><input type="checkbox" checked={p.rounded} onChange={(e) => set({ rounded: e.target.checked })} /> Rounded corners</label>
      </div>
    </div>
  );
}

function VideoEditor({ c, onChange }: { c: VideoContainer; onChange: (c: VideoContainer) => void }) {
  const p = c.props;
  const set = (patch: Partial<VideoContainer["props"]>) => onChange({ ...c, props: { ...p, ...patch } });
  return (
    <div className="space-y-3">
      <label className="block"><span className={lbl}>Video URL (YouTube, Vimeo, or .mp4)</span><input className={input} value={p.url} onChange={(e) => set({ url: e.target.value })} placeholder="https://youtube.com/watch?v=…" /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><span className={lbl}>Caption (optional)</span><input className={input} value={p.caption} onChange={(e) => set({ caption: e.target.value })} /></label>
        <label className="block"><span className={lbl}>Aspect ratio</span><select className={input} value={p.aspect} onChange={(e) => set({ aspect: e.target.value as "16:9" | "4:3" | "1:1" })}><option value="16:9">16:9</option><option value="4:3">4:3</option><option value="1:1">1:1</option></select></label>
      </div>
    </div>
  );
}

function TeamEditor({ c, onChange }: { c: TeamContainer; onChange: (c: TeamContainer) => void }) {
  const p = c.props;
  const set = (patch: Partial<TeamContainer["props"]>) => onChange({ ...c, props: { ...p, ...patch } });
  const setItem = (id: string, patch: Partial<TeamContainer["props"]["items"][number]>) => set({ items: p.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  const move = (from: number, to: number) => { if (to < 0 || to >= p.items.length) return; const n = [...p.items]; const [m] = n.splice(from, 1); n.splice(to, 0, m); set({ items: n }); };
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted">Heading</span>
            <HeadingTagSelect value={c.headingTag} fallback="h2" onChange={(t) => onChange({ ...c, headingTag: t })} />
          </div>
          <input className={input} value={p.heading} onChange={(e) => set({ heading: e.target.value })} />
        </div>
        <label className="block"><span className={lbl}>Highlight</span><input className={input} value={p.highlight} onChange={(e) => set({ highlight: e.target.value })} /></label>
        <label className="block"><span className={lbl}>Columns</span><select className={input} value={p.columns} onChange={(e) => set({ columns: Number(e.target.value) as 2 | 3 | 4 })}><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></label>
      </div>
      <div className="space-y-2">
        {p.items.map((m, i) => (
          <div key={m.id} className="rounded-xl border border-ink/10 bg-base p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted">Member {i + 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↑</button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === p.items.length - 1} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↓</button>
                <button type="button" onClick={() => set({ items: p.items.filter((x) => x.id !== m.id) })} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500">✕</button>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input className={input} value={m.name} onChange={(e) => setItem(m.id, { name: e.target.value })} placeholder="Name" />
              <input className={input} value={m.role} onChange={(e) => setItem(m.id, { role: e.target.value })} placeholder="Role" />
            </div>
            <textarea rows={2} className={`mt-2 ${input} resize-none`} value={m.bio} onChange={(e) => setItem(m.id, { bio: e.target.value })} placeholder="Short bio (optional)" />
            <div className="mt-2"><ImagePicker label="Photo" value={m.photo} onChange={(url) => setItem(m.id, { photo: url })} alt={false} /></div>
          </div>
        ))}
        <button type="button" onClick={() => set({ items: [...p.items, { id: cid(), name: "", role: "", photo: null, bio: "" }] })} className="rounded-lg border border-ink/10 px-2.5 py-1 text-xs font-medium hover:bg-ink/[0.04]">+ Add member</button>
      </div>
    </div>
  );
}

function ContactFormEditor({ c, onChange }: { c: ContactFormContainer; onChange: (c: ContactFormContainer) => void }) {
  const p = c.props;
  const set = (patch: Partial<ContactFormContainer["props"]>) => onChange({ ...c, props: { ...p, ...patch } });
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted">Heading</span>
            <HeadingTagSelect value={c.headingTag} fallback="h2" onChange={(t) => onChange({ ...c, headingTag: t })} />
          </div>
          <input className={input} value={p.heading} onChange={(e) => set({ heading: e.target.value })} />
        </div>
        <label className="block"><span className={lbl}>Highlight</span><input className={input} value={p.highlight} onChange={(e) => set({ highlight: e.target.value })} /></label>
      </div>
      <label className="block"><span className={lbl}>Subtitle</span><input className={input} value={p.subtitle} onChange={(e) => set({ subtitle: e.target.value })} /></label>
      <label className="block"><span className={lbl}>Button label</span><input className={input} value={p.buttonLabel} onChange={(e) => set({ buttonLabel: e.target.value })} /></label>
      <p className="text-[11px] text-muted">Submissions land in <b>Leads</b> (same as the site&rsquo;s main contact form).</p>
    </div>
  );
}

function AdvantageEditor({ c, onChange }: { c: AdvantageContainer; onChange: (c: AdvantageContainer) => void }) {
  const p = c.props;
  const set = (patch: Partial<AdvantageContainer["props"]>) => onChange({ ...c, props: { ...p, ...patch } });
  const setItem = (id: string, patch: Partial<AdvantageContainer["props"]["items"][number]>) => set({ items: p.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  const move = (from: number, to: number) => { if (to < 0 || to >= p.items.length) return; const n = [...p.items]; const [m] = n.splice(from, 1); n.splice(to, 0, m); set({ items: n }); };
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block"><span className={lbl}>Badge</span><input className={input} value={p.badge} onChange={(e) => set({ badge: e.target.value })} /></label>
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted">Heading</span>
            <HeadingTagSelect value={c.headingTag} fallback="h2" onChange={(t) => onChange({ ...c, headingTag: t })} />
          </div>
          <input className={input} value={p.heading} onChange={(e) => set({ heading: e.target.value })} />
        </div>
        <label className="block"><span className={lbl}>Highlight</span><input className={input} value={p.highlight} onChange={(e) => set({ highlight: e.target.value })} /></label>
      </div>
      <label className="block"><span className={lbl}>Description</span><textarea rows={2} className={`${input} resize-none`} value={p.description} onChange={(e) => set({ description: e.target.value })} /></label>
      <div className="space-y-2">
        <span className={lbl}>Checklist items</span>
        {p.items.map((it, i) => (
          <div key={it.id} className="rounded-xl border border-ink/10 bg-base p-3">
            <div className="flex items-center gap-2">
              <input className="w-14 rounded-lg border border-ink/10 bg-surface px-2 py-1.5 text-center text-sm" value={it.icon} onChange={(e) => setItem(it.id, { icon: e.target.value })} title="Icon (emoji) — used when no image is set" />
              <span className="min-w-0 flex-1 text-[11px] font-medium text-muted">Benefit {i + 1}</span>
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↑</button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === p.items.length - 1} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↓</button>
              <button type="button" onClick={() => set({ items: p.items.filter((x) => x.id !== it.id) })} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500">✕</button>
            </div>
            <div className="mt-2"><span className={lbl}>Checklist item — select a word, click 🔗 to link</span><RichEditor compact value={it.title} onChange={(html) => setItem(it.id, { title: html })} /></div>
            <div className="mt-2"><span className={lbl}>Sub-text (optional)</span><RichEditor compact value={it.desc} onChange={(html) => setItem(it.id, { desc: html })} /></div>
            <div className="mt-2"><ImagePicker label="Icon image (optional — replaces the emoji icon)" value={it.image} onChange={(url) => setItem(it.id, { image: url })} alt={false} /></div>
          </div>
        ))}
        <button type="button" onClick={() => set({ items: [...p.items, { id: cid(), icon: "✓", image: null, title: "New benefit", desc: "" }] })} className="rounded-lg border border-ink/10 px-2.5 py-1 text-xs font-medium hover:bg-ink/[0.04]">+ Add item</button>
      </div>
    </div>
  );
}

function WorkflowEditor({ c, onChange }: { c: WorkflowContainer; onChange: (c: WorkflowContainer) => void }) {
  const p = c.props;
  const set = (patch: Partial<WorkflowContainer["props"]>) => onChange({ ...c, props: { ...p, ...patch } });
  const setStep = (id: string, patch: Partial<WorkflowContainer["props"]["steps"][number]>) =>
    set({ steps: p.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  const addStep = () =>
    set({ steps: [...p.steps, { id: cid(), title: "New step", desc: "", icon: "✨", image: null, bg: "", border: "", text: "", arrow: "", enabled: true }] });
  const removeStep = (id: string) => set({ steps: p.steps.filter((s) => s.id !== id) });
  const dupStep = (id: string) => {
    const i = p.steps.findIndex((x) => x.id === id);
    if (i === -1) return;
    set({ steps: [...p.steps.slice(0, i + 1), { ...p.steps[i], id: cid() }, ...p.steps.slice(i + 1)] });
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= p.steps.length) return;
    const n = [...p.steps];
    const [m] = n.splice(from, 1);
    n.splice(to, 0, m);
    set({ steps: n });
  };
  const colorField = (label: string, value: string, onColor: (v: string) => void) => (
    <span className="flex items-center gap-1.5">
      <span className="text-[11px] text-muted">{label}</span>
      <input type="color" value={value || "#ffffff"} onChange={(e) => onColor(e.target.value)} className="h-7 w-9 cursor-pointer rounded border border-ink/10" />
      {value ? <button type="button" onClick={() => onColor("")} title="Clear" className="rounded border border-ink/10 px-1.5 py-0.5 text-[10px] text-muted hover:bg-ink/[0.04]">✕</button> : null}
    </span>
  );
  return (
    <div className="space-y-3">
      <label className="block"><span className={lbl}>Eyebrow (optional)</span><input className={input} value={p.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} /></label>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted">Heading (lead)</span>
            <HeadingTagSelect value={c.headingTag} fallback="h2" onChange={(t) => onChange({ ...c, headingTag: t })} />
          </div>
          <input className={input} value={p.heading} onChange={(e) => set({ heading: e.target.value })} />
        </div>
        <label className="block"><span className={lbl}>Heading (highlight)</span><input className={input} value={p.highlight} onChange={(e) => set({ highlight: e.target.value })} /></label>
        <label className="block"><span className={lbl}>Heading (tail)</span><input className={input} value={p.headingTail} onChange={(e) => set({ headingTail: e.target.value })} /></label>
      </div>
      <div><span className={lbl}>Subtitle (rich text)</span><RichEditor value={p.subtitle} onChange={(html) => set({ subtitle: html })} /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><span className={lbl}>Layout</span>
          <select className={input} value={p.layout} onChange={(e) => set({ layout: e.target.value as WorkflowContainer["props"]["layout"] })}>
            <option value="horizontal">Horizontal Workflow</option>
            <option value="vertical">Vertical Workflow</option>
            <option value="zigzag">Zig-Zag Workflow</option>
          </select>
        </label>
        <label className="block"><span className={lbl}>Container width</span>
          <select className={input} value={p.width} onChange={(e) => set({ width: e.target.value as WorkflowContainer["props"]["width"] })}>
            <option value="narrow">Narrow</option>
            <option value="default">Default</option>
            <option value="wide">Wide</option>
            <option value="full">Full width</option>
          </select>
        </label>
      </div>
      <div className="space-y-2">
        <span className={lbl}>Workflow steps</span>
        {p.steps.map((s, i) => (
          <div
            key={s.id}
            className={`rounded-xl border border-ink/10 bg-base p-3 ${!s.enabled ? "opacity-50" : ""}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-muted">Step {i + 1}</span>
              </span>
              <div className="flex items-center gap-1">
                <label className="mr-1 flex items-center gap-1 text-[11px] text-muted" title="Show this step on the live page">
                  <input type="checkbox" checked={s.enabled} onChange={(e) => setStep(s.id, { enabled: e.target.checked })} /> On
                </label>
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↑</button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === p.steps.length - 1} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↓</button>
                <button type="button" onClick={() => dupStep(s.id)} className="rounded-lg border border-ink/10 px-2 py-1 text-xs hover:bg-ink/[0.04]">Duplicate</button>
                <button type="button" onClick={() => removeStep(s.id)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500">✕</button>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="min-w-0 flex-1 text-[11px] font-medium text-muted">Title &amp; description support 🔗 word links</span>
              <input className={`${input} w-20 text-center`} value={s.icon} onChange={(e) => setStep(s.id, { icon: e.target.value })} placeholder="Icon" title="Icon (emoji) — used when no image is set" />
            </div>
            <div className="mt-2"><span className={lbl}>Title</span><RichEditor compact value={s.title} onChange={(html) => setStep(s.id, { title: html })} /></div>
            <div className="mt-2"><span className={lbl}>Description (optional)</span><RichEditor compact value={s.desc} onChange={(html) => setStep(s.id, { desc: html })} /></div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              {colorField("Background", s.bg, (bg) => setStep(s.id, { bg }))}
              {colorField("Border", s.border, (border) => setStep(s.id, { border }))}
              {colorField("Text", s.text, (text) => setStep(s.id, { text }))}
              {colorField("Arrow", s.arrow, (arrow) => setStep(s.id, { arrow }))}
            </div>
            <div className="mt-2"><ImagePicker label="Step image (optional — replaces the icon)" value={s.image} onChange={(url) => setStep(s.id, { image: url })} alt={false} /></div>
          </div>
        ))}
        <button type="button" onClick={addStep} className="rounded-lg border border-ink/10 px-2.5 py-1 text-xs font-medium hover:bg-ink/[0.04]">+ Add step</button>
      </div>
    </div>
  );
}

function CustomEditor({ c, onChange }: { c: CustomContainer; onChange: (c: CustomContainer) => void }) {
  return (
    <div>
      <span className={lbl}>Custom HTML / embed code</span>
      <textarea
        rows={6}
        className={`${input} font-mono`}
        value={c.props.html}
        onChange={(e) => onChange({ ...c, props: { html: e.target.value } })}
        placeholder="<iframe …></iframe> or any HTML"
      />
      <p className="mt-1 text-[11px] text-muted">Rendered as-is on the live page. Use for embeds (maps, forms, widgets) or custom markup.</p>
    </div>
  );
}

/** Renders the correct editor for a container's type. */
export function ContainerBody({ container, onChange }: { container: PageContainer; onChange: (c: PageContainer) => void }) {
  switch (container.type) {
    case "hero": return <HeroEditor c={container} onChange={onChange} />;
    case "herodesc": return <HeroDescEditor c={container} onChange={onChange} />;
    case "features": return <FeaturesEditor c={container} onChange={onChange} />;
    case "services": return <ServicesEditor c={container} onChange={onChange} />;
    case "about": return <AboutEditor c={container} onChange={onChange} />;
    case "cards": return <CardsEditor c={container} onChange={onChange} />;
    case "imagecontent": return <ImageContentEditor c={container} onChange={onChange} />;
    case "richtext": return <RichTextEditor c={container} onChange={onChange} />;
    case "image": return <ImageEditor c={container} onChange={onChange} />;
    case "imagebanner": return <ImageBannerEditor c={container} onChange={onChange} />;
    case "gallery": return <GalleryEditor c={container} onChange={onChange} />;
    case "video": return <VideoEditor c={container} onChange={onChange} />;
    case "testimonials": return <TestimonialsEditor c={container} onChange={onChange} />;
    case "faq": return <FaqEditor c={container} onChange={onChange} />;
    case "cta": return <CtaEditor c={container} onChange={onChange} />;
    case "team": return <TeamEditor c={container} onChange={onChange} />;
    case "contactform": return <ContactFormEditor c={container} onChange={onChange} />;
    case "advantage": return <AdvantageEditor c={container} onChange={onChange} />;
    case "workflow": return <WorkflowEditor c={container} onChange={onChange} />;
    case "custom": return <CustomEditor c={container} onChange={onChange} />;
    default: return null;
  }
}
