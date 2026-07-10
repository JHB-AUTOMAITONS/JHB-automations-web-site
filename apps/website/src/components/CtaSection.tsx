import Reveal from "./Reveal";
import type { CtaBlock } from "@jhb/shared/home";
import SmartLink from "./SmartLink";
import { sanitizeRichText } from "@jhb/shared/rich-text";
import { ALIGN_TEXT, ALIGN_BLOCK } from "@jhb/shared/containers";

// Server component: the card's entrance is the only animated part (<Reveal>).
export default function CtaSection({ cta }: { cta: CtaBlock }) {
  if (!cta.enabled) return null;
  // Independent heading / description alignment — default "center" preserves the
  // original centred CTA design.
  const ha = cta.headingAlign ?? "center";
  const da = cta.descriptionAlign ?? "center";

  return (
    <section className="relative section-y">
      <div className="container-x">
        <Reveal
          y={30}
          className="glow-border relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-surface to-secondary/15 p-10 text-center shadow-soft sm:p-16"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <h2 className={`relative font-display text-3xl font-bold sm:text-4xl ${ALIGN_TEXT[ha]}`}>
            {cta.title}
          </h2>
          <div
            className={`relative mt-4 max-w-xl text-muted ${ALIGN_TEXT[da]} ${ALIGN_BLOCK[da] || "mr-auto"}`}
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(cta.textHtml) }}
          />
          {cta.buttonText && (
            <SmartLink href={cta.buttonHref} className="btn btn-primary relative mt-8">
              {cta.buttonText} <span aria-hidden>→</span>
            </SmartLink>
          )}
        </Reveal>
      </div>
    </section>
  );
}
