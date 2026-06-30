"use server";

import { createClient } from "@jhb/shared/supabase/server";
import { callClaude, callClaudeJSON, callClaudeVision, isClaudeConfigured } from "@/lib/ai/claude";
import {
  keywordResearch,
  keywordResearchToContext,
  parseKeywordPaste,
  isSeoConnectorConfigured,
  type KeywordResearch,
} from "@/lib/ai/seoConnector";
import { getRepoContext, repoContextToPrompt } from "@/lib/ai/repoContext";
import { getEffectiveAuthorPublisher } from "@jhb/shared/content-server";
import type { AuthorPublisher } from "@jhb/shared/content";
import {
  analyzeSignals,
  signalsFromContent,
  fetchAndAnalyzeUrl,
  reportToPrompt,
  type SeoReport,
} from "@/lib/ai/seoAnalysis";

// ---- shared guards / helpers -------------------------------------------------

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be signed in." };
  const { data: profile } = await supabase
    .from("jhb_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin")
    return { ok: false as const, error: "Only a Super Admin can use the AI SEO Assistant." };
  return { ok: true as const, supabase, user };
}

// Best-effort audit/history trail. Never blocks a result if the table is absent.
async function record(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email: string | undefined,
  tool: string,
  input: unknown,
  output: unknown
) {
  try {
    await supabase.from("jhb_ai_history").insert({
      tool,
      input: input as Record<string, unknown>,
      output: output as Record<string, unknown>,
      user_id: userId,
      user_email: email,
    });
  } catch {
    /* table may not exist yet — non-fatal */
  }
}

const WEBSITE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const BRAND_SYSTEM =
  "You are the in-house SEO strategist and copywriter for JHB Automations — an AI automation, web development and digital-marketing company based in Salem, Tamil Nadu, India. " +
  "Write in clear, confident, benefit-led British/Indian English. Follow current Google & AI-search (GEO/AEO) best practices: search intent match, E-E-A-T signals, natural keyword usage (no stuffing), scannable structure, and helpful, original content. Never fabricate statistics or client names.";

// Compact author/publisher context for SEO generation prompts (E-E-A-T + schema).
function authorPublisherToContext(ap: AuthorPublisher): string {
  const a = ap.author;
  const p = ap.publisher;
  const lines: string[] = [];
  if (a.name) lines.push(`Author: ${a.name}${a.jobTitle ? `, ${a.jobTitle}` : ""}${a.profileUrl ? ` (${a.profileUrl})` : ""}${a.bio ? ` — ${a.bio}` : ""}`);
  if (p.name) lines.push(`Publisher: ${p.name} (${p.orgType || "Organization"})${p.website ? ` ${p.website}` : ""}${p.description ? ` — ${p.description}` : ""}`);
  return lines.length
    ? `AUTHOR & PUBLISHER (use for E-E-A-T and the schema author/publisher/creator/copyrightHolder):\n${lines.join("\n")}`
    : "";
}

// ---- status ------------------------------------------------------------------

export type AiSeoStatus = {
  claude: boolean;
  seoConnector: boolean;
  repo: boolean;
};

// Lightweight check the client uses to decide auto (one-click) vs manual
// (copy-paste) mode. True only when an Anthropic API key is configured.
export async function aiAutoEnabled(): Promise<boolean> {
  return isClaudeConfigured();
}

export async function getAiSeoStatus(): Promise<AiSeoStatus> {
  const repo = await getRepoContext("/");
  return {
    claude: isClaudeConfigured(),
    seoConnector: isSeoConnectorConfigured(),
    repo: repo.available,
  };
}

// ---- Manual mode: build a copy-paste prompt (no API call) -------------------
//
// For accounts using a claude.ai subscription instead of an API key. Assembles
// the full prompt (brand voice + context + task + required output format) so the
// admin can paste it straight into claude.ai and paste the answer back. Works
// without ANTHROPIC_API_KEY because it never calls the API.

