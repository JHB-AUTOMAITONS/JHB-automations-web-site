import { Fragment, memo, type ReactNode } from "react";
import Link from "next/link";
import { Heading, subHeadingTag, richHeadingFontSize } from "./heading";
import ContainerContactForm from "./containerContactForm";
import type {
  AboutContainer,
  AdvantageContainer,
  CardsContainer,
  ContactFormContainer,
  CtaContainer,
  CustomContainer,
  FaqContainer,
  FeaturesContainer,
  GalleryContainer,
  HeroContainer,
  HeroDescContainer,
  ImageBannerContainer,
  ImageContainer,
  ImageContentContainer,
  PageContainer,
  RichTextContainer,
  ServicesContainer,
  TeamContainer,
  TestimonialsContainer,
  VideoContainer,
  WorkflowContainer,
  WorkflowStep,
  WorkflowWidth,
  ContainerStyle,
} from "./containers";
import {
  smartImgAttrs,
  mergeHeroContainers,
  stripHeadingTags,
  ALIGN_TEXT,
  ALIGN_ITEMS,
  ALIGN_JUSTIFY,
  ALIGN_BLOCK,
  toAlign,
  richTextAlign,
  CONTAINER_LABELS,
} from "./containers";
import { sanitizeRichText } from "./richText";
import { RichInline } from "./richInline";
import { ErrorBoundary } from "./errorBoundary";

// Defensive helpers: container data comes from a jsonb column that may predate a
// field, be hand-edited, or be written by another app — so a renderer must never
// assume an array/object prop exists. `arr` yields a safe array to map/filter over;
// `btn` yields a safe {label, href} so `.label` can't throw on a missing button.
const arr = <T,>(v: T[] | null | undefined): T[] => (Array.isArray(v) ? v : []);
const btn = (b: { label?: string; href?: string } | null | undefined) => b ?? { label: "", href: "" };
const COLS_FALLBACK = "sm:grid-cols-2 lg:grid-cols-3";

/**
 * SINGLE source of truth for rendering page-builder containers. Used by the
 * public website AND every admin editor preview, so the editor preview matches
 * the live page exactly and new container types light up everywhere at once.
 *
 * `Reveal` here is a plain wrapper (same DOM as the website's animated Reveal,
 * minus the framer-motion scroll-fade — which the admin app doesn't depend on).
 * The page's NATIVE sections keep their own animations; only these inserted
 * container sections render statically.
 */
function Reveal({ children, className }: { children: ReactNode; delay?: number; className?: string }) {
  return <div className={className}>{children}</div>;
}

// Vertical rhythm for builder sections is NOT set here per-container anymore —
// it comes from the GLOBAL section-spacing system (globals.css, mirrored in the
// admin so previews match). Every container section carries `.section-y`, which
// gives it the one shared gap below the previous section (never doubled) and, if
// it has its own background, the shared internal padding. This is what makes any
// newly-added container inherit perfect, consistent spacing automatically — the
// per-container `padding` control no longer affects the section rhythm.
//
// `shellBg` returns ONLY the visual background classes plus the `.sec-bg-*`
// marker the spacing system reads (to know a section has a background, and which
// colour, for the same-colour merge). A transparent container returns "".
const SEC_BG: Record<ContainerStyle["bg"], string> = {
  none: "",
  subtle: "sec-bg-subtle bg-base",
  gradient: "sec-bg-gradient bg-gradient-to-br from-primary/10 via-surface to-secondary/10",
  dark: "sec-bg-dark bg-ink text-white",
};
const COLS: Record<2 | 3 | 4, string> = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" };

// Full section class for a container: the global rhythm marker + its background.
function shell(style: ContainerStyle): string {
  return `section-y ${SEC_BG[style.bg] ?? ""}`.trim();
}

function Head({ lead, highlight }: { lead: string; highlight: string }) {
  return (
    <>
      {lead}
      {highlight ? (<>{" "}<span className="grad-text">{highlight}</span></>) : null}
    </>
  );
}

// Plain-text version of a rich-text value — for attributes (alt / aria-label)
// that must not contain markup.
const stripTags = (html: string) => (html || "").replace(/<[^>]+>/g, "").trim();

