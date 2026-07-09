"use client";

import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ServiceDetail as ServiceDetailType } from "@jhb/shared/data";
import type {
  ServiceChrome,
  ServiceCta,
  ServiceFeature,
  WhatsIncludedContent,
  WhyChooseContainer,
} from "@jhb/shared/service-pages";
import type { FaqItem } from "@jhb/shared/faqs";
import { buildRel, type AnchorLink } from "@jhb/shared/service-links";
import { smartImgAttrs, stripHeadingTags, type ContainerBg, type PageContainer } from "@jhb/shared/containers";
import { sanitizeRichText } from "@jhb/shared/rich-text";
import Icon from "./Icon";
import Reveal from "./Reveal";
import FaqAccordion from "./FaqAccordion";
import PageContainers from "./PageContainers";
import { RelatedServicesView } from "@jhb/shared/related-services-view";
import { Heading } from "@jhb/shared/heading";

// Map a heading tag to the matching framer-motion element so the hero can honor
// the admin-selected tag (H1–H6 / P) while keeping its entrance animation. The
// hero defaults to H1 — the page's single main heading.
const MOTION_HEADINGS = {
  h1: motion.h1, h2: motion.h2, h3: motion.h3, h4: motion.h4, h5: motion.h5, h6: motion.h6, p: motion.p,
} as const;

type RelatedLink = { title: string; slug: string; icon: string };