export async function buildPrompt(
  kind: string,
  values: Record<string, string>
): Promise<{ ok: true; prompt: string; note?: string } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const v = values || {};
  const header = (task: string) => `${BRAND_SYSTEM}\n\n${task}`;
  const jsonRule = (shape: string) =>
    `\n\nReturn your answer as a SINGLE valid JSON value and nothing else (no markdown, no commentary). It MUST match this shape:\n${shape}`;

  let prompt = "";
  let note: string | undefined;

  switch (kind) {
    case "page-seo": {
      const route = v.route || "/";
      const seed = (v.focusKeyword || v.title || route).trim();
      const [repo, keywords, ap] = await Promise.all([getRepoContext(route), keywordResearch(seed, v.country), getEffectiveAuthorPublisher(route)]);
      const report = analyzeSignals(signalsFromContent({ title: v.title, contentHtml: v.contentHtml }));
      const apCtx = authorPublisherToContext(ap);
      prompt =
        header(`Produce best-practice SEO metadata for the page at route "${route}".`) +
        `\n\n${v.title ? `Current title: ${v.title}\n` : ""}${v.contentHtml ? `Current content (HTML):\n${v.contentHtml.slice(0, 5000)}\n` : ""}` +
        `\n${keywordResearchToContext(keywords)}\n\n${apCtx ? apCtx + "\n\n" : ""}${reportToPrompt(report)}\n\n${repoContextToPrompt(repo)}` +
        `\n\nIn schemaJsonLd, include author (Person) and publisher (Organization) from the Author & Publisher info above when present, plus creator, copyrightHolder and mainEntityOfPage.` +
        jsonRule(PAGE_SEO_SHAPE);
      break;
    }
    case "blog":
      prompt =
        header(`Write a complete, SEO-optimized blog article.\nTopic: ${v.topic}\nPrimary keyword: ${v.primaryKeyword}${v.location ? `\nTarget location: ${v.location}` : ""}`) +
        `\n\ncontentHtml must be clean semantic HTML (h2/h3/p/ul/strong/a), 900-1400 words, primary keyword in H1/intro/some H2s; add 3-5 FAQs and valid FAQPage+Article JSON-LD as a string.` +
        jsonRule(`{"title":string,"metaTitle":string,"metaDescription":string,"slug":string,"h1":string,"outline":[{"h2":string,"h3":string[]}],"contentHtml":string,"faqs":[{"question":string,"answer":string}],"schemaJsonLd":string,"cta":string,"internalLinks":[{"anchor":string,"href":string}]}`);
      break;
    case "faqs":
      prompt =
        header(`Generate ${Math.min(12, Math.max(3, Number(v.count) || 6))} genuinely useful FAQs about: ${v.topic}.`) +
        `${v.contentHtml ? `\n\nBase them on this content:\n${v.contentHtml.slice(0, 4000)}` : ""}\n\nAnswers may use light HTML (<a>,<strong>,<ul>). Match real People-Also-Ask questions.` +
        jsonRule(`{"faqs":[{"question":string,"answer":string}]}`);
      break;
    case "schema":
      prompt =
        header(`Produce valid Schema.org JSON-LD of @type "${v.type}".${v.url ? `\nPage URL: ${v.url}` : ""}\nDetails:\n${v.details}`) +
        `\n\nReturn ONLY the JSON-LD object (no markdown). It must parse as JSON.`;
      note = "Paste Claude's reply (the JSON-LD) back below.";
      break;
    case "service":
    case "content":
      prompt =
        header(`Write "${kind === "service" ? "service" : v.kind || "section"}" content.${v.keyword ? `\nPrimary keyword to weave in naturally: ${v.keyword}` : ""}\nBrief: ${v.brief}`) +
        `\n\nReturn clean semantic HTML only (no <html>/<body>, no inline styles). Keep it conversion-focused and on-brand.`;
      note = "Paste Claude's reply (the HTML) back below.";
      break;
    case "image-seo":
      prompt =
        header(`I will attach an image. Write SEO + accessibility metadata for it.${v.context ? `\nPage context: ${v.context}` : ""}`) +
        jsonRule(`{"altText":string,"imageTitle":string,"caption":string,"description":string,"fileName":string}`);
      note = "In claude.ai, ATTACH the image (paperclip) along with this prompt, then paste the JSON reply back below.";
      break;
    case "improve":
      prompt =
        header(`Improve the following content for clarity, readability, structure and SEO. Keep the meaning and the brand voice.${v.keyword ? `\nPrimary keyword to keep prominent: ${v.keyword}` : ""}`) +
        `\n\nReturn clean semantic HTML only (no <html>/<body>, no inline styles).\n\nContent:\n${(v.contentHtml || "").slice(0, 6000)}`;
      note = "Paste Claude's reply (the improved HTML) back below.";
      break;
    case "keywords": {
      const kw = await keywordResearch((v.focusKeyword || v.title || v.route || "").trim(), v.country);
      prompt =
        header(`Recommend the optimal focus keyword and secondary keywords for this page.${v.title ? `\nTitle: ${v.title}` : ""}${v.route ? `\nRoute: ${v.route}` : ""}`) +
        `\n\n${v.contentHtml ? `Content:\n${v.contentHtml.slice(0, 3000)}\n\n` : ""}${keywordResearchToContext(kw)}` +
        jsonRule(`{"focusKeyword":string,"secondaryKeywords":string[] (6-10),"metaKeywords":string (comma-separated)}`);
      break;
    }
    case "internal-links": {
      const repo = await getRepoContext(v.route || "/");
      prompt =
        header(`Suggest internal links FROM this page to other pages on the same site. Use plausible site paths and natural anchor text.${v.title ? `\nTitle: ${v.title}` : ""}`) +
        `\n\n${v.contentHtml ? `Content:\n${v.contentHtml.slice(0, 3000)}\n\n` : ""}${repoContextToPrompt(repo)}` +
        jsonRule(`{"internalLinks":[{"anchor":string,"href":string,"reason":string}]}`);
      break;
    }
    default:
      return { ok: false, error: `Unknown prompt kind "${kind}".` };
  }

  await record(auth.supabase, auth.user.id, auth.user.email, `prompt:${kind}`, { kind }, { built: true });
  return { ok: true, prompt, note };
}

