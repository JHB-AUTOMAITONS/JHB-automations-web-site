// Service link-management types — client-safe.
// (Named *Row to avoid clashing with the nav ServiceLink in services.server.)
export type LinkType = "internal" | "external";

export type ServiceLinkRow = {
  id: string;
  service_key: string;
  anchor_text: string;
  url: string;
  type: LinkType;
  new_tab: boolean;
  sort_order: number;
};

// Lightweight shape used for auto-linking on the public page
export type AnchorLink = {
  anchor_text: string;
  url: string;
  new_tab: boolean;
};
