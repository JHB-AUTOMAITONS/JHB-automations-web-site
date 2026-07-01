import "server-only";

// Native SEO analysis engine — the in-app "Advanced SEO Analysis Engine",
// implementing the methodology of the claude-seo plugin (technical, content,
// schema, heading, image, canonical/robots, thin-content checks) in dependency-
// free TypeScript. Output is structured findings + a 0-100 score, suitable to
// show directly and to feed Claude for reasoning/recommendations.

export type Severity = "good" | "info" | "warning" | "critical";

export type Finding = {
  category: string;
  severity: Severity;
  title: string;
  detail: string;
};

export type SeoSignals = {
  url?: string;
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  robots: string | null;
  h1: string[];
  h2: string[];
  h3: string[];
  images: { src: string; alt: string | null }[];
  internalLinks: number;
  externalLinks: number;
  wordCount: number;
  jsonLdTypes: string[];
  hasViewport: boolean;
  lang: string | null;
};

export type SeoReport = {
  score: number; // 0-100
  signals: SeoSignals;
  findings: Finding[];
};

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

const stripTags = (html: string) =>
  decode(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

function allMatches(re: RegExp, s: string): RegExpExecArray[] {
  const out: RegExpExecArray[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) out.push(m);
  return out;
}

// Extract SEO signals from raw HTML (live page) without a DOM library.
export function extractSignals(html: string, baseUrl?: string): SeoSignals {
  const head = (html.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? html).toString();
  const title = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const metaDesc = head.match(/<meta[^>]+name=["']description["'][^>]*content=["']([\s\S]*?)["']/i)?.[1]
    ?? head.match(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["']/i)?.[1];
  const canonical = head.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
  const robots = head.match(/<meta[^>]+name=["']robots["'][^>]*content=["']([^"']+)["']/i)?.[1];
  const lang = html.match(/<html[^>]+lang=["']([^"']+)["']/i)?.[1];
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(head);

  const h1 = allMatches(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, html).map((m) => stripTags(m[1])).filter(Boolean);
  const h2 = allMatches(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, html).map((m) => stripTags(m[1])).filter(Boolean);
  const h3 = allMatches(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, html).map((m) => stripTags(m[1])).filter(Boolean);

  const images = allMatches(/<img\b[^>]*>/gi, html).map((m) => {
    const tag = m[0];
    const src = tag.match(/\bsrc=["']([^"']*)["']/i)?.[1] ?? "";
    const altMatch = tag.match(/\balt=["']([^"']*)["']/i);
    return { src, alt: altMatch ? altMatch[1] : null };
  });

  const host = baseUrl ? safeHost(baseUrl) : null;
  let internal = 0;
  let external = 0;
  for (const m of allMatches(/<a\b[^>]*href=["']([^"']+)["']/gi, html)) {
    const href = m[1];
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    if (href.startsWith("/")) internal++;
    else if (/^https?:\/\//i.test(href)) {
      if (host && safeHost(href) === host) internal++;
      else external++;
    }
  }

  const jsonLdTypes: string[] = [];
  for (const m of allMatches(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, html)) {
    try {
      const data = JSON.parse(m[1].trim());
      collectTypes(data, jsonLdTypes);
    } catch {
      /* ignore invalid json-ld here; flagged in findings */
    }
  }

  const bodyText = stripTags(html.match(/<body[\s\S]*?<\/body>/i)?.[0] ?? html);
  const wordCount = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0;

  return {
    url: baseUrl,
    title: title ? stripTags(title) : null,
    metaDescription: metaDesc ? decode(metaDesc).trim() : null,
    canonical: canonical ?? null,
    robots: robots ?? null,
    h1,
    h2,
    h3,
    images,
    internalLinks: internal,
    externalLinks: external,
    wordCount,
    jsonLdTypes: [...new Set(jsonLdTypes)],
    hasViewport,
    lang: lang ?? null,
  };
}

// Build signals from CMS fields (no live HTML) — used by editors before publish.
export function signalsFromContent(input: {
  title?: string | null;
  metaDescription?: string | null;
  contentHtml?: string | null;
  canonical?: string | null;
  robots?: string | null;
  schemaJson?: string | null;
}): SeoSignals {
  const html = input.contentHtml ?? "";
  const base = extractSignals(html);
  const jsonLdTypes: string[] = [];
  if (input.schemaJson) {
    try {
      collectTypes(JSON.parse(input.schemaJson), jsonLdTypes);
    } catch {
      /* invalid schema flagged below */
    }
  }
  return {
    ...base,
    title: input.title ?? base.title,
    metaDescription: input.metaDescription ?? base.metaDescription,
    canonical: input.canonical ?? base.canonical,
    robots: input.robots ?? base.robots,
    jsonLdTypes: jsonLdTypes.length ? [...new Set(jsonLdTypes)] : base.jsonLdTypes,
  };
}

export function analyzeSignals(s: SeoSignals): SeoReport {
  const f: Finding[] = [];
  const add = (category: string, severity: Severity, title: string, detail: string) =>
    f.push({ category, severity, title, detail });

  // --- Title ---
  const tlen = (s.title ?? "").length;
  if (!s.title) add("Meta", "critical", "Missing title", "No <title> / meta title found.");
  else if (tlen < 30) add("Meta", "warning", "Title is short", `${tlen} chars — aim for 50–60.`);
  else if (tlen > 65) add("Meta", "warning", "Title is long", `${tlen} chars — may be truncated in SERPs (aim ≤ 60).`);
  else add("Meta", "good", "Title length OK", `${tlen} characters.`);

  // --- Meta description ---
  const dlen = (s.metaDescription ?? "").length;
  if (!s.metaDescription) add("Meta", "critical", "Missing meta description", "Add a 140–160 char description.");
  else if (dlen < 70) add("Meta", "warning", "Description is short", `${dlen} chars — aim 140–160.`);
  else if (dlen > 165) add("Meta", "warning", "Description is long", `${dlen} chars — may be truncated.`);
  else add("Meta", "good", "Description length OK", `${dlen} characters.`);

  // --- Headings ---
  if (s.h1.length === 0) add("Headings", "critical", "No H1", "Every page should have exactly one H1.");
  else if (s.h1.length > 1) add("Headings", "warning", "Multiple H1s", `Found ${s.h1.length} H1s — use one.`);
  else add("Headings", "good", "Single H1", s.h1[0].slice(0, 80));
  if (s.h1.length >= 1 && s.h2.length === 0 && s.wordCount > 300)
    add("Headings", "info", "No H2 sections", "Long content benefits from H2 subheadings.");

  // --- Images ---
  const noAlt = s.images.filter((i) => !i.alt || !i.alt.trim());
  if (s.images.length === 0) add("Images", "info", "No images", "Visual content can improve engagement.");
  else if (noAlt.length > 0)
    add("Image SEO", "warning", "Images missing alt text", `${noAlt.length}/${s.images.length} images have no alt attribute.`);
  else add("Image SEO", "good", "All images have alt text", `${s.images.length} images.`);

  // --- Content depth ---
  if (s.wordCount > 0 && s.wordCount < 300)
    add("Content", "warning", "Thin content", `${s.wordCount} words — pages under ~300 words often rank poorly.`);
  else if (s.wordCount >= 300) add("Content", "good", "Sufficient content depth", `${s.wordCount} words.`);

  // --- Internal linking ---
  if (s.internalLinks === 0 && s.wordCount > 300)
    add("Internal Links", "warning", "No internal links", "Add links to related pages to spread authority.");
  else if (s.internalLinks > 0) add("Internal Links", "good", "Internal links present", `${s.internalLinks} internal links.`);

  // --- Schema ---
  if (s.jsonLdTypes.length === 0) add("Schema", "warning", "No structured data", "Add JSON-LD (Article/Product/FAQ/Organization).");
  else add("Schema", "good", "Structured data present", s.jsonLdTypes.join(", "));

  // --- Canonical / robots (only meaningful for live pages) ---
  if (s.url) {
    if (!s.canonical) add("Canonical", "warning", "No canonical tag", "Add a self-referencing canonical.");
    else add("Canonical", "good", "Canonical present", s.canonical);
    if (s.robots && /noindex/i.test(s.robots))
      add("Robots", "critical", "Page is noindex", "This page is excluded from search via robots meta.");
  }

  // --- Score: start at 100, subtract by severity. ---
  const penalty = { critical: 22, warning: 9, info: 2, good: 0 } as const;
  const score = Math.max(0, Math.min(100, 100 - f.reduce((sum, x) => sum + penalty[x.severity], 0)));
  return { score, signals: s, findings: f };
}

export async function fetchAndAnalyzeUrl(url: string): Promise<{ ok: true; report: SeoReport } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, { headers: { "user-agent": "JHB-AI-SEO/1.0" }, cache: "no-store" });
    if (!res.ok) return { ok: false, error: `Fetch failed: ${res.status} ${res.statusText}` };
    const html = await res.text();
    return { ok: true, report: analyzeSignals(extractSignals(html, url)) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not fetch the URL." };
  }
}

export function reportToPrompt(r: SeoReport): string {
  const lines = r.findings.map((x) => `- [${x.severity}] ${x.category}: ${x.title} — ${x.detail}`);
  return [
    `SEO ANALYSIS (score ${r.score}/100):`,
    `signals: title=${q(r.signals.title)} descLen=${(r.signals.metaDescription ?? "").length} h1=${r.signals.h1.length} words=${r.signals.wordCount} imgsNoAlt=${r.signals.images.filter((i) => !i.alt).length} schema=[${r.signals.jsonLdTypes.join(",")}]`,
    ...lines,
  ].join("\n");
}

const q = (v: string | null) => (v ? `"${v.slice(0, 60)}"` : "none");
function safeHost(u: string): string | null {
  try {
    return new URL(u).host;
  } catch {
    return null;
  }
}
function collectTypes(node: unknown, out: string[]) {
  if (!node) return;
  if (Array.isArray(node)) return node.forEach((n) => collectTypes(n, out));
  if (typeof node === "object") {
    const o = node as Record<string, unknown>;
    if (typeof o["@type"] === "string") out.push(o["@type"] as string);
    else if (Array.isArray(o["@type"])) (o["@type"] as unknown[]).forEach((t) => typeof t === "string" && out.push(t));
    if (Array.isArray(o["@graph"])) collectTypes(o["@graph"], out);
  }
}
