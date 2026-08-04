import Image from "next/image";
import Reveal from "./Reveal";
import { stripHeadingTags, ALIGN_TEXT, richTextAlign, toAlign } from "@jhb/shared/containers";
import { sanitizeRichText } from "@jhb/shared/rich-text";
import { Heading } from "@jhb/shared/heading";

// Server component: copy + image are static; only their entrance is animated.
export default function AboutSection({
  about,
  imageAlt,
}) {
  if (!about.enabled) return null;

  return (
    <section id="about" className="relative section-y">
      <div className="container-x">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal x={-30} y={0}>
            {about.eyebrow && <span className="eyebrow">{about.eyebrow}</span>}
            {(() => {
              const s = sanitizeRichText(about.title);
              const ta = richTextAlign(s);
              return (
                // Real <h2> (was role="heading"); the value is unwrapped of any
                // nested <hN> so no duplicate/nested heading is produced. Alignment:
                // an explicit rich-text align wins, else the section's headingAlign.
                <Heading
                  tag="h2"
                  className={`mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl [&_p]:m-0 [&_a]:text-primary ${ALIGN_TEXT[ta ?? toAlign(about.headingAlign)]}`}
                  html={stripHeadingTags(s)}
                />
              );
            })()}
            <div
              className={`prose-jhb mt-5 space-y-4 text-lg leading-relaxed text-muted [&_a]:text-primary [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 ${ALIGN_TEXT[toAlign(about.descriptionAlign)]}`}
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(about.descriptionHtml) }}
            />
          </Reveal>

          <Reveal scale={0.95} y={0} delay={0.1} className="relative">
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/15 to-secondary/15 blur-2xl" />
            {about.image ? (
              <div className="glass-strong relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-glow">
                <Image
                  src={about.image}
                  alt={imageAlt || about.title.replace(/<[^>]+>/g, "")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 512px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="glass-strong grid aspect-[4/3] place-items-center rounded-3xl shadow-glow">
                <span className="text-6xl">🚀</span>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
