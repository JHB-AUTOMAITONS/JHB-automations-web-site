import Reveal from "./Reveal";

type Props = {
  eyebrow: string;
  title: React.ReactNode;
  desc?: string;
  /** Rich-text (HTML) description — takes precedence over `desc`. */
  descHtml?: string;
};

export default function SectionHeading({ eyebrow, title, desc, descHtml }: Props) {
  return (
    <div className="mx-auto mb-14 max-w-2xl text-center">
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
            className="prose-jhb mx-auto mt-4 max-w-2xl text-lg text-muted [&_a]:text-primary [&_a]:underline [&_p]:m-0"
            dangerouslySetInnerHTML={{ __html: descHtml }}
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