// ---- 1) Generate full page SEO ----------------------------------------------

export type PageSeoResult = {
  seoTitle: string;
  metaDescription: string;
  metaKeywords: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  slug: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
  faqs: { question: string; answer: string }[];
  schemaJsonLd: string;
  internalLinks: { anchor: string; href: string; reason: string }[];
  imageAlt: string;
  imageTitle: string;
  imageCaption: string;
  imageDescription: string;
};

const PAGE_SEO_SHAPE = `{
  "seoTitle": string (50-60 chars, includes focus keyword),
  "metaDescription": string (140-160 chars, compelling, includes focus keyword),
  "metaKeywords": string (comma-separated, 6-10),
  "focusKeyword": string,
  "secondaryKeywords": string[] (4-8),
  "slug": string (kebab-case, no leading slash),
  "canonical": string (absolute or path; "" to keep existing),
  "ogTitle": string, "ogDescription": string,
  "twitterTitle": string, "twitterDescription": string,
  "faqs": [{"question": string, "answer": string (plain text, 1-3 sentences)}],
  "schemaJsonLd": string (a valid JSON-LD object as a STRING),
  "internalLinks": [{"anchor": string, "href": string (site path), "reason": string}],
  "imageAlt": string, "imageTitle": string, "imageCaption": string, "imageDescription": string
}`;

export async function aiGeneratePageSeo(input: {
  route: string;
  title?: string;
  contentHtml?: string;
  focusKeyword?: string;
  country?: string;
}): Promise<
  | { ok: true; data: PageSeoResult; meta: { keywordSource: string; repoAvailable: boolean; analysisScore: number } }
  | { ok: false; error: string }
> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  if (!isClaudeConfigured()) return { ok: false, error: "Claude is not configured (ANTHROPIC_API_KEY)." };

  const seed = (input.focusKeyword || input.title || input.route).trim();
  const [repo, keywords, authorPublisher] = await Promise.all([
    getRepoContext(input.route),
    keywordResearch(seed, input.country),
    getEffectiveAuthorPublisher(input.route),
  ]);
  const report = analyzeSignals(
    signalsFromContent({ title: input.title, contentHtml: input.contentHtml })
  );

  const prompt = [
    `TASK: Produce best-practice SEO metadata for the page at route "${input.route}".`,
    input.title ? `Current title: ${input.title}` : "",
    input.contentHtml ? `Current content (HTML, may be partial):\n${input.contentHtml.slice(0, 5000)}` : "",
    keywordResearchToContext(keywords),
    authorPublisherToContext(authorPublisher),
    reportToPrompt(report),
    repoContextToPrompt(repo),
    "Use the live keyword data when present; otherwise estimate and stay conservative. Internal-link hrefs must be plausible site paths.",
    "In schemaJsonLd, include author (Person) and publisher (Organization) from the Author & Publisher info above when present, plus creator, copyrightHolder, datePublished, dateModified and mainEntityOfPage where appropriate.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const res = await callClaudeJSON<PageSeoResult>({
    system: BRAND_SYSTEM,
    prompt,
    schemaHint: PAGE_SEO_SHAPE,
    maxTokens: 4096,
  });
  if (!res.ok) return { ok: false, error: res.error };

  await record(auth.supabase, auth.user.id, auth.user.email, "page-seo", input, res.data);
  return {
    ok: true,
    data: res.data,
    meta: { keywordSource: keywords.source, repoAvailable: repo.available, analysisScore: report.score },
  };
}

// ---- 2) Image SEO (vision) ---------------------------------------------------

export type ImageSeoResult = {
  altText: string;
  imageTitle: string;
  caption: string;
  description: string;
  fileName: string;
};

export async function aiGenerateImageSeo(input: {
  imageUrl: string;
  context?: string;
}): Promise<{ ok: true; data: ImageSeoResult } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  if (!isClaudeConfigured()) return { ok: false, error: "Claude is not configured (ANTHROPIC_API_KEY)." };
  if (!input.imageUrl) return { ok: false, error: "No image URL provided." };

  const vision = await callClaudeVision({
    imageUrl: input.imageUrl,
    system: BRAND_SYSTEM,
    prompt: [
      "Analyze this image and write SEO + accessibility metadata for it.",
      input.context ? `Page context: ${input.context}` : "",
      "Return ONLY a JSON object with this shape (no markdown):",
      `{"altText": string (concise, 8-16 words, describes the image for screen readers & SEO), "imageTitle": string (short), "caption": string (one sentence), "description": string (1-2 sentences), "fileName": string (kebab-case, no extension)}`,
    ]
      .filter(Boolean)
      .join("\n"),
    maxTokens: 800,
  });
  if (!vision.ok) return { ok: false, error: vision.error };

  // Reuse the tolerant JSON path via a tiny re-parse.
  const parsed = await callClaudeJSON<ImageSeoResult>({
    prompt: `Return this as strict JSON only:\n${vision.text}`,
    schemaHint: `{"altText":string,"imageTitle":string,"caption":string,"description":string,"fileName":string}`,
    maxTokens: 600,
  });
  if (!parsed.ok) return { ok: false, error: parsed.error };

  await record(auth.supabase, auth.user.id, auth.user.email, "image-seo", { imageUrl: input.imageUrl }, parsed.data);
  return { ok: true, data: parsed.data };
}

// ---- 3) Keyword research -----------------------------------------------------

export async function aiKeywordResearch(input: {
  seed: string;
  country?: string;
}): Promise<{ ok: true; data: KeywordResearch; aiAugmented: boolean } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  const seed = (input.seed || "").trim();
  if (!seed) return { ok: false, error: "Enter a seed keyword." };

  const data = await keywordResearch(seed, input.country);

  // If no live provider, let Claude propose keyword ideas (clearly estimated).
  let aiAugmented = false;
  if (!data.configured && isClaudeConfigured()) {
    const res = await callClaudeJSON<{
      related: string[];
      longTail: string[];
      questions: string[];
      intent: string;
    }>({
      system: BRAND_SYSTEM,
      prompt: `Suggest keyword ideas around the seed "${seed}" for a Salem, India digital-marketing/AI-automation business. Country: ${input.country || "IN"}.`,
      schemaHint: `{"related": string[12], "longTail": string[12], "questions": string[8], "intent": "informational|commercial|transactional|navigational"}`,
      maxTokens: 1200,
    });
    if (res.ok) {
      aiAugmented = true;
      data.related = res.data.related.map((keyword) => ({ keyword, volume: null, difficulty: null, cpc: null, competition: null, intent: "unknown" as const }));
      data.longTail = res.data.longTail.map((keyword) => ({ keyword, volume: null, difficulty: null, cpc: null, competition: null, intent: "unknown" as const }));
      data.questions = res.data.questions;
      data.note = (data.note ? data.note + " " : "") + "Ideas below are AI estimates (no live provider connected).";
    }
  }

  await record(auth.supabase, auth.user.id, auth.user.email, "keyword-research", { seed, country: input.country }, data);
  return { ok: true, data, aiAugmented };
}

