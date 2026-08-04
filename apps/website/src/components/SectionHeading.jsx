import Reveal from "./Reveal";
import { sanitizeRichText } from "@jhb/shared/rich-text";
import { ALIGN_TEXT, ALIGN_BLOCK } from "@jhb/shared/containers";

export default function SectionHeading({ eyebrow, title, desc, descHtml, align, headingAlign, descriptionAlign }) {
  // Default (nothing set) keeps the original centered header. The heading align
  // drives the eyebrow + heading text AND the whole header block's position; the
  // description aligns independently.
  const set = headingAlign ?? descriptionAlign ?? align;
  const ha = headingAlign ?? align ?? "center";
  const da = descriptionAlign ?? align ?? "center";
  const wrapBlock = set ? ALIGN_BLOCK[ha] || "mr-auto" : "mx-auto";
  return (
    <div className={`mb-10 max-w-2xl ${wrapBlock} ${ALIGN_TEXT[ha]}`}>
      <Reveal>
        <span className="eyebrow">{eyebrow}</span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h2>
      </Reveal>
      {descHtml ? (
        <Reveal delay={0.16}>
          <div
            className={`prose-jhb mt-4 max-w-2xl text-lg text-muted [&_a]:text-primary [&_p]:m-0 ${ALIGN_TEXT[da]}`}
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(descHtml) }}
          />
        </Reveal>
      ) : desc ? (
        <Reveal delay={0.16}>
          <p className={`mt-4 text-lg text-muted ${ALIGN_TEXT[da]}`}>{desc}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
