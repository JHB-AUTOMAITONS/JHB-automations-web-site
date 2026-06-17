// Service link-management types — client-safe.
// (Named *Row to avoid clashing with the nav ServiceLink in services.server.)
export type LinkType = "internal" | "external";
export type LinkRel = "dofollow" | "nofollow";

export type ServiceLinkRow = {
  id: string;
  service_key: string;
  anchor_text: string;
  url: string;
  type: LinkType;
  new_tab: boolean;
  link_type: LinkRel;
  sponsored: boolean;
  ugc: boolean;
  sort_order: number;
};

// Lightweight shape used for auto-linking on the public page
export type AnchorLink = {
  anchor_text: string;
  url: string;
  new_tab: boolean;
  link_type: LinkRel;
  sponsored: boolean;
  ugc: boolean;
};

// Build the rel="" attribute from a link's SEO settings.
// Returns undefined when no rel tokens are needed (clean dofollow, same tab).
export function buildRel(link: {
  url: string;
  new_tab: boolean;
  link_type: LinkRel;
  sponsored: boolean;
  ugc: boolean;
}): string | undefined {
  const external = /^https?:\/\//i.test(link.url.trim());
  const newTab = link.new_tab || external;
  const tokens: string[] = [];
  if (link.link_type === "nofollow") tokens.push("nofollow");
  if (link.sponsored) tokens.push("sponsored");
  if (link.ugc) tokens.push("ugc");
  if (newTab) tokens.push("noopener", "noreferrer");
  return tokens.length ? tokens.join(" ") : undefined;
}