// ---- 3b) Import keyword data pasted from Ubersuggest ------------------------

export async function aiKeywordImport(input: {
  paste: string;
  seed?: string;
  country?: string;
}): Promise<{ ok: true; data: KeywordResearch; brief: string[] } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  if (!input.paste.trim()) return { ok: false, error: "Paste some keyword rows copied from Ubersuggest." };

  const data = parseKeywordPaste(input.paste, input.seed, input.country);
  if (!data.configured) return { ok: false, error: data.note || "Could not read the pasted data." };

  // Turn the real numbers into an actionable content brief.
  let brief: string[] = [];
  if (isClaudeConfigured()) {
    const res = await callClaudeJSON<{ brief: string[] }>({
      system: BRAND_SYSTEM,
      prompt: `These are REAL keyword metrics from Ubersuggest. Give a concise, prioritized content brief: which keyword to target as primary, which to use as H2/secondary, suggested title angle, and content type — based on the volume/difficulty/intent.\n\n${keywordResearchToContext(data)}`,
      schemaHint: `{"brief": string[] (5-8 short, concrete points)}`,
      maxTokens: 1000,
    });
    if (res.ok) brief = res.data.brief;
  }

  await record(auth.supabase, auth.user.id, auth.user.email, "keyword-import", { seed: input.seed }, { count: data.related.length + data.longTail.length + 1 });
  return { ok: true, data, brief };
}

// ---- 4) Analyze a page (engine + Claude recommendations) ---------------------

export async function aiAnalyze(input: {
  url?: string;
  title?: string;
  metaDescription?: string;
  contentHtml?: string;
  canonical?: string;
  robots?: string;
  schemaJson?: string;
  withRecommendations?: boolean;
}): Promise<
  | { ok: true; report: SeoReport; recommendations: string[] }
  | { ok: false; error: string }
> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  let report: SeoReport;
  if (input.url) {
    const r = await fetchAndAnalyzeUrl(input.url);
    if (!r.ok) return { ok: false, error: r.error };
    report = r.report;
  } else {
    report = analyzeSignals(signalsFromContent(input));
  }

  let recommendations: string[] = [];
  if (input.withRecommendations !== false && isClaudeConfigured()) {
    const res = await callClaudeJSON<{ recommendations: string[] }>({
      system: BRAND_SYSTEM,
      prompt: `Given this SEO analysis, list the highest-impact, specific fixes in priority order.\n\n${reportToPrompt(report)}`,
      schemaHint: `{"recommendations": string[] (max 10, each one concrete action)}`,
      maxTokens: 1200,
    });
    if (res.ok) recommendations = res.data.recommendations;
  }

  await record(auth.supabase, auth.user.id, auth.user.email, "analyze", { url: input.url, title: input.title }, { score: report.score });
  return { ok: true, report, recommendations };
}

// ---- 4b) Full-site SEO audit (native engine, no API key needed) -------------

export type AuditPage = { url: string; score: number; issues: string[]; ok: boolean };
export type SiteAudit = {
  base: string;
  pagesAnalyzed: number;
  totalFound: number;
  overallScore: number;
  issueCounts: { title: string; count: number }[];
  pages: AuditPage[];
  note?: string;
};

