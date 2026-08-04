import Image from "next/image";
import { ALIGN_TEXT, toAlign } from "@jhb/shared/containers";
import { sanitizeRichText } from "@jhb/shared/rich-text";
import { RichInline } from "@jhb/shared/rich-inline";
import Reveal from "./Reveal";

// Server component: all entrances run through <Reveal>, so nothing here ships
// to the client bundle.
export default function FounderPerspective({ founder }) {
  if (!founder.enabled) return null;
  // Admin-selected alignment for the eyebrow + heading only ("left" = the
  // original design; description/focus list keep their layout untouched). Uses
  // the shared alignment system (@jhb/shared/containers) so it matches the CMS.
  const headingAlign = ALIGN_TEXT[toAlign(founder.headingAlign)];

  return (
    <section id="founder" className="relative section-y">
      <div className="container-x">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: copy */}
          <div className="order-2 lg:order-1">
            <Reveal className={headingAlign}>
              <span className="eyebrow">{founder.eyebrow}</span>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className={`mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl ${headingAlign}`}>
                {founder.heading} <span className="grad-text">{founder.highlight}</span>
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <div
                className={`prose-jhb mt-5 text-lg leading-relaxed text-muted [&_a]:text-primary ${ALIGN_TEXT[toAlign(founder.descriptionAlign)]}`}
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(founder.descriptionHtml) }}
              />
            </Reveal>

            {founder.focusPoints.length > 0 && (
              <>
                <Reveal delay={0.24}>
                  <h3 className="mt-8 font-display text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                    {founder.focusTitle}
                  </h3>
                </Reveal>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {founder.focusPoints.map((point, i) => (
                    <Reveal
                      as="li"
                      key={point}
                      x={-16}
                      y={0}
                      duration={0.45}
                      delay={i * 0.08}
                      className="glass flex items-center gap-3 rounded-xl px-4 py-3"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
                        ✓
                      </span>
                      <span className="text-sm font-medium"><RichInline html={point} /></span>
                    </Reveal>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Right: founder image */}
          <Reveal delay={0.1} className="order-1 lg:order-2">
            <FounderImage founder={founder} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FounderImage({ founder }) {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/15 to-secondary/15 blur-2xl" />
      <div className="glass-strong relative aspect-[3/4] w-full overflow-hidden rounded-3xl shadow-glow">
        <Image
          src={founder.image || "/founder.jpg"}
          alt={founder.imageAlt || `${founder.name}, ${founder.company}`}
          fill
          sizes="(max-width: 1024px) 100vw, 384px"
          className="object-cover object-[center_30%]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/50 via-ink/15 to-transparent" />
      </div>

      {/* floating accent badge */}
      <div className="glass absolute -bottom-4 left-6 flex items-center gap-2 rounded-2xl px-4 py-2.5 shadow-soft">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs text-white">
          ★
        </span>
        <div className="leading-tight">
          <p className="text-xs font-semibold">{founder.name}</p>
          <p className="text-[11px] text-muted">{founder.company}</p>
        </div>
      </div>
    </div>
  );
}
