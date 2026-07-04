"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HOME_FAQ_DEFAULTS, type HomeFaqItem } from "@jhb/shared/home-faqs";
import { faqPlainText } from "@jhb/shared/faqs";
import { smartImgAttrs, type ImageSettings } from "@jhb/shared/containers";
import Reveal from "./Reveal";
import SmartLink from "./SmartLink";

const FAQ_ANSWER_CLASS =
  "px-5 pb-5 text-sm leading-relaxed text-muted [&_a]:text-primary [&_a]:underline [&_p]:m-0 [&_p+p]:mt-2 [&_strong]:font-semibold [&_s]:line-through [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1 [&_h1]:font-display [&_h1]:text-lg [&_h1]:font-bold [&_h2]:font-display [&_h2]:text-base [&_h2]:font-bold [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_hr]:my-3 [&_hr]:border-ink/15";

export default function Faq({
  items,
  eyebrow = "FAQ",
  headingLead = "Frequently Asked",
  headingHighlight = "Questions",
  description = "Everything you need to know about working with us. Can't find an answer?",
  linkText = "Talk to our team",
  linkHref = "/#contact",
  showNumbers = true,
  image = null,
  imageAlt = "",
  imageTitle = "",
  imageCaption = "",
  imageDescription = "",
  imageSide = "left",
  imageSettings,
  showIllustration = true,
}: {
  items?: HomeFaqItem[];
  eyebrow?: string;
  headingLead?: string;
  headingHighlight?: string;
  description?: string;
  linkText?: string;
  linkHref?: string;
  showNumbers?: boolean;
  image?: string | null;
  imageAlt?: string;
  imageTitle?: string;
  imageCaption?: string;
  imageDescription?: string;
  imageSide?: "left" | "right";
  imageSettings?: ImageSettings;
  showIllustration?: boolean;
}) {
  const [open, setOpen] = useState<number | null>(0);

  // Illustration column: an admin-uploaded image (with the universal size panel),
  // the built-in decorative artwork (the original design, default), or nothing —
  // in which case the accordion spans the full width.
  const hasImage = !!image;
  const showArt = hasImage || showIllustration !== false;
  const artRight = imageSide === "right";
  const imgA = smartImgAttrs(imageSettings, {
    extraClass: "mx-auto rounded-3xl border border-ink/10",
    fallbackWidth: "w-full max-w-md",
  });

  // DB-driven FAQs (fallback to built-in defaults when none are published)
  const source = items && items.length > 0 ? items : HOME_FAQ_DEFAULTS;
  const faqs = source.map((f) => ({ q: f.question, a: f.answer }));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: faqPlainText(f.a) },
    })),
  };

  return (
    <section id="faq" className="relative py-12 sm:py-16">
      {/* FAQ schema for SEO (rendered in SSR output) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="container-x">
        <div
          className={`grid items-center gap-10 ${
            showArt ? (artRight ? "lg:grid-cols-[1.1fr_0.9fr]" : "lg:grid-cols-[0.9fr_1.1fr]") : ""
          }`}
        >
          {/* Illustration column — uploaded image, built-in artwork, or hidden */}
          {showArt && (
            <Reveal
              className={
                hasImage
                  ? `order-1 ${artRight ? "lg:order-2" : "lg:order-1"}`
                  : `order-2 ${artRight ? "lg:order-2" : "lg:order-1"}`
              }
            >
              {hasImage ? (
                <figure>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image!}
                    alt={imageAlt}
                    {...(imageTitle ? { title: imageTitle } : {})}
                    className={imgA.className}
                    style={imgA.style}
                    loading={imgA.loading}
                    {...(imgA.fetchPriority ? { fetchPriority: imgA.fetchPriority } : {})}
                  />
                  {(imageCaption || imageDescription) && (
                    <figcaption className="mt-3 text-center text-sm text-muted">
                      {imageCaption ? <span className="block font-medium text-ink/80">{imageCaption}</span> : null}
                      {imageDescription ? <span className="block">{imageDescription}</span> : null}
                    </figcaption>
                  )}
                </figure>
              ) : (
                <FaqIllustration />
              )}
            </Reveal>
          )}

          {/* Heading + accordion */}
          <div className={showArt ? `${hasImage ? "order-2" : "order-1"} ${artRight ? "lg:order-1" : "lg:order-2"}` : ""}>
            <Reveal>
              {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {headingLead}{headingLead && headingHighlight ? " " : ""}
                {headingHighlight && <span className="grad-text">{headingHighlight}</span>}
              </h2>
            </Reveal>
            {(description || linkText) && (
              <Reveal delay={0.16}>
                <p className="mt-3 text-muted">
                  {description}
                  {linkText && (
                    <>
                      {description ? " " : ""}
                      <SmartLink href={linkHref} className="text-primary hover:underline">
                        {linkText}
                      </SmartLink>
                      .
                    </>
                  )}
                </p>
              </Reveal>
            )}

            <div className="mt-8 space-y-3">
              {faqs.map((f, i) => {
                const isOpen = open === i;
                return (
                  <Reveal key={f.q} delay={0.05 * i}>
                    <div
                      className={`glass glow-border overflow-hidden rounded-2xl transition-shadow duration-300 ${
                        isOpen ? "shadow-glow" : "hover:shadow-soft"
                      }`}
                    >
                      <h3>
                        <button
                          onClick={() => setOpen(isOpen ? null : i)}
                          aria-expanded={isOpen}
                          aria-controls={`faq-panel-${i}`}
                          id={`faq-trigger-${i}`}
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-ink/[0.02]"
                        >
                          <span className="font-display text-base font-semibold !text-[#1877F2] sm:text-lg">
                            {showNumbers && <span className="mr-2 tabular-nums">{String(i + 1).padStart(2, "0")}.</span>}
                            {f.q}
                          </span>
                          <span
                            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm transition-all duration-300 ${
                              isOpen
                                ? "rotate-45 bg-gradient-to-br from-primary to-secondary text-white"
                                : "bg-ink/[0.05] text-muted"
                            }`}
                            aria-hidden="true"
                          >
                            +
                          </span>
                        </button>
                      </h3>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={`faq-panel-${i}`}
                            role="region"
                            aria-labelledby={`faq-trigger-${i}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div
                              className={FAQ_ANSWER_CLASS}
                              dangerouslySetInnerHTML={{ __html: f.a }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/15 to-secondary/15 blur-2xl" />
      <div className="glass-strong relative aspect-square overflow-hidden rounded-3xl p-8 shadow-glow">
        {/* decorative grid */}
        <div className="absolute inset-0 bg-grid-faint [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

        {/* central question mark */}
        <div className="relative grid h-full place-items-center">
          <div className="relative grid h-32 w-32 place-items-center rounded-[2rem] bg-gradient-to-br from-primary to-secondary shadow-glow">
            <span className="font-display text-6xl font-bold text-white">?</span>
            <span className="absolute inset-0 rounded-[2rem] ring-1 ring-white/30 [animation:pulse-ring_2.6s_ease-out_infinite]" />
          </div>
        </div>

        {/* floating chat bubbles */}
        <div className="glass absolute left-4 top-8 flex items-center gap-2 rounded-2xl px-3 py-2 shadow-soft animate-float">
          <span className="text-lg">💬</span>
          <span className="text-xs font-medium text-ink">How does it work?</span>
        </div>
        <div className="glass absolute bottom-10 right-4 flex items-center gap-2 rounded-2xl px-3 py-2 shadow-soft animate-float-slow">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-green-500/15 text-[10px] text-green-600">
            ✓
          </span>
          <span className="text-xs font-medium text-ink">Answered!</span>
        </div>
        <div
          className="glass absolute bottom-24 left-2 flex items-center gap-2 rounded-2xl px-3 py-2 shadow-soft animate-float"
          style={{ animationDelay: "1.2s" }}
        >
          <span className="text-lg">🤖</span>
          <span className="text-xs font-medium text-ink">24/7 support</span>
        </div>
      </div>
    </div>
  );
}