// Collect page URLs to audit: prefer the website's sitemap.xml, fall back to a
// few known routes if it isn't reachable.
async function collectAuditUrls(base: string, limit: number): Promise<{ urls: string[]; total: number; via: string }> {
  const root = base.replace(/\/$/, "");
  try {
    const res = await fetch(`${root}/sitemap.xml`, { cache: "no-store" });
    if (res.ok) {
      const xml = await res.text();
      const locs = Array.from(xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)).map((m) => m[1].trim());
      const uniq = Array.from(new Set(locs));
      if (uniq.length) return { urls: uniq.slice(0, limit), total: uniq.length, via: "sitemap.xml" };
    }
  } catch {
    /* fall through to known routes */
  }
  const fallback = ["/", "/about/", "/services/", "/blog/", "/contact/", "/jhb-automation-tools/"].map((p) => root + p);
  return { urls: fallback.slice(0, limit), total: fallback.length, via: "known routes (sitemap not reachable)" };
}

export async function aiSiteAudit(input: {
  limit?: number;
}): Promise<{ ok: true; audit: SiteAudit } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const base = WEBSITE_URL;
  const limit = Math.min(50, Math.max(1, input.limit || 20));
  const { urls, total, via } = await collectAuditUrls(base, limit);
  if (urls.length === 0) return { ok: false, error: `No pages found to audit at ${base}.` };

  const pages: AuditPage[] = [];
  const counts = new Map<string, number>();
  const CHUNK = 5; // limit concurrency so we don't hammer the site

  for (let i = 0; i < urls.length; i += CHUNK) {
    const batch = urls.slice(i, i + CHUNK);
    const settled = await Promise.all(
      batch.map(async (u) => ({ u, r: await fetchAndAnalyzeUrl(u) }))
    );
    for (const { u, r } of settled) {
      if (!r.ok) {
        pages.push({ url: u, score: 0, issues: [`Could not fetch: ${r.error}`], ok: false });
        continue;
      }
      const bad = r.report.findings.filter((f) => f.severity === "critical" || f.severity === "warning");
      for (const f of bad) counts.set(f.title, (counts.get(f.title) ?? 0) + 1);
      pages.push({ url: u, score: r.report.score, issues: bad.slice(0, 6).map((f) => f.title), ok: true });
    }
  }

  pages.sort((a, b) => a.score - b.score); // worst first
  const scored = pages.filter((p) => p.ok);
  const overall = scored.length ? Math.round(scored.reduce((s, p) => s + p.score, 0) / scored.length) : 0;
  const issueCounts = Array.from(counts.entries())
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count);

  const note =
    total > urls.length
      ? `Scanned the first ${urls.length} of ${total} pages (cap ${limit}) via ${via}. Raise the limit to scan more.`
      : `Scanned ${urls.length} page${urls.length === 1 ? "" : "s"} via ${via}.`;

  await record(auth.supabase, auth.user.id, auth.user.email, "site-audit", { base, limit }, { overall, pages: pages.length });
  return { ok: true, audit: { base, pagesAnalyzed: pages.length, totalFound: total, overallScore: overall, issueCounts, pages, note } };
}

// ---- 5) Blog writer ----------------------------------------------------------

export type BlogResult = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  h1: string;
  outline: { h2: string; h3: string[] }[];
  contentHtml: string;
  faqs: { question: string; answer: string }[];
  schemaJsonLd: string;
  cta: string;
  internalLinks: { anchor: string; href: string }[];
};

export async function aiGenerateBlog(input: {
  topic: string;
  primaryKeyword: string;
  location?: string;
}): Promise<{ ok: true; data: BlogResult; keywordSource: string } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  if (!isClaudeConfigured()) return { ok: false, error: "Claude is not configured (ANTHROPIC_API_KEY)." };
  if (!input.topic.trim()) return { ok: false, error: "Enter a topic." };

  const keywords = await keywordResearch(input.primaryKeyword || input.topic, input.location);
  const res = await callClaudeJSON<BlogResult>({
    system: BRAND_SYSTEM,
    prompt: [
      `Write a complete, SEO-optimized blog article.`,
      `Topic: ${input.topic}`,
      `Primary keyword: ${input.primaryKeyword}`,
      input.location ? `Target location: ${input.location}` : "",
      keywordResearchToContext(keywords),
      "contentHtml must be clean semantic HTML (h2/h3/p/ul/strong/a) — no <html>/<body> wrapper, no inline styles. 900-1400 words. Include the primary keyword naturally in the H1, first paragraph and a couple of H2s. Add 3-5 FAQs and valid FAQPage + Article JSON-LD as a string.",
    ]
      .filter(Boolean)
      .join("\n\n"),
    schemaHint: `{
      "title": string, "metaTitle": string (<=60), "metaDescription": string (<=160), "slug": string,
      "h1": string, "outline": [{"h2": string, "h3": string[]}],
      "contentHtml": string, "faqs": [{"question": string, "answer": string}],
      "schemaJsonLd": string, "cta": string, "internalLinks": [{"anchor": string, "href": string}]
    }`,
    maxTokens: 8000,
  });
  if (!res.ok) return { ok: false, error: res.error };

  await record(auth.supabase, auth.user.id, auth.user.email, "blog-writer", input, { title: res.data.title, slug: res.data.slug });
  return { ok: true, data: res.data, keywordSource: keywords.source };
}

