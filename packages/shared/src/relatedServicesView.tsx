import type { ReactNode } from "react";
import Link from "next/link";
import Icon from "./icon";
import type { RelatedServiceCard, RelatedServicesContent } from "./servicePages";
import { sanitizeRichText } from "./richText";

/**
 * SINGLE source of truth for the "Explore Related Services" section. Rendered by
 * the public Service Page (ServiceDetail) AND the admin editor's live preview, so
 * the preview matches the published page exactly. The card markup mirrors the
 * original hardcoded design; everything is now driven by editable content.
 */

const HOVER: Record<RelatedServiceCard["hover"], string> = {
  lift: "hover:-translate-y-1",
  glow: "hover:shadow-glow",
  none: "",
};

function Card({ card, href }: { card: RelatedServiceCard; href: string }) {
  const custom = !!card.bg || !!card.border;
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-2xl p-4 transition-all ${custom ? "border" : "glass glow-border"} ${HOVER[card.hover] ?? HOVER.lift}`}
      style={{
        backgroundColor: card.bg || undefined,
        borderColor: custom ? card.border || "transparent" : undefined,
      }}
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary ring-1 ring-ink/10 transition-all group-hover:from-primary group-hover:to-secondary group-hover:text-white"
        style={card.iconColor ? { color: card.iconColor } : undefined}
      >
        {card.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.image} alt="" className="h-10 w-10 object-cover" />
        ) : (
          <Icon name={card.icon} className="h-5 w-5" />
        )}
      </span>
      <span className="min-w-0">
        <span
          className="block min-w-0 break-words text-sm font-medium text-muted transition-colors group-hover:text-ink"
          style={card.textColor ? { color: card.textColor } : undefined}
        >
          {card.name}
        </span>
        {card.description ? (
          <span className="mt-0.5 block break-words text-xs text-muted/80">{card.description}</span>
        ) : null}
      </span>
    </Link>
  );
}

export function RelatedServicesView({
  content,
  serviceUrlByKey = {},
  Reveal,
}: {
  content: RelatedServicesContent;
  // key → public URL ("/slug"), used to resolve each card's target service.
  serviceUrlByKey?: Record<string, string>;
  // Optional animation wrapper for the header (website passes its framer Reveal;
  // the admin preview omits it). Same pattern as aboutView / containerView.
  Reveal?: (props: { children: ReactNode }) => ReactNode;
}) {
  const cards = content.cards.filter((c) => c.enabled);
  if (!content.enabled || cards.length === 0) return null;
  const Wrap = Reveal ?? (({ children }: { children: ReactNode }) => <>{children}</>);
  const hasHeading = !!(content.headingLead || content.headingHighlight || content.headingTail);
  return (
    <section className="container-x section-y">
      <Wrap>
        <div className="mb-8 max-w-2xl">
          {content.eyebrow ? <span className="eyebrow">{content.eyebrow}</span> : null}
          {hasHeading ? (
            <h2 className={`font-display text-2xl font-bold sm:text-3xl ${content.eyebrow ? "mt-4" : ""}`}>
              {content.headingLead}
              {content.headingHighlight ? (
                <>
                  {content.headingLead ? " " : ""}
                  <span className="grad-text">{content.headingHighlight}</span>
                </>
              ) : null}
              {content.headingTail ? <>{" "}{content.headingTail}</> : null}
            </h2>
          ) : null}
          {content.subtitle ? (
            <div
              className="prose-jhb mt-3 text-muted [&_a]:text-primary [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(content.subtitle) }}
            />
          ) : null}
        </div>
      </Wrap>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.id} card={card} href={card.customUrl || serviceUrlByKey[card.target] || "#"} />
        ))}
      </div>
    </section>
  );
}