// "What's Included" styling maps — mirror the page-builder container styles so
// the section matches the rest of the site when its background/spacing changes.
const WI_PAD = { none: "py-0", sm: "py-4 sm:py-6", md: "py-6 sm:py-8 lg:py-10", lg: "py-8 sm:py-10 lg:py-12" } as const;
const WI_COLS = { 1: "", 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3" } as const;
function wiBgClass(bg: ContainerBg): string {
  return bg === "subtle"
    ? "bg-base"
    : bg === "gradient"
      ? "bg-gradient-to-br from-primary/10 via-surface to-secondary/10"
      : bg === "dark"
        ? "bg-ink text-white"
        : "";
}
// New tab / safe rel only for absolute URLs; internal paths open in place.
const extAttrs = (href: string) =>
  /^https?:\/\//i.test(href) ? { target: "_blank" as const, rel: "noopener noreferrer" } : {};

// Auto-link the first occurrence of each anchor phrase within a block of text.
// `used` is shared across the page so each anchor links at most once.
function linkify(text: string, links: AnchorLink[], used: Set<string>): ReactNode {
  if (!links.length || !text) return text;
  let nodes: ReactNode[] = [text];
  const ordered = [...links].sort(
    (a, b) => b.anchor_text.length - a.anchor_text.length
  );
  for (const link of ordered) {
    const anchor = link.anchor_text.trim();
    if (!anchor || used.has(anchor.toLowerCase())) continue;
    nodes = nodes.flatMap((node): ReactNode[] => {
      if (typeof node !== "string") return [node];
      const idx = node.toLowerCase().indexOf(anchor.toLowerCase());
      if (idx === -1) return [node];
      used.add(anchor.toLowerCase());
      const before = node.slice(0, idx);
      const match = node.slice(idx, idx + anchor.length);
      const after = node.slice(idx + anchor.length);
      const isExternal = /^https?:\/\//i.test(link.url);
      const newTab = link.new_tab || isExternal;
      const rel = buildRel(link);
      return [
        before,
        <Link
          key={`${anchor}-${idx}`}
          href={link.url}
          {...(newTab ? { target: "_blank" } : {})}
          {...(rel ? { rel } : {})}
          className="font-medium text-primary transition-opacity hover:opacity-80"
        >
          {match}
        </Link>,
        after,
      ];
    });
  }
  return nodes.map((n, i) => <Fragment key={i}>{n}</Fragment>);
}

type DbContent = {
  heroHeading: string;
  heroHighlight?: string;
  heroTail?: string;
  heroDescriptionHtml: string;
  heroLink?: string;
  features: ServiceFeature[];
  whatsIncluded?: WhatsIncludedContent | null;
  whyChoose?: WhyChooseContainer[];
  cta?: ServiceCta | null;
  chrome?: ServiceChrome | null;
  containers?: PageContainer[];
  image: string | null;
  imageAlt: string | null;
  imageTitle: string | null;
} | null;

export default function ServiceDetail({
  data,
  related = [],
  relatedUrlByKey = {},
  faqs = [],
  links = [],
  db = null,
  faqShowNumbers = true,
}: {
  data: ServiceDetailType;
  related?: RelatedLink[];
  relatedUrlByKey?: Record<string, string>;
  faqs?: FaqItem[];
  links?: AnchorLink[];
  db?: DbContent;
  faqShowNumbers?: boolean;
}) {
  const used = new Set<string>();
  // Published editor content overrides code defaults, field by field.
  // Split hero heading: lead (plain) + highlight (brand gradient) + optional tail.
  // `heroHeading` is the lead — legacy single-field pages keep their value here.
  const heroLead = db?.heroHeading || "";
  const heroHighlight = db?.heroHighlight || "";
  const heroTail = db?.heroTail || "";
  // Plain-text full heading (breadcrumb, image alt, "What's Included" copy).
  const heading =
    [heroLead, heroHighlight, heroTail].map((s) => s.trim()).filter(Boolean).join(" ") ||
    data.title;
  // When a highlight is set, render the split (lead + gradient + tail). Otherwise
  // keep the whole heading in the gradient, exactly as before (legacy/unsplit).
  const heroHeadingNode = heroHighlight ? (
    <>
      {heroLead && <span>{heroLead} </span>}
      <span className="grad-text">{heroHighlight}</span>
      {heroTail && <span> {heroTail}</span>}
    </>
  ) : (
    <span className="grad-text">{heroLead || data.title}</span>
  );
  // Semantic element for the hero heading — admin-selectable (SEO), defaults to H1.
  const HeroHeading = MOTION_HEADINGS[db?.chrome?.heroHeadingTag ?? "h1"];

  // Hero CTA button chrome — CMS values fall back to the original hardcoded defaults.
  const heroPrimaryText = db?.chrome?.heroPrimaryText || "Contact Us";
  const heroPrimaryHref = db?.chrome?.heroPrimaryHref || "/#contact";
  const heroSecondaryText = db?.chrome?.heroSecondaryText || "All Services";
  const heroSecondaryHref = db?.chrome?.heroSecondaryHref || "/services";

  // Related services section heading.
  const relatedHeadingLead = db?.chrome?.relatedHeadingLead || "Explore Related";
  const relatedHeadingHighlight = db?.chrome?.relatedHeadingHighlight || "Services";

  // Bottom CTA section — admin CTA fields when set, else the original hardcoded copy.
  const ctaHeading = db?.cta?.heading || `Ready to get started with ${data.title}?`;
  const ctaText = db?.cta?.text || "Get in touch and we’ll show you exactly how this can drive growth for your business.";
  const ctaButtonLabel = db?.cta?.button_label || "Contact Us";
  const ctaButtonHref = db?.cta?.button_href || "/#contact";
  const features: ServiceFeature[] =
    db?.features && db.features.length > 0 ? db.features : data.features;
  // "What's Included" section chrome (badge/heading/description/styling). When
  // no saved content exists (older rows / unpublished pages) fall back to the
  // original hardcoded defaults so the section looks identical.
  const wi = db?.whatsIncluded ?? null;
  const wiEnabled = wi ? wi.enabled : true;
  const wiBadge = wi ? wi.badge : "";
  const wiHeading = wi ? wi.heading : "What's";
  const wiHighlight = wi ? wi.highlight : "Included";
  const wiDescription = wi
    ? wi.description
    : `Everything you get when you partner with us on ${heading}.`;
  const wiColumns = wi ? wi.columns : 2;
  const wiButton = wi ? wi.button : { label: "", href: "" };
  const wiBg: ContainerBg = wi ? wi.bg : "none";
  const wiPad = wi ? wi.padding : "md";
  const wiAlignCenter = wi ? wi.align === "center" : false;
  const wiAlignRight = wi ? wi.align === "right" : false;
  // Enabled "Why Choose Us" containers (admin-managed). Falls back to the
  // original static section below when none are configured.
  const whyChoose = (db?.whyChoose ?? []).filter((c) => c.enabled);
  // Hero alignment (chrome.heroHeadingAlign) controls the WHOLE hero content group
  // — eyebrow, heading, description AND buttons — so a "center" selection centres
  // everything together (not just the heading). "left"/unset keeps the original
  // design. The admin preview (ServicePageEditor) mirrors this exact logic.
  const heroAlign = db?.chrome?.heroHeadingAlign ?? "left";
  const heroHeadingAlignClass =
    heroAlign === "center" ? "text-center" : heroAlign === "right" ? "text-right" : "";
  // Centre/right the constrained-width blocks (heading + description) as a whole,
  // since text-align alone can't move a block that has its own max-width.
  const heroBlockAlignClass =
    heroAlign === "center" ? "mx-auto" : heroAlign === "right" ? "ml-auto" : "";
  // Button row justification follows the same alignment.
  const heroBtnAlignClass =
    heroAlign === "center" ? "justify-center" : heroAlign === "right" ? "justify-end" : "";
  // Hero image layout (chrome.heroImage) — absent/tile renders the legacy icon
  // tile unchanged; "image" renders the uploaded image with the universal size
  // panel applied; "hidden" removes the column so content spans full width.
  const heroImg = db?.chrome?.heroImage ?? {};
  const heroImgMode = heroImg.mode || "tile";
  const showHeroVisual = heroImgMode !== "hidden";
  const heroImgLeft = heroImgMode === "image" && heroImg.align === "left";
  const heroImgA = smartImgAttrs(heroImg.settings, {
    extraClass: "mx-auto rounded-3xl border border-ink/10 shadow-soft",
  });
  return (
    <main className="relative pt-24">
      {/* ambient glows */}
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint [background-size:60px_60px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      <PageContainers containers={db?.containers ?? []} zone="top" />

      {/* Hero — carries its own bottom padding when the What's Included section
          below is disabled (or padding-less) and so contributes no top gap. */}
      <section className={`container-x ${!wiEnabled || wiPad === "none" ? "pb-12" : ""}`}>
        {/* breadcrumb */}
        <nav className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <Link href="/#home" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span>/</span>
          <Link href="/services" className="transition-colors hover:text-ink">
            Services
          </Link>
          <span>/</span>
          <span className="min-w-0 break-words text-primary">{heading}</span>
        </nav>

        <div
          className={`grid items-center gap-10 ${
            showHeroVisual ? (heroImgLeft ? "lg:grid-cols-[0.9fr_1.1fr]" : "lg:grid-cols-[1.1fr_0.9fr]") : ""
          }`}
        >
          <div className={`min-w-0 ${heroHeadingAlignClass} ${!showHeroVisual && heroAlign === "center" ? "mx-auto max-w-3xl" : ""} ${heroImgLeft ? "lg:order-2" : ""}`}>
            <div className={heroHeadingAlignClass}>
              <motion.span
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="eyebrow"
              >
                {data.tagline}
              </motion.span>
            </div>
            <HeroHeading
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`mt-6 break-words font-display text-[2rem] font-bold leading-[1.12] tracking-tight sm:text-5xl sm:leading-[1.08] ${heroHeadingAlignClass}`}
            >
              {db?.heroLink ? (
                <a
                  href={db.heroLink}
                  {...(/^https?:\/\//i.test(db.heroLink)
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="transition-opacity hover:opacity-80"
                >
                  {heroHeadingNode}
                </a>
              ) : (
                heroHeadingNode
              )}
            </HeroHeading>
            {db?.heroDescriptionHtml ? (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`prose-jhb mt-6 max-w-xl ${heroBlockAlignClass} ${heroHeadingAlignClass} text-lg leading-relaxed text-muted [&_a]:font-medium [&_a]:text-primary [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5`}
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(db.heroDescriptionHtml) }}
              />
            ) : (
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`mt-6 max-w-xl ${heroBlockAlignClass} ${heroHeadingAlignClass} text-lg leading-relaxed text-muted`}
              >
                {linkify(data.intro, links, used)}
              </motion.p>
            )}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`mt-8 flex flex-wrap gap-4 ${heroBtnAlignClass}`}
            >
              <Link href={heroPrimaryHref} className="btn btn-primary">
                {heroPrimaryText} →
              </Link>
              <Link href={heroSecondaryHref} className="btn btn-ghost">
                {heroSecondaryText}
              </Link>
            </motion.div>
          </div>

          {/* hero visual — custom image (chrome.heroImage), or the legacy icon tile */}
          {showHeroVisual && heroImgMode === "image" && db?.image ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className={`min-w-0 order-first ${heroImgLeft ? "lg:order-1" : "lg:order-none"}`}
            >
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={db.image}
                  alt={db.imageAlt || heading}
                  {...(db.imageTitle ? { title: db.imageTitle } : {})}
                  className={heroImgA.className}
                  style={heroImgA.style}
                  loading={heroImg.settings?.loading ?? "eager"}
                  {...(heroImgA.fetchPriority ? { fetchPriority: heroImgA.fetchPriority } : {})}
                />
                {(heroImg.caption || heroImg.description) && (
                  <figcaption className="mt-3 text-center text-sm text-muted">
                    {heroImg.caption ? <span className="block font-medium text-ink/80">{heroImg.caption}</span> : null}
                    {heroImg.description ? <span className="block">{heroImg.description}</span> : null}
                  </figcaption>
                )}
              </figure>
            </motion.div>
          ) : null}
          {showHeroVisual && !(heroImgMode === "image" && db?.image) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mx-auto grid aspect-square w-full max-w-sm place-items-center"
          >
            <div className="absolute inset-8 animate-spin-slow rounded-full border border-dashed border-ink/10" />
            <div className="absolute inset-16 rounded-full border border-ink/[0.06]" />
            <div className="glass-strong glow-border relative grid h-40 w-40 place-items-center overflow-hidden rounded-[2rem] shadow-glow">
              <span className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/10 to-secondary/10" />
              {db?.image ? (
                <Image
                  src={db.image}
                  alt={db.imageAlt || heading}
                  {...(db.imageTitle ? { title: db.imageTitle } : {})}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              ) : (
                <Icon name={data.icon} className="relative h-20 w-20 text-accent" />
              )}
            </div>
            {data.stats.map((s, i) => (
              <div
                key={s.label}
                className={`glass absolute rounded-2xl p-3 text-center shadow-glow ${
                  ["left-0 top-6", "right-0 top-1/3", "bottom-6 left-8"][i]
                } ${i === 1 ? "animate-float" : "animate-float-slow"}`}
              >
                <p className="font-display text-lg font-bold grad-text">
                  {s.value}
                </p>
                <p className="text-[10px] text-muted">{s.label}</p>
              </div>
            ))}
          </motion.div>
          )}
        </div>
      </section>

      <PageContainers containers={db?.containers ?? []} zone="after-hero" />

      {/* What's Included — fully editable section chrome + cards */}
      {wiEnabled && (
        <section className={`${wiBgClass(wiBg)} ${WI_PAD[wiPad]}`.trim()}>
          <div className="container-x">
            <Reveal>
              <div className={wiAlignCenter ? "text-center" : wiAlignRight ? "text-right" : ""}>
                {wiBadge && <span className="eyebrow">{wiBadge}</span>}
                <Heading
                  tag={wi?.headingTag}
                  fallback="h2"
                  className={`font-display text-3xl font-bold sm:text-4xl ${wiBadge ? "mt-5" : ""}`}
                >
                  {wiHeading}
                  {wiHighlight ? (
                    <>
                      {" "}
                      <span className="grad-text">{wiHighlight}</span>
                    </>
                  ) : null}
                </Heading>
                {wiDescription && (
                  // Rich HTML (admin RichEditor) — like the feature cards. Plain-text
                  // values from older pages render unchanged. Manual word-links replace
                  // the previous auto-linkify here.
                  <div
                    className={`prose-jhb mt-3 max-w-xl text-muted [&_p]:m-0 [&_a]:text-primary [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 ${wiAlignCenter ? "mx-auto" : ""}`}
                    dangerouslySetInnerHTML={{ __html: sanitizeRichText(wiDescription) }}
                  />
                )}
              </div>
            </Reveal>
            <div className={`mt-10 grid gap-5 ${WI_COLS[wiColumns]}`.trim()}>
              {features.map((f, i) => (
                <motion.div
                  key={f.id ?? i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
                  className="glass glow-border group relative rounded-2xl p-6"
                >
                  {/* When the card has a link, a stretched link makes the whole
                      card clickable. It sits beneath the content (a sibling, not
                      an ancestor, of the inline links) so the HTML stays valid;
                      the content disables pointer events and word-links re-enable
                      them so they remain individually clickable. */}
                  {f.link && (
                    <Link
                      href={f.link}
                      {...extAttrs(f.link)}
                      aria-label={f.linkText || "Learn more"}
                      className="absolute inset-0 z-0"
                    />
                  )}
                  <div className={`flex items-start gap-4 ${f.link ? "pointer-events-none" : ""}`}>
                    {f.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={f.image}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-xl object-cover ring-1 ring-ink/10"
                      />
                    ) : (
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 font-display text-sm font-bold text-primary ring-1 ring-ink/10">
                        {f.icon ? (
                          <span className="text-xl leading-none">{f.icon}</span>
                        ) : (
                          `0${i + 1}`
                        )}
                      </span>
                    )}
                    <div className="min-w-0">
                      <div
                        role="heading"
                        aria-level={3}
                        className="break-words font-display text-lg font-semibold [&_p]:m-0 [&_a]:pointer-events-auto [&_a]:relative [&_a]:z-20 [&_a]:break-words [&_a]:text-primary [&_a]:transition-colors"
                        dangerouslySetInnerHTML={{ __html: stripHeadingTags(sanitizeRichText(f.title)) }}
                      />
                      <div
                        className="mt-1.5 break-words text-sm leading-relaxed text-muted [&_p]:m-0 [&_a]:pointer-events-auto [&_a]:relative [&_a]:z-20 [&_a]:break-words [&_a]:text-primary [&_ul]:mt-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5"
                        dangerouslySetInnerHTML={{ __html: sanitizeRichText(f.desc) }}
                      />
                      {f.link && (
                        <Link
                          href={f.link}
                          {...extAttrs(f.link)}
                          tabIndex={-1}
                          className="pointer-events-auto relative z-20 mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary transition-opacity hover:opacity-80"
                        >
                          {f.linkText || "Learn more"} →
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {wiButton.label && wiButton.href && (
              <div
                className={`mt-10 ${wiAlignCenter ? "text-center" : wiAlignRight ? "text-right" : ""}`}
              >
                <Link href={wiButton.href} {...extAttrs(wiButton.href)} className="btn btn-primary">
                  {wiButton.label}
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      <PageContainers containers={db?.containers ?? []} zone="after-features" />

      {/* Benefits — admin-managed "Why Choose Us" containers, else the static one */}
      {whyChoose.length > 0
        ? whyChoose.map((c) => (
            <section key={c.id} className="container-x pb-12">
              <div className="glass-strong glow-border relative overflow-hidden rounded-3xl p-8 sm:p-12">
                <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
                <div className="relative grid gap-8 lg:grid-cols-2">
                  <div>
                    {c.badge && <span className="eyebrow">{c.badge}</span>}
                    <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
                      {c.heading} <span className="grad-text">{c.highlight}</span>
                    </h2>
                    {c.description && (
                      <p className="mt-4 break-words text-muted">{linkify(c.description, links, used)}</p>
                    )}
                  </div>
                  <ul className="space-y-4">
                    {c.benefits
                      .filter((b) => b.enabled && (b.title || b.image))
                      .map((b, i) => (
                        <motion.li
                          key={b.id}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.45, delay: i * 0.08 }}
                          className={`flex gap-3 ${b.desc ? "items-start" : "items-center"}`}
                        >
                          {b.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={b.image} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" />
                          ) : b.icon ? (
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-white">
                              <Icon name={b.icon} className="h-4 w-4" />
                            </span>
                          ) : (
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
                              ✓
                            </span>
                          )}
                          <span className="min-w-0 break-words">
                            <span className="block text-ink/90">{linkify(b.title, links, used)}</span>
                            {b.desc && <span className="mt-0.5 block text-sm text-muted">{b.desc}</span>}
                          </span>
                        </motion.li>
                      ))}
                  </ul>
                </div>
              </div>
            </section>
          ))
        : (
          <section className="container-x pb-12">
            <div className="glass-strong glow-border relative overflow-hidden rounded-3xl p-8 sm:p-12">
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
              <div className="relative grid gap-8 lg:grid-cols-2">
                <div>
                  <span className="eyebrow">Why Choose Us</span>
                  <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
                    The JHB <span className="grad-text">Advantage</span>
                  </h2>
                  <p className="mt-4 break-words text-muted">
                    We don&apos;t just deliver {data.title.toLowerCase()} — we
                    deliver measurable business growth, with full transparency at
                    every step.
                  </p>
                </div>
                <ul className="space-y-4">
                  {data.benefits.map((b, i) => (
                    <motion.li
                      key={b}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: i * 0.08 }}
                      className="flex items-center gap-3"
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
                        ✓
                      </span>
                      <span className="min-w-0 break-words text-ink/90">
                        {linkify(b, links, used)}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

      <PageContainers containers={db?.containers ?? []} zone="after-whychoose" />

      {/* Related services — fully editable section (admin-managed). Once a page is
          migrated/published the editable section wins (and respects its own
          enable/disable + per-card toggles, hiding itself when empty). Pages not
          yet migrated keep the original auto-generated cards. */}
      {db?.chrome?.related ? (
        <RelatedServicesView content={db.chrome.related} serviceUrlByKey={relatedUrlByKey} Reveal={Reveal} />
      ) : (
        <section className="container-x pb-12">
          <Reveal>
            <h2 className="mb-8 font-display text-2xl font-bold sm:text-3xl">
              {relatedHeadingLead}{relatedHeadingLead && relatedHeadingHighlight ? " " : ""}
              {relatedHeadingHighlight && <span className="grad-text">{relatedHeadingHighlight}</span>}
            </h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((s) => (
              <Link
                key={s.slug}
                href={`/${s.slug}`}
                className="group glass glow-border flex items-center gap-3 rounded-2xl p-4 transition-transform hover:-translate-y-1"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary ring-1 ring-ink/10 transition-all group-hover:from-primary group-hover:to-secondary group-hover:text-white">
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0 break-words text-sm font-medium text-muted transition-colors group-hover:text-ink">
                  {s.title}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ — near the bottom, just above the CTA */}
      {faqs.length > 0 && (
        <div className="pb-12">
          <FaqAccordion items={faqs} showNumbers={faqShowNumbers} />
        </div>
      )}

      <PageContainers containers={db?.containers ?? []} zone="after-faq" />

      {/* CTA */}
      <section className="container-x pb-20">
        <div className="glow-border relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-surface to-secondary/15 p-10 text-center sm:p-16">
          <Heading tag={db?.cta?.headingTag} fallback="h2" className="break-words font-display text-3xl font-bold sm:text-4xl">
            <span className="grad-text">{ctaHeading}</span>
          </Heading>
          <p className="mx-auto mt-4 max-w-xl text-muted">{ctaText}</p>
          <Link href={ctaButtonHref} className="btn btn-primary mt-8">
            {ctaButtonLabel} →
          </Link>
        </div>
      </section>

      <PageContainers containers={db?.containers ?? []} zone="bottom" />
    </main>
  );
}