// Remove background styles that ride in on HTML pasted from Word / Google Docs
// (e.g. style="background: rgb(244, 244, 244)") so rich hero text never renders
// inside a light box on the dark site. By default only BLOCK elements are
// cleaned — span-level backgrounds are the editor's intentional highlight
// feature. Pass `all` to also strip spans (used for headings, which must never
// carry a background).
const BG_BLOCK_TAGS = /^(p|div|h[1-6]|ul|ol|li|section|article|blockquote|font)$/i;
function stripBgStyles(html: string, all = false): string {
  if (!html || !/background|bgcolor/i.test(html)) return html;
  return html.replace(/<([a-z][a-z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/gi, (m, tag, attrs) => {
    if (!all && !BG_BLOCK_TAGS.test(tag)) return m;
    const cleaned = (attrs as string)
      .replace(/\s+bgcolor\s*=\s*("[^"]*"|'[^']*'|\S+)/gi, "")
      .replace(/style\s*=\s*"([^"]*)"/gi, (_s, css: string) => `style="${css.replace(/background(?:-color)?\s*:[^;"]*;?/gi, "")}"`)
      .replace(/style\s*=\s*'([^']*)'/gi, (_s, css: string) => `style='${css.replace(/background(?:-color)?\s*:[^;']*;?/gi, "")}'`)
      .replace(/\s+style\s*=\s*(""|'')/gi, "");
    return `<${tag}${cleaned}>`;
  });
}

function Hero({ c }: { c: HeroContainer }) {
  const p = c.props;
  if (p.hidden) return null;
  const imgA = smartImgAttrs(p.imageSettings, { extraClass: "mt-10 rounded-3xl border border-ink/10 shadow-soft" });
  // Optional custom background (colour/gradient or image) overrides the shared style.bg.
  // A custom background still opts into the global rhythm (.section-y) and gets the
  // shared internal padding via `.sec-bg-custom`, so its content never touches the edge.
  const hasCustomBg = !!(p.bgImage || p.bgColor);
  const sectionClass = hasCustomBg ? "section-y sec-bg-custom" : shell(c.style);
  const sectionStyle = p.bgImage
    ? { backgroundImage: `url(${p.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" as const }
    : p.bgColor
      ? { background: p.bgColor }
      : undefined;
  // Heading: plain values keep the real <hN> tag (SEO); rich HTML renders in a
  // heading-styled div (bold → gradient). Highlight is appended as a gradient tail.
  // Backgrounds are stripped so Word/Docs-pasted headings never bring a light box
  // onto the dark theme (the heading strips ALL backgrounds; the description only
  // block-level ones, keeping the editor's intentional word highlights).
  const headingIsRich = /<[a-z][\s\S]*?>/i.test(p.heading || "");
  const headingHtml = stripHeadingTags(stripBgStyles(
    `${p.heading || ""}${p.highlight ? ` <span class="grad-text">${p.highlight}</span>` : ""}`,
    true,
  ));
  const subtitleHtml = stripBgStyles(p.subtitle || "");
  const a = toAlign(c.style.align);
  // Per-field alignment authored in the rich heading overrides the section align.
  const headingTA = richTextAlign(p.heading);
  // Mirror any authored font-size onto the heading element so wrapped lines sit
  // tight (the element's larger responsive size would otherwise make the line-box
  // strut taller than the text). Spacing-only; see richHeadingFontSize.
  const headingFontSize = richHeadingFontSize(headingHtml);
  return (
    <section className={sectionClass} style={sectionStyle}>
      <div className={`container-x ${ALIGN_TEXT[a]}`}>
        <div className={`max-w-3xl ${ALIGN_BLOCK[a]}`.trim()}>
          {p.badge ? <Reveal><span className="eyebrow">{p.badge}</span></Reveal> : null}
          {p.heading || p.highlight ? (
            <Reveal delay={0.08}>
              {headingIsRich ? (
                <Heading
                  tag={c.headingTag}
                  fallback="h2"
                  className={`mt-5 break-words font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl [&_*]:m-0 [&_strong]:grad-text ${headingTA ? ALIGN_TEXT[headingTA] : ""}`}
                  style={headingFontSize ? { fontSize: headingFontSize } : undefined}
                  html={sanitizeRichText(headingHtml)}
                />
              ) : (
                <Heading tag={c.headingTag} fallback="h2" className="mt-5 break-words font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl"><Head lead={p.heading} highlight={p.highlight} /></Heading>
              )}
            </Reveal>
          ) : null}
          {p.subtitle ? (
            <Reveal delay={0.16}>
              <div
                className="prose-jhb mt-6 text-lg leading-relaxed text-muted [&_a]:text-primary [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(subtitleHtml) }}
              />
            </Reveal>
          ) : null}
          {(btn(p.primary).label || btn(p.secondary).label) && (
            <Reveal delay={0.24}>
              <div className={`mt-8 flex flex-wrap gap-3 ${ALIGN_JUSTIFY[a]}`}>
                {btn(p.primary).label ? <Link href={btn(p.primary).href || "#"} className="btn btn-primary">{btn(p.primary).label}</Link> : null}
                {btn(p.secondary).label ? <Link href={btn(p.secondary).href || "#"} className="btn btn-ghost">{btn(p.secondary).label}</Link> : null}
              </div>
            </Reveal>
          )}
          {p.image ? (
            <Reveal delay={0.3}>
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.imageAlt || stripTags(p.heading) || ""} {...(p.imageTitle ? { title: p.imageTitle } : {})} className={imgA.className} style={imgA.style} loading={imgA.loading} {...(imgA.fetchPriority ? { fetchPriority: imgA.fetchPriority } : {})} />
                {(p.imageCaption || p.imageDescription) ? (
                  <figcaption className="mt-3 text-sm text-muted">
                    {p.imageCaption ? <span className="block font-medium text-ink/80">{p.imageCaption}</span> : null}
                    {p.imageDescription ? <span className="block">{p.imageDescription}</span> : null}
                  </figcaption>
                ) : null}
              </figure>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Features({ c }: { c: FeaturesContainer }) {
  const p = c.props;
  const a = toAlign(c.style.align);
  return (
    <section className={shell(c.style)}>
      <div className="container-x">
        {(p.heading || p.subtitle) && (
          <div className={`mb-10 max-w-2xl ${ALIGN_TEXT[a]} ${ALIGN_BLOCK[a]}`.trim()}>
            <Reveal><Heading tag={c.headingTag} fallback="h2" className="font-display text-3xl font-bold sm:text-4xl"><Head lead={p.heading} highlight={p.highlight} /></Heading></Reveal>
            {p.subtitle ? <Reveal delay={0.08}><p className="mt-6 leading-relaxed text-muted">{p.subtitle}</p></Reveal> : null}
          </div>
        )}
        <div className={`grid gap-5 ${COLS[p.columns] ?? COLS_FALLBACK}`}>
          {arr(p.items).map((it) => (
            <Reveal key={it.id}>
              <div className="glass glow-border h-full rounded-2xl p-6">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-ink/[0.04] text-2xl ring-1 ring-ink/10">{it.icon || "✦"}</span>
                <h3 className="mt-4 font-display text-lg font-semibold"><RichInline html={it.title} /></h3>
                {it.desc ? <p className="mt-2 text-sm leading-relaxed text-muted"><RichInline html={it.desc} /></p> : null}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ c }: { c: TestimonialsContainer }) {
  const p = c.props;
  const a = toAlign(c.style.align);
  return (
    <section className={shell(c.style)}>
      <div className="container-x">
        {p.heading ? (
          <Reveal><Heading tag={c.headingTag} fallback="h2" className={`mb-10 font-display text-3xl font-bold sm:text-4xl ${ALIGN_TEXT[a]}`}><Head lead={p.heading} highlight={p.highlight} /></Heading></Reveal>
        ) : null}
        <div className={`grid gap-5 ${p.columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          {arr(p.items).map((t) => (
            <Reveal key={t.id}>
              <figure className="glass h-full rounded-2xl p-6">
                <blockquote className="text-sm leading-relaxed text-ink/90">“{t.quote}”</blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  {t.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 text-sm font-bold">{(t.name || "?").charAt(0)}</span>
                  )}
                  <span>
                    <span className="block text-sm font-semibold">{t.name}</span>
                    {t.role ? <span className="block text-xs text-muted">{t.role}</span> : null}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq({ c }: { c: FaqContainer }) {
  const p = c.props;
  const a = toAlign(c.style.align);
  return (
    <section className={shell(c.style)}>
      <div className="container-x">
        {p.heading ? (
          <Reveal><Heading tag={c.headingTag} fallback="h2" className={`mb-10 font-display text-3xl font-bold sm:text-4xl ${ALIGN_TEXT[a]}`}><Head lead={p.heading} highlight={p.highlight} /></Heading></Reveal>
        ) : null}
        <div className={`max-w-3xl space-y-3 ${ALIGN_BLOCK[a] || "mr-auto"}`}>
          {arr(p.items).map((f, i) => (
            <Reveal key={f.id}>
              <details className="glass rounded-2xl">
                <summary className="block cursor-pointer break-words p-5 font-display font-semibold !text-[#1877F2]">
                  {p.showNumbers !== false && <span className="mr-2 tabular-nums">{String(i + 1).padStart(2, "0")}.</span>}
                  <RichInline html={f.q} />
                </summary>
                <p className="break-words px-5 pb-5 leading-relaxed text-muted"><RichInline html={f.a} /></p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery({ c }: { c: GalleryContainer }) {
  const p = c.props;
  const a = toAlign(c.style.align);
  return (
    <section className={shell(c.style)}>
      <div className="container-x">
        {p.heading ? <Reveal><Heading tag={c.headingTag} fallback="h2" className={`mb-10 font-display text-3xl font-bold sm:text-4xl ${ALIGN_TEXT[a]}`}>{p.heading}</Heading></Reveal> : null}
        <div className={`grid gap-4 ${COLS[p.columns] ?? COLS_FALLBACK}`}>
          {arr(p.images).map((img) => {
            const a = smartImgAttrs(img.imageSettings, { extraClass: "rounded-2xl border border-ink/10", fallbackWidth: "aspect-[4/3] w-full" });
            return (
              <Reveal key={img.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} loading={a.loading} className={a.className} style={a.style} {...(a.fetchPriority ? { fetchPriority: a.fetchPriority } : {})} />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ImageBanner({ c }: { c: ImageBannerContainer }) {
  const p = c.props;
  const a = toAlign(c.style.align);
  return (
    <section className={shell(c.style)}>
      <div className="container-x">
        {/* min-h on the wrapper guarantees the banner height with or without overlay
            content; the image fills absolutely so long overlay text GROWS the banner
            instead of being clipped at the fixed height. */}
        <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-ink/10 sm:min-h-[420px]">
          {p.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image} alt={p.heading} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-primary/20 to-secondary/20" />
          )}
          {(p.heading || p.subtitle || btn(p.button).label) && (
            <div className={`relative flex min-h-[320px] flex-col justify-center p-8 sm:min-h-[420px] ${ALIGN_ITEMS[a]} ${ALIGN_TEXT[a]} ${p.overlay ? "bg-ink/45 text-white" : ""}`}>
              {p.heading ? <Heading tag={c.headingTag} fallback="h2" className="font-display text-3xl font-bold sm:text-4xl">{p.heading}</Heading> : null}
              {p.subtitle ? <p className="mt-3 max-w-xl">{p.subtitle}</p> : null}
              {btn(p.button).label ? <Link href={btn(p.button).href || "#"} className="btn btn-primary mt-6">{btn(p.button).label}</Link> : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function RichTextBlock({ c }: { c: RichTextContainer }) {
  const a = toAlign(c.style.align);
  return (
    <section className={shell(c.style)}>
      <div className="container-x">
        <Reveal>
          <div
            className={`prose-jhb leading-relaxed ${ALIGN_TEXT[a]} ${c.props.width === "narrow" ? "max-w-2xl" : "max-w-4xl"} ${ALIGN_BLOCK[a] || "mr-auto"}`}
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(c.props.html) }}
          />
        </Reveal>
      </div>
    </section>
  );
}

function Cta({ c }: { c: CtaContainer }) {
  const p = c.props;
  const a = toAlign(c.style.align);
  return (
    <section className={shell(c.style)}>
      <div className="container-x">
        <div className={`glow-border relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-surface to-secondary/15 p-10 sm:p-16 ${ALIGN_TEXT[a]}`}>
          <Reveal><Heading tag={c.headingTag} fallback="h2" className="font-display text-3xl font-bold sm:text-4xl"><Head lead={p.heading} highlight={p.highlight} /></Heading></Reveal>
          {p.subtitle ? <Reveal delay={0.08}><p className={`mt-6 max-w-xl text-muted ${ALIGN_BLOCK[a] || "mr-auto"}`}>{p.subtitle}</p></Reveal> : null}
          {btn(p.button).label ? <Reveal delay={0.16}><Link href={btn(p.button).href || "#"} className="btn btn-primary mt-8">{btn(p.button).label}</Link></Reveal> : null}
        </div>
      </div>
    </section>
  );
}

function HeroDesc({ c }: { c: HeroDescContainer }) {
  const a = toAlign(c.style.align);
  return (
    <section className={shell(c.style)}>
      <div className={`container-x ${ALIGN_TEXT[a]}`}>
        <Reveal>
          <div
            className={`prose-jhb text-lg leading-relaxed text-muted [&_a]:text-primary [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 max-w-3xl ${ALIGN_BLOCK[a]}`.trim()}
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(c.props.html) }}
          />
        </Reveal>
      </div>
    </section>
  );
}

function Cards({ c }: { c: CardsContainer }) {
  const p = c.props;
  // Section heading alignment: the new headingAlignment field wins; older Card
  // Sections fall back to the existing style.align so they render identically.
  const ha = toAlign(p.headingAlignment ?? c.style.align);
  const da = toAlign(p.descriptionAlignment); // absent → "left"
  const descHtml = (p.description || "").trim();
  return (
    <section className={shell(c.style)}>
      <div className="container-x">
        {(p.heading || p.highlight) && (
          <Reveal>
            <Heading tag={c.headingTag} fallback="h2" className={`${descHtml ? "mb-5" : "mb-10"} font-display text-3xl font-bold sm:text-4xl ${ALIGN_TEXT[ha]}`}>
              <Head lead={p.heading} highlight={p.highlight} />
            </Heading>
          </Reveal>
        )}
        {descHtml ? (
          <Reveal delay={0.06}>
            <div
              className={`prose-jhb mb-10 max-w-3xl leading-relaxed text-muted [&_a]:text-primary [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_table]:w-full ${ALIGN_TEXT[da]} ${ALIGN_BLOCK[da] || "mr-auto"}`}
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(descHtml) }}
            />
          </Reveal>
        ) : null}
        <div className={`grid gap-5 ${COLS[p.columns] ?? COLS_FALLBACK}`}>
          {arr(p.items).map((card) => {
            const hasBgImage = !!card.bgImage;
            const style = hasBgImage
              ? { backgroundImage: `url(${card.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }
              : card.bg
                ? { backgroundColor: card.bg }
                : undefined;
            const custom = hasBgImage || !!card.bg;
            // When the card itself links somewhere, the whole card is clickable
            // via a stretched link (added below). The content then disables
            // pointer events so clicks fall through to it, while the optional
            // button re-enables them and stays a separate link — keeping the
            // markup valid (no anchor nested inside an anchor).
            const cardLinked = !!card.link;
            const inner = (
              <div className={`relative h-full overflow-hidden rounded-2xl border border-ink/10 ${custom ? "" : "glass glow-border"} ${cardLinked ? "pointer-events-none" : ""}`} style={style}>
                {hasBgImage && <div className="absolute inset-0 bg-ink/45" />}
                <div className={`relative p-6 ${hasBgImage ? "text-white" : ""}`}>
                  {card.image ? (
                    (() => {
                      const a = smartImgAttrs(card.imageSettings, { extraClass: "mb-4 rounded-xl", fallbackWidth: "h-14 w-14" });
                      // eslint-disable-next-line @next/next/no-img-element
                      return <img src={card.image} alt={stripTags(card.title)} className={a.className} style={a.style} loading={a.loading} {...(a.fetchPriority ? { fetchPriority: a.fetchPriority } : {})} />;
                    })()
                  ) : card.icon ? (
                    <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-ink/[0.06] text-2xl ring-1 ring-ink/10">{card.icon}</span>
                  ) : null}
                  {card.title ? (() => {
                    const s = sanitizeRichText(card.title);
                    const ta = richTextAlign(s);
                    return <Heading tag={subHeadingTag(c.headingTag)} className={`font-display text-lg font-semibold [&_p]:m-0 [&_a]:text-primary ${ta ? ALIGN_TEXT[ta] : ""}`} html={stripHeadingTags(s)} />;
                  })() : null}
                  {card.description ? <div className={`prose-jhb mt-2 text-sm leading-relaxed [&_a]:text-primary [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_table]:w-full ${hasBgImage ? "text-white/85" : "text-muted"}`} dangerouslySetInnerHTML={{ __html: sanitizeRichText(card.description) }} /> : null}
                  {btn(card.button).label ? (
                    <Link href={btn(card.button).href || "#"} className={`btn btn-primary mt-4 !px-4 !py-3 !text-xs ${cardLinked ? "pointer-events-auto relative z-10" : ""}`}>{btn(card.button).label}</Link>
                  ) : null}
                </div>
              </div>
            );
            return (
              <Reveal key={card.id}>
                {card.link ? (
                  <div className="relative h-full">
                    <Link href={card.link} aria-label={stripTags(card.title) || "Open"} className="absolute inset-0 z-0" />
                    {inner}
                  </div>
                ) : (
                  inner
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ServicesBlock({ c }: { c: ServicesContainer }) {
  const p = c.props;
  const a = toAlign(c.style.align);
  return (
    <section className={shell(c.style)}>
      <div className="container-x">
        {(p.heading || p.subtitle) && (
          <div className={`mb-10 max-w-2xl ${ALIGN_TEXT[a]} ${ALIGN_BLOCK[a]}`.trim()}>
            <Reveal><Heading tag={c.headingTag} fallback="h2" className="font-display text-3xl font-bold sm:text-4xl"><Head lead={p.heading} highlight={p.highlight} /></Heading></Reveal>
            {p.subtitle ? <Reveal delay={0.08}><p className="mt-6 leading-relaxed text-muted">{p.subtitle}</p></Reveal> : null}
          </div>
        )}
        <div className={`grid gap-5 ${COLS[p.columns] ?? COLS_FALLBACK}`}>
          {arr(p.items).map((it) => {
            const inner = (
              <div className="glass glow-border h-full rounded-2xl p-6">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-ink/[0.04] text-2xl ring-1 ring-ink/10">{it.icon || "✦"}</span>
                <h3 className="mt-4 font-display text-lg font-semibold"><RichInline html={it.title} /></h3>
                {it.desc ? <p className="mt-2 text-sm leading-relaxed text-muted"><RichInline html={it.desc} /></p> : null}
                {it.href ? <span className="mt-3 inline-block text-sm font-medium text-primary">Learn more →</span> : null}
              </div>
            );
            return <Reveal key={it.id}>{it.href ? <Link href={it.href} className="block h-full">{inner}</Link> : inner}</Reveal>;
          })}
        </div>
      </div>
    </section>
  );
}

function AboutBlock({ c }: { c: AboutContainer }) {
  const p = c.props;
  const a = toAlign(c.style.align);
  const imgA = smartImgAttrs(p.imageSettings, { extraClass: "rounded-3xl border border-ink/10 shadow-soft" });
  return (
    <section className={shell(c.style)}>
      <div className="container-x">
        <div className={`grid items-center gap-10 ${p.image ? "lg:grid-cols-2" : ""}`}>
          <Reveal>
            <div className={`${ALIGN_TEXT[a]} ${p.imagePosition === "left" && p.image ? "lg:order-2" : ""}`.trim()}>
              {p.eyebrow ? <span className="eyebrow">{p.eyebrow}</span> : null}
              <Heading tag={c.headingTag} fallback="h2" className="mt-5 font-display text-3xl font-bold sm:text-4xl"><Head lead={p.heading} highlight={p.highlight} /></Heading>
              <div className="prose-jhb mt-6 leading-relaxed text-muted [&_a]:text-primary [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5" dangerouslySetInnerHTML={{ __html: sanitizeRichText(p.bodyHtml) }} />
            </div>
          </Reveal>
          {p.image ? (
            <Reveal delay={0.1}>
              <div className={p.imagePosition === "left" ? "lg:order-1" : ""}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.heading} className={imgA.className} style={imgA.style} loading={imgA.loading} {...(imgA.fetchPriority ? { fetchPriority: imgA.fetchPriority } : {})} />
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// lg column templates keyed by content:image split. The image-on-left variant
// reverses the columns so the proportions stay tied to role (content vs image).
const SPLIT_COLS_RIGHT: Record<ImageContentContainer["props"]["widthSplit"], string> = {
  "50-50": "lg:grid-cols-2",
  "60-40": "lg:grid-cols-[3fr_2fr]",
  "40-60": "lg:grid-cols-[2fr_3fr]",
  "70-30": "lg:grid-cols-[7fr_3fr]",
  "30-70": "lg:grid-cols-[3fr_7fr]",
};
const SPLIT_COLS_LEFT: Record<ImageContentContainer["props"]["widthSplit"], string> = {
  "50-50": "lg:grid-cols-2",
  "60-40": "lg:grid-cols-[2fr_3fr]",
  "40-60": "lg:grid-cols-[3fr_2fr]",
  "70-30": "lg:grid-cols-[3fr_7fr]",
  "30-70": "lg:grid-cols-[7fr_3fr]",
};
const VALIGN: Record<ImageContentContainer["props"]["verticalAlign"], string> = {
  top: "lg:items-start",
  center: "lg:items-center",
  bottom: "lg:items-end",
};

function ImageContent({ c }: { c: ImageContentContainer }) {
  const p = c.props;
  const left = p.imagePosition === "left";
  const cols = (left ? SPLIT_COLS_LEFT[p.widthSplit] : SPLIT_COLS_RIGHT[p.widthSplit]) ?? "lg:grid-cols-2";
  // Background priority: image > solid colour > shared style.bg.
  // A custom background still opts into the global rhythm (.section-y) + shared
  // internal padding via `.sec-bg-custom` so its content never touches the edge.
  const hasCustomBg = !!p.bgImage || !!p.bgColor;
  const sectionClass = hasCustomBg ? "section-y sec-bg-custom" : shell(c.style);
  const sectionStyle = p.bgImage
    ? { backgroundImage: `url(${p.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }
    : p.bgColor
      ? { backgroundColor: p.bgColor }
      : undefined;

  // Order: content is first in the DOM (SEO-friendly); CSS `order` controls the
  // visual order per breakpoint — mobile uses mobileOrder, lg uses imagePosition.
  const contentOrder = `${p.mobileOrder === "content-first" ? "order-1" : "order-2"} ${left ? "lg:order-2" : "lg:order-1"}`;
  const imageOrder = `${p.mobileOrder === "image-first" ? "order-1" : "order-2"} ${left ? "lg:order-1" : "lg:order-2"}`;

  const a = toAlign(c.style.align);
  const content = (
    <div className={`min-w-0 ${ALIGN_TEXT[a]} ${contentOrder}`}>
      {p.badge ? <span className="eyebrow">{p.badge}</span> : null}
      {p.heading ? (() => {
        const s = sanitizeRichText(p.heading);
        const ta = richTextAlign(s);
        return <Heading tag={c.headingTag} fallback="h2" className={`mt-5 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl [&_*]:m-0 [&_strong]:grad-text ${ta ? ALIGN_TEXT[ta] : ""}`} html={stripHeadingTags(s)} />;
      })() : null}
      {p.description ? (
        <div className="prose-jhb mt-6 leading-relaxed text-muted [&_a]:text-primary [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5" dangerouslySetInnerHTML={{ __html: sanitizeRichText(p.description) }} />
      ) : null}
      {arr(p.bullets).length > 0 && (
        <ul className="mt-5 space-y-2.5">
          {arr(p.bullets).filter((b) => (b.text || "").trim()).map((b) => (
            <li key={b.id} className="flex items-start gap-2.5">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-[10px] font-bold text-white">✓</span>
              <span className="min-w-0 text-ink/90"><RichInline html={b.text} /></span>
            </li>
          ))}
        </ul>
      )}
      {(btn(p.primary).label || btn(p.secondary).label) && (
        <div className={`mt-8 flex flex-wrap gap-3 ${ALIGN_JUSTIFY[a]}`}>
          {btn(p.primary).label ? <Link href={btn(p.primary).href || "#"} className="btn btn-primary">{btn(p.primary).label}</Link> : null}
          {btn(p.secondary).label ? <Link href={btn(p.secondary).href || "#"} className="btn btn-ghost">{btn(p.secondary).label}</Link> : null}
        </div>
      )}
    </div>
  );

  const imgA = smartImgAttrs(p.imageSettings, { extraClass: "rounded-3xl border border-ink/10 shadow-soft" });
  const image = (
    <div className={`min-w-0 ${imageOrder}`}>
      {p.image ? (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.image}
            alt={p.imageAlt}
            {...(p.imageTitle ? { title: p.imageTitle } : {})}
            className={imgA.className}
            style={imgA.style}
            loading={imgA.loading}
            {...(imgA.fetchPriority ? { fetchPriority: imgA.fetchPriority } : {})}
          />
          {(p.imageCaption || p.imageDescription) && (
            <figcaption className="mt-3 text-sm text-muted">
              {p.imageCaption ? <span className="block font-medium text-ink/80">{p.imageCaption}</span> : null}
              {p.imageDescription ? <span className="block">{p.imageDescription}</span> : null}
            </figcaption>
          )}
        </figure>
      ) : (
        <div className="aspect-[4/3] w-full rounded-3xl border border-ink/10 bg-gradient-to-br from-primary/15 to-secondary/15" />
      )}
    </div>
  );

  return (
    <section className={sectionClass} style={sectionStyle}>
      <div className="container-x">
        <div className={`grid grid-cols-1 items-start gap-10 ${cols} ${VALIGN[p.verticalAlign] ?? "lg:items-center"}`}>
          {content}
          {image}
        </div>
      </div>
    </section>
  );
}

function ImageBlock({ c }: { c: ImageContainer }) {
  const p = c.props;
  if (!p.url) return null;
  const al = toAlign(c.style.align);
  const a = smartImgAttrs(p.imageSettings, { extraClass: `${p.rounded ? "rounded-3xl" : ""} border border-ink/10` });
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={p.url} alt={p.alt} className={a.className} style={a.style} loading={a.loading} {...(a.fetchPriority ? { fetchPriority: a.fetchPriority } : {})} />
  );
  return (
    <section className={shell(c.style)}>
      {p.width === "full" ? (
        <div className="px-0">{img}{p.caption ? <p className={`container-x mt-3 text-sm text-muted ${ALIGN_TEXT[al]}`}>{p.caption}</p> : null}</div>
      ) : (
        <div className="container-x"><Reveal>{img}{p.caption ? <p className={`mt-3 text-sm text-muted ${ALIGN_TEXT[al]}`}>{p.caption}</p> : null}</Reveal></div>
      )}
    </section>
  );
}

function toEmbed(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

function VideoBlock({ c }: { c: VideoContainer }) {
  const p = c.props;
  if (!p.url) return null;
  const al = toAlign(c.style.align);
  const embed = toEmbed(p.url);
  const ratio = p.aspect === "4:3" ? "aspect-[4/3]" : p.aspect === "1:1" ? "aspect-square" : "aspect-video";
  return (
    <section className={shell(c.style)}>
      <div className="container-x">
        <Reveal>
          <div className={`max-w-4xl overflow-hidden rounded-3xl border border-ink/10 ${ALIGN_BLOCK[al] || "mr-auto"} ${ratio}`}>
            {embed ? (
              <iframe src={embed} title={p.caption || "Video"} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={p.url} controls className="h-full w-full object-cover" />
            )}
          </div>
          {p.caption ? <p className={`mt-3 text-sm text-muted ${ALIGN_TEXT[al]}`}>{p.caption}</p> : null}
        </Reveal>
      </div>
    </section>
  );
}

function Team({ c }: { c: TeamContainer }) {
  const p = c.props;
  const a = toAlign(c.style.align);
  return (
    <section className={shell(c.style)}>
      <div className="container-x">
        {(p.heading || p.highlight) && (
          <Reveal><Heading tag={c.headingTag} fallback="h2" className={`mb-10 font-display text-3xl font-bold sm:text-4xl ${ALIGN_TEXT[a]}`}><Head lead={p.heading} highlight={p.highlight} /></Heading></Reveal>
        )}
        <div className={`grid gap-5 ${COLS[p.columns] ?? COLS_FALLBACK}`}>
          {arr(p.items).map((m) => (
            <Reveal key={m.id}>
              <div className="glass h-full rounded-2xl p-6 text-center">
                {m.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photo} alt={m.name} className="mx-auto h-24 w-24 rounded-full object-cover" />
                ) : (
                  <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 text-2xl font-bold">{(m.name || "?").charAt(0)}</span>
                )}
                <h3 className="mt-4 font-display text-lg font-semibold">{m.name}</h3>
                {m.role ? <p className="text-sm text-primary">{m.role}</p> : null}
                {m.bio ? <p className="mt-2 text-sm leading-relaxed text-muted">{m.bio}</p> : null}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactFormBlock({ c }: { c: ContactFormContainer }) {
  const p = c.props;
  const a = toAlign(c.style.align);
  return (
    <section className={shell(c.style)}>
      <div className={`container-x ${ALIGN_TEXT[a]}`}>
        {(p.heading || p.highlight) && (
          <Reveal><Heading tag={c.headingTag} fallback="h2" className="font-display text-3xl font-bold sm:text-4xl"><Head lead={p.heading} highlight={p.highlight} /></Heading></Reveal>
        )}
        {p.subtitle ? <Reveal delay={0.08}><p className={`mt-6 max-w-xl text-muted ${ALIGN_BLOCK[a] || "mr-auto"}`}>{p.subtitle}</p></Reveal> : null}
        <div className="mt-8">
          <ContainerContactForm buttonLabel={p.buttonLabel} />
        </div>
      </div>
    </section>
  );
}

function Advantage({ c }: { c: AdvantageContainer }) {
  const p = c.props;
  // Independent heading/description alignment; both fall back to the existing
  // style.align so older sections render identically.
  const ha = toAlign(p.headingAlignment ?? c.style.align);
  const da = toAlign(p.descriptionAlignment ?? c.style.align);
  const items = arr(p.items).filter((b) => b.title || b.image);
  return (
    <section className={shell(c.style)}>
      <div className="container-x">
        <div className="glass-strong glow-border relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-2">
            <Reveal>
              <div className={ALIGN_TEXT[ha]}>
                {p.badge ? <span className="eyebrow">{p.badge}</span> : null}
                <Heading tag={c.headingTag} fallback="h2" className="mt-5 font-display text-3xl font-bold sm:text-4xl"><Head lead={p.heading} highlight={p.highlight} /></Heading>
                {p.description ? (
                  <div
                    className={`prose-jhb mt-6 leading-relaxed text-muted [&_a]:text-primary [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_table]:w-full ${ALIGN_TEXT[da]}`}
                    dangerouslySetInnerHTML={{ __html: sanitizeRichText(p.description) }}
                  />
                ) : null}
              </div>
            </Reveal>
            <ul className="space-y-4">
              {items.map((b) => (
                <Reveal key={b.id}>
                  <li className={`flex gap-3 ${b.desc ? "items-start" : "items-center"}`}>
                    {b.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.image} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">{b.icon || "✓"}</span>
                    )}
                    <span className="min-w-0 break-words">
                      <span className="block text-ink/90"><RichInline html={b.title} /></span>
                      {b.desc ? <span className="mt-0.5 block text-sm text-muted"><RichInline html={b.desc} /></span> : null}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// Width wrapper for the Workflow section — controls how wide the timeline runs.
function WorkflowWrap({ width, children }: { width: WorkflowWidth; children: ReactNode }) {
  if (width === "full") return <div className="w-full px-6 md:px-10">{children}</div>;
  if (width === "wide") return <div className="mx-auto w-full max-w-[92rem] px-6 md:px-10">{children}</div>;
  if (width === "narrow") return <div className="container-x"><div className="mx-auto max-w-3xl">{children}</div></div>;
  return <div className="container-x">{children}</div>;
}

// A single process step. Fully themeable: per-step background / border / text
// colour, optional image (overrides the icon), icon, or an auto step-number.
function WorkflowStepBox({ s, index, className = "" }: { s: WorkflowStep; index: number; className?: string }) {
  const custom = !!s.bg || !!s.border;
  return (
    <div
      className={`relative h-full rounded-2xl p-5 text-center ${custom ? "border" : "glass glow-border"} ${className}`}
      style={{
        backgroundColor: s.bg || undefined,
        borderColor: custom ? s.border || "transparent" : undefined,
        color: s.text || undefined,
      }}
    >
      {s.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.image} alt={s.title} className="mx-auto mb-3 h-14 w-14 rounded-xl object-cover" />
      ) : (
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-2xl ring-1 ring-ink/10">
          {s.icon ? <span>{s.icon}</span> : <span className="font-display text-base font-bold">{index + 1}</span>}
        </div>
      )}
      {s.title ? <h3 className="font-display text-base font-semibold leading-tight"><RichInline html={s.title} /></h3> : null}
      {s.desc ? <p className={`mt-1.5 text-sm leading-relaxed ${s.text ? "opacity-80" : "text-muted"}`}><RichInline html={s.desc} /></p> : null}
    </div>
  );
}

// The connector arrow between steps. Points right on desktop / down on mobile for
// the horizontal layout; always points down for vertical / zig-zag.
function WorkflowArrow({ color, vertical }: { color: string; vertical?: boolean }) {
  return (
    <div className="flex items-center justify-center" aria-hidden>
      <span
        className={`text-2xl font-bold leading-none ${vertical ? "rotate-90" : "rotate-90 sm:rotate-0"} ${color ? "" : "text-primary/50"}`}
        style={color ? { color } : undefined}
      >
        →
      </span>
    </div>
  );
}

function WorkflowSteps({ steps, layout }: { steps: WorkflowStep[]; layout: WorkflowContainer["props"]["layout"] }) {
  if (steps.length === 0) return null;

  if (layout === "vertical") {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-3">
        {steps.map((s, i) => (
          <Fragment key={s.id}>
            <WorkflowStepBox s={s} index={i} />
            {i < steps.length - 1 ? <WorkflowArrow color={s.arrow} vertical /> : null}
          </Fragment>
        ))}
      </div>
    );
  }

  if (layout === "zigzag") {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {steps.map((s, i) => (
          <Fragment key={s.id}>
            <div className={`w-full sm:w-[62%] ${i % 2 === 1 ? "sm:self-end" : "sm:self-start"}`}>
              <WorkflowStepBox s={s} index={i} />
            </div>
            {i < steps.length - 1 ? <WorkflowArrow color={s.arrow} vertical /> : null}
          </Fragment>
        ))}
      </div>
    );
  }

  // horizontal (default): a row with arrows on desktop, wraps to multiple rows on
  // tablet, and stacks into a vertical timeline on mobile.
  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-center sm:gap-2">
      {steps.map((s, i) => (
        <Fragment key={s.id}>
          <WorkflowStepBox s={s} index={i} className="sm:min-w-[10.5rem] sm:max-w-[14rem] sm:flex-1" />
          {i < steps.length - 1 ? <WorkflowArrow color={s.arrow} /> : null}
        </Fragment>
      ))}
    </div>
  );
}

function Workflow({ c }: { c: WorkflowContainer }) {
  const p = c.props;
  const steps = arr(p.steps).filter((s) => s.enabled);
  const hasHeading = !!(p.heading || p.highlight || p.headingTail);
  const a = toAlign(c.style.align);
  return (
    <section className={shell(c.style)}>
      <WorkflowWrap width={p.width}>
        {(p.eyebrow || hasHeading || p.subtitle) && (
          <div className={`mb-10 max-w-2xl ${ALIGN_TEXT[a]} ${ALIGN_BLOCK[a]}`.trim()}>
            {p.eyebrow ? <Reveal><span className="eyebrow">{p.eyebrow}</span></Reveal> : null}
            {hasHeading ? (
              <Reveal delay={0.06}>
                <Heading tag={c.headingTag} fallback="h2" className="mt-5 font-display text-3xl font-bold sm:text-4xl">
                  {p.heading}
                  {p.highlight ? <>{" "}<span className="grad-text">{p.highlight}</span></> : null}
                  {p.headingTail ? <>{" "}{p.headingTail}</> : null}
                </Heading>
              </Reveal>
            ) : null}
            {p.subtitle ? (
              <Reveal delay={0.12}>
                <div className="prose-jhb mt-6 leading-relaxed text-muted [&_a]:text-primary [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: sanitizeRichText(p.subtitle) }} />
              </Reveal>
            ) : null}
          </div>
        )}
        <Reveal><WorkflowSteps steps={steps} layout={p.layout} /></Reveal>
      </WorkflowWrap>
    </section>
  );
}

function CustomBlock({ c }: { c: CustomContainer }) {
  const a = toAlign(c.style.align);
  return (
    <section className={shell(c.style)}>
      <div className={`container-x overflow-x-auto [&_img]:h-auto [&_img]:max-w-full ${ALIGN_TEXT[a]}`} dangerouslySetInnerHTML={{ __html: sanitizeRichText(c.props.html) }} />
    </section>
  );
}

// Memoised so an unchanged container is skipped when the editor re-renders on
// every keystroke — only the container whose object identity changed (immutable
// edits always produce a new object) actually re-renders. Inert on the server.
const RenderContainer = memo(function RenderContainer({ c }: { c: PageContainer }) {
  // Universal visibility: a hidden container renders nothing on the admin preview
  // AND the live site (its data stays saved). Absent → shown (backward compatible).
  if (c.hidden) return null;
  switch (c.type) {
    case "hero": return <Hero c={c} />;
    case "herodesc": return <HeroDesc c={c} />;
    case "features": return <Features c={c} />;
    case "services": return <ServicesBlock c={c} />;
    case "about": return <AboutBlock c={c} />;
    case "cards": return <Cards c={c} />;
    case "imagecontent": return <ImageContent c={c} />;
    case "richtext": return <RichTextBlock c={c} />;
    case "image": return <ImageBlock c={c} />;
    case "imagebanner": return <ImageBanner c={c} />;
    case "gallery": return <Gallery c={c} />;
    case "video": return <VideoBlock c={c} />;
    case "testimonials": return <Testimonials c={c} />;
    case "faq": return <Faq c={c} />;
    case "cta": return <Cta c={c} />;
    case "team": return <Team c={c} />;
    case "contactform": return <ContactFormBlock c={c} />;
    case "advantage": return <Advantage c={c} />;
    case "workflow": return <Workflow c={c} />;
    case "custom": return <CustomBlock c={c} />;
    default: return null;
  }
});

/** Renders every container in `zone`, in order. Empty zone → nothing. */
export function PageContainersView({ containers, zone }: { containers: PageContainer[]; zone: string }) {
  // Fold any legacy Hero + Hero-Description pair into one Hero Section before
  // rendering, then keep only this zone's containers (guarding a missing/legacy
  // `id` so a duplicate/absent key can never collapse two containers into one).
  const inZone = mergeHeroContainers(arr(containers)).filter((c) => c && c.zone === zone);
  if (inZone.length === 0) return null;
  return (
    <>
      {inZone.map((c, i) => (
        // Isolate EACH container: a throw inside one (bad data, broken embed,
        // unexpected null) renders a small inline notice instead of blanking the
        // whole page. resetKeys=[c] auto-clears the error once the container object
        // changes (i.e. the offending edit is fixed/undone) — no refresh needed.
        <ErrorBoundary key={c.id ?? `${zone}-${i}`} label={CONTAINER_LABELS[c.type] ?? "section"} resetKeys={[c]}>
          <RenderContainer c={c} />
        </ErrorBoundary>
      ))}
    </>
  );
}
