import Reveal from "./Reveal";
import { sanitizeRichText } from "@jhb/shared/rich-text";
import { ALIGN_TEXT, ALIGN_BLOCK, type ContainerAlign } from "@jhb/shared/containers";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  desc?: string;
  /** Rich-text (HTML) description — takes precedence over `desc`. */
  descHtml?: string;
  /** Horizontal alignment. Absent → the original centered design (unchanged). */
  align?: ContainerAlign | null;
};

export default function SectionHeading({ eyebrow, title, desc, descHtml, align }: Props) {
  // Default (no align) keeps the original centered header. When an alignment is
  // provided it drives the text alignment AND the block position, so a left/right
  // choice moves the whole header — not just the text inside a centered column.
  const wrap = align ? `${ALIGN_TEXT[align]} ${ALIGN_BLOCK[align] || "mr-auto"}` : "mx-auto text-center";
  const descBlock = align ? ALIGN_BLOCK[align] || "mr-auto" : "mx-auto";
  return (
    <div className={`mb-10 max-w-2xl ${wrap}`}>
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
            className={`prose-jhb mt-4 max-w-2xl text-lg text-muted [&_a]:text-primary [&_p]:m-0 ${descBlock}`}
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(descHtml) }}
          />
        </Reveal>
      ) : desc ? (
        <Reveal delay={0.16}>
          <p className="mt-4 text-lg text-muted">{desc}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