// ---- 6) FAQ generator --------------------------------------------------------

export async function aiGenerateFaqs(input: {
  topic: string;
  contentHtml?: string;
  count?: number;
}): Promise<{ ok: true; faqs: { question: string; answer: string }[] } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  if (!isClaudeConfigured()) return { ok: false, error: "Claude is not configured (ANTHROPIC_API_KEY)." };

  const n = Math.min(12, Math.max(3, input.count || 6));
  const res = await callClaudeJSON<{ faqs: { question: string; answer: string }[] }>({
    system: BRAND_SYSTEM,
    prompt: [
      `Generate ${n} genuinely useful FAQs about: ${input.topic}.`,
      input.contentHtml ? `Base them on this content:\n${input.contentHtml.slice(0, 4000)}` : "",
      "Answers may use light HTML (<a>, <strong>, <ul>). Match real search questions (People Also Ask style).",
    ].filter(Boolean).join("\n\n"),
    schemaHint: `{"faqs": [{"question": string, "answer": string}]}`,
    maxTokens: 2500,
  });
  if (!res.ok) return { ok: false, error: res.error };
  await record(auth.supabase, auth.user.id, auth.user.email, "faq-generator", input, { count: res.data.faqs.length });
  return { ok: true, faqs: res.data.faqs };
}

// ---- 7) Schema generator -----------------------------------------------------

export async function aiGenerateSchema(input: {
  type: string;
  details: string;
  url?: string;
}): Promise<{ ok: true; schemaJsonLd: string } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  if (!isClaudeConfigured()) return { ok: false, error: "Claude is not configured (ANTHROPIC_API_KEY)." };

  const res = await callClaude({
    system: BRAND_SYSTEM,
    prompt: [
      `Produce valid Schema.org JSON-LD of @type "${input.type}".`,
      input.url ? `Page URL: ${input.url}` : "",
      `Details:\n${input.details}`,
      "Return ONLY the JSON-LD object (no markdown, no commentary). Must parse as JSON.",
    ].filter(Boolean).join("\n"),
    maxTokens: 1500,
  });
  if (!res.ok) return { ok: false, error: res.error };
  const cleaned = res.text.replace(/```(?:json)?/gi, "").trim();
  try {
    JSON.parse(cleaned);
  } catch {
    return { ok: false, error: "Model returned invalid JSON-LD. Try again." };
  }
  await record(auth.supabase, auth.user.id, auth.user.email, "schema-generator", input, { type: input.type });
  return { ok: true, schemaJsonLd: cleaned };
}

// ---- 8) Generic content generator -------------------------------------------

export async function aiGenerateContent(input: {
  kind: string; // "hero" | "section" | "service" | "product" | "cta" | "benefits" | "features" | "process" | "testimonials"
  brief: string;
  keyword?: string;
}): Promise<{ ok: true; html: string } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  if (!isClaudeConfigured()) return { ok: false, error: "Claude is not configured (ANTHROPIC_API_KEY)." };
  if (!input.brief.trim()) return { ok: false, error: "Enter a brief." };

  const res = await callClaude({
    system: BRAND_SYSTEM,
    prompt: [
      `Write "${input.kind}" content.`,
      input.keyword ? `Primary keyword to weave in naturally: ${input.keyword}` : "",
      `Brief: ${input.brief}`,
      "Return clean semantic HTML only (no <html>/<body>, no inline styles). Keep it conversion-focused and on-brand.",
    ].filter(Boolean).join("\n"),
    maxTokens: 2000,
  });
  if (!res.ok) return { ok: false, error: res.error };
  await record(auth.supabase, auth.user.id, auth.user.email, "content-generator", input, { kind: input.kind });
  return { ok: true, html: res.text.replace(/```(?:html)?/gi, "").trim() };
}

