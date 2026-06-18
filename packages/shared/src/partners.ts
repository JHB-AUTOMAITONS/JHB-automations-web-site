// Client-safe types + defaults for the "Powered by" partners strip.
// Server fetcher lives in partners.server.ts.

export type Partner = { name: string; color: string; logo?: string };
export type PartnersDoc = { enabled: boolean; heading: string; items: Partner[] };

export const PARTNERS_DEFAULT: PartnersDoc = {
  enabled: true,
  heading: "Powered by industry-leading platforms & tools",
  items: [
    { name: "n8n", color: "#EA4B71" },
    { name: "Meta", color: "#0866FF" },
    { name: "Shopify", color: "#5E8E3E" },
    { name: "Google", color: "#4285F4" },
    { name: "WordPress", color: "#21759B" },
    { name: "ChatGPT", color: "#10A37F" },
  ],
};

// Normalise a saved doc so partial/older documents still render safely.
// `enabled` defaults to true so existing records keep showing the strip.
export function withPartnerDefaults(doc: Partial<PartnersDoc> | null): PartnersDoc {
  const items = Array.isArray(doc?.items)
    ? doc!.items
        .filter((p): p is Partner => !!p && typeof p.name === "string" && p.name.trim() !== "")
        .map((p) => ({
          name: p.name,
          color: p.color || "#4285F4",
          ...(p.logo ? { logo: p.logo } : {}),
        }))
    : PARTNERS_DEFAULT.items;
  return {
    enabled: doc?.enabled ?? true,
    heading: doc?.heading || PARTNERS_DEFAULT.heading,
    items: items.length > 0 ? items : PARTNERS_DEFAULT.items,
  };
}