// ---- 9) Improve existing content --------------------------------------------

export async function aiImproveContent(input: {
  contentHtml: string;
  keyword?: string;
}): Promise<{ ok: true; html: string } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  if (!isClaudeConfigured()) return { ok: false, error: "Claude is not configured (ANTHROPIC_API_KEY)." };
  if (!input.contentHtml?.trim()) return { ok: false, error: "There's no content to improve on this page yet." };

  const res = await callClaude({
    system: BRAND_SYSTEM,
    prompt: `Improve this content for clarity, readability, structure and SEO. Keep the meaning and the brand voice.${input.keyword ? ` Keep the keyword "${input.keyword}" prominent.` : ""}\n\nReturn clean semantic HTML only (no <html>/<body>, no inline styles).\n\nContent:\n${input.contentHtml.slice(0, 6000)}`,
    maxTokens: 3500,
  });
  if (!res.ok) return { ok: false, error: res.error };
  await record(auth.supabase, auth.user.id, auth.user.email, "improve-content", { keyword: input.keyword }, { len: res.text.length });
  return { ok: true, html: res.text.replace(/```(?:html)?/gi, "").trim() };
}

// ---- 10) Optimize keywords ---------------------------------------------------

export async function aiOptimizeKeywords(input: {
  route?: string;
  title?: string;
  contentHtml?: string;
  focusKeyword?: string;
  country?: string;
}): Promise<
  | { ok: true; focusKeyword: string; secondaryKeywords: string[]; metaKeywords: string }
  | { ok: false; error: string }
> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  if (!isClaudeConfigured()) return { ok: false, error: "Claude is not configured (ANTHROPIC_API_KEY)." };

  const kw = await keywordResearch((input.focusKeyword || input.title || input.route || "").trim(), input.country);
  const res = await callClaudeJSON<{ focusKeyword: string; secondaryKeywords: string[]; metaKeywords: string }>({
    system: BRAND_SYSTEM,
    prompt: `Recommend the optimal focus keyword and secondary keywords for this page.${input.title ? ` Title: ${input.title}.` : ""}\n${input.contentHtml ? `Content:\n${input.contentHtml.slice(0, 3000)}\n` : ""}\n${keywordResearchToContext(kw)}`,
    schemaHint: `{"focusKeyword":string,"secondaryKeywords":string[],"metaKeywords":string}`,
    maxTokens: 800,
  });
  if (!res.ok) return { ok: false, error: res.error };
  await record(auth.supabase, auth.user.id, auth.user.email, "optimize-keywords", { title: input.title }, res.data);
  return { ok: true, ...res.data };
}

// ---- 11) Suggest internal links ---------------------------------------------

export async function aiSuggestInternalLinks(input: {
  route?: string;
  title?: string;
  contentHtml?: string;
}): Promise<{ ok: true; internalLinks: { anchor: string; href: string; reason: string }[] } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  if (!isClaudeConfigured()) return { ok: false, error: "Claude is not configured (ANTHROPIC_API_KEY)." };

  const repo = await getRepoContext(input.route || "/");
  const res = await callClaudeJSON<{ internalLinks: { anchor: string; href: string; reason: string }[] }>({
    system: BRAND_SYSTEM,
    prompt: `Suggest internal links FROM this page to other pages on the same site (plausible site paths, natural anchors).${input.title ? ` Title: ${input.title}.` : ""}\n${input.contentHtml ? `Content:\n${input.contentHtml.slice(0, 3000)}\n` : ""}\n${repoContextToPrompt(repo)}`,
    schemaHint: `{"internalLinks":[{"anchor":string,"href":string,"reason":string}]}`,
    maxTokens: 1200,
  });
  if (!res.ok) return { ok: false, error: res.error };
  await record(auth.supabase, auth.user.id, auth.user.email, "internal-links", { route: input.route }, { count: res.data.internalLinks.length });
  return { ok: true, internalLinks: res.data.internalLinks };
}
