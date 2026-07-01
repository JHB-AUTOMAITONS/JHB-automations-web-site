import "server-only";

// Pluggable SEO data connector.
//
// Ubersuggest has no official public API, so this is provider-agnostic: point it
// at whatever keyword/SERP API you actually have (DataForSEO, SerpApi, SE Ranking,
// Keywords Everywhere, a self-hosted Ubersuggest scraper, etc.) via env, and map
// that provider's response in `fetchFromProvider` below.
//
// Env:
//   SEO_CONNECTOR_BASE_URL  — provider endpoint that accepts ?keyword=...&country=...
//   SEO_CONNECTOR_API_KEY   — bearer token / api key (sent as Authorization header)
//   SEO_CONNECTOR_COUNTRY   — default ISO country (e.g. "IN"); optional.
//
// When unconfigured, every call returns { configured:false } and the AI layer
// falls back to Claude's own estimates — clearly labelled as estimates in the UI.

export type SearchIntent = "informational" | "navigational" | "commercial" | "transactional" | "unknown";

export type KeywordMetric = {
  keyword: string;
  volume: number | null; // monthly searches
  difficulty: number | null; // 0-100
  cpc: number | null; // USD
  competition: number | null; // 0-1 (paid competition)
  intent: SearchIntent;
};

export type KeywordResearch = {
  configured: boolean;
  source: string; // provider name or "unconfigured"
  seed: string;
  country: string;
  primary: KeywordMetric | null;
  related: KeywordMetric[];
  longTail: KeywordMetric[];
  questions: string[];
  trending: string[];
  competitors: string[];
  note?: string;
};

export function isSeoConnectorConfigured(): boolean {
  return Boolean(process.env.SEO_CONNECTOR_BASE_URL);
}

const DEFAULT_COUNTRY = process.env.SEO_CONNECTOR_COUNTRY || "IN";

function emptyResearch(seed: string, country: string, note: string): KeywordResearch {
  return {
    configured: false,
    source: "unconfigured",
    seed,
    country,
    primary: null,
    related: [],
    longTail: [],
    questions: [],
    trending: [],
    competitors: [],
    note,
  };
}

// Normalize an arbitrary provider payload into our KeywordResearch shape. Adjust
// the field mapping here to match your provider once you wire one up.
function mapProviderPayload(seed: string, country: string, raw: unknown): KeywordResearch {
  const r = (raw ?? {}) as Record<string, unknown>;
  const asMetric = (x: unknown): KeywordMetric => {
    const o = (x ?? {}) as Record<string, unknown>;
    return {
      keyword: String(o.keyword ?? o.term ?? o.text ?? ""),
      volume: numOrNull(o.volume ?? o.search_volume ?? o.vol),
      difficulty: numOrNull(o.difficulty ?? o.kd ?? o.seo_difficulty),
      cpc: numOrNull(o.cpc ?? o.cost_per_click),
      competition: numOrNull(o.competition ?? o.comp),
      intent: normIntent(o.intent),
    };
  };
  const list = (k: string): KeywordMetric[] =>
    Array.isArray(r[k]) ? (r[k] as unknown[]).map(asMetric).filter((m) => m.keyword) : [];

  return {
    configured: true,
    source: String(r.source ?? process.env.SEO_CONNECTOR_NAME ?? "seo-connector"),
    seed,
    country,
    primary: r.primary ? asMetric(r.primary) : asMetric({ keyword: seed, ...r }),
    related: list("related").length ? list("related") : list("keywords"),
    longTail: list("longTail").length ? list("longTail") : list("long_tail"),
    questions: strList(r.questions),
    trending: strList(r.trending),
    competitors: strList(r.competitors),
  };
}

export async function keywordResearch(seed: string, country = DEFAULT_COUNTRY): Promise<KeywordResearch> {
  const clean = (seed || "").trim();
  if (!clean) return emptyResearch(clean, country, "Enter a seed keyword.");
  const base = process.env.SEO_CONNECTOR_BASE_URL;
  if (!base) {
    return emptyResearch(
      clean,
      country,
      "SEO Connector not configured. Set SEO_CONNECTOR_BASE_URL (and SEO_CONNECTOR_API_KEY) to use live keyword data; until then Claude estimates these values."
    );
  }
  try {
    const url = new URL(base);
    url.searchParams.set("keyword", clean);
    url.searchParams.set("country", country);
    const res = await fetch(url.toString(), {
      headers: {
        "content-type": "application/json",
        ...(process.env.SEO_CONNECTOR_API_KEY
          ? { authorization: `Bearer ${process.env.SEO_CONNECTOR_API_KEY}` }
          : {}),
      },
      cache: "no-store",
    });
    if (!res.ok) {
      return emptyResearch(clean, country, `SEO Connector error: ${res.status} ${res.statusText}.`);
    }
    const raw = await res.json();
    return mapProviderPayload(clean, country, raw);
  } catch (e) {
    return emptyResearch(clean, country, e instanceof Error ? e.message : "SEO Connector request failed.");
  }
}

function numOrNull(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function strList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => (typeof x === "string" ? x : String((x as Record<string, unknown>)?.keyword ?? ""))).filter(Boolean);
}
function normIntent(v: unknown): SearchIntent {
  const s = String(v ?? "").toLowerCase();
  if (s.includes("transac")) return "transactional";
  if (s.includes("commerc")) return "commercial";
  if (s.includes("naviga")) return "navigational";
  if (s.includes("inform")) return "informational";
  return "unknown";
}

// ---- Manual import (paste from Ubersuggest, no API needed) ------------------
//
// Parses keyword data the admin copies out of Ubersuggest — either the
// "Keyword Ideas" table (Keyword / Volume / CPC / SD / PD, tab- or comma-
// separated, with or without a header row) or a single "Summary" line like
// "digital marketing in salem, 50, 27". Free-plan friendly: no API call.

function parseNum(v: string | undefined): number | null {
  if (v == null) return null;
  const cleaned = v.replace(/[$,%₹\s]/g, "").replace(/[kK]$/, "000").replace(/[mM]$/, "000000");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

const HEADER_HINTS = ["keyword", "volume", "cpc", "difficulty", "sd", "pd", "intent"];

export function parseKeywordPaste(text: string, seedHint = "", country = DEFAULT_COUNTRY): KeywordResearch {
  const lines = (text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return emptyResearch(seedHint, country, "Nothing to import.");

  const delim = lines[0].includes("\t") ? "\t" : ",";
  const cells = (l: string) => l.split(delim).map((c) => c.trim());

  // Detect a header row and build a column index map.
  let idx = { keyword: 0, volume: 1, cpc: 2, sd: 3, pd: 4, intent: -1 };
  let start = 0;
  const first = cells(lines[0]).map((c) => c.toLowerCase());
  const looksLikeHeader = first.some((c) => HEADER_HINTS.some((h) => c.includes(h))) && !/\d/.test(lines[0]);
  if (looksLikeHeader) {
    start = 1;
    const find = (...names: string[]) => first.findIndex((c) => names.some((n) => c.includes(n)));
    idx = {
      keyword: Math.max(0, find("keyword", "term")),
      volume: find("volume", "vol"),
      cpc: find("cpc", "cost"),
      sd: find("seo difficulty", "sd", "difficulty"),
      pd: find("paid difficulty", "pd"),
      intent: find("intent"),
    };
  }

  const metrics: KeywordMetric[] = [];
  for (let i = start; i < lines.length; i++) {
    const c = cells(lines[i]);
    const keyword = (c[idx.keyword] ?? "").trim();
    if (!keyword || /^[\d.,$%]+$/.test(keyword)) continue; // skip rows with no real keyword
    metrics.push({
      keyword,
      volume: parseNum(c[idx.volume]),
      difficulty: parseNum(c[idx.sd]) ?? parseNum(c[idx.pd]),
      cpc: parseNum(c[idx.cpc]),
      competition: idx.pd >= 0 ? (parseNum(c[idx.pd]) != null ? (parseNum(c[idx.pd])! / 100) : null) : null,
      intent: idx.intent >= 0 ? normIntent(c[idx.intent]) : "unknown",
    });
  }

  if (metrics.length === 0) return emptyResearch(seedHint, country, "Could not read any keyword rows from the pasted text.");

  const [primary, ...rest] = metrics;
  const longTail = rest.filter((m) => m.keyword.split(/\s+/).length >= 4);
  const related = rest.filter((m) => m.keyword.split(/\s+/).length < 4);

  return {
    configured: true,
    source: "ubersuggest-import",
    seed: seedHint || primary.keyword,
    country,
    primary,
    related,
    longTail,
    questions: [],
    trending: [],
    competitors: [],
    note: `Imported ${metrics.length} keyword${metrics.length === 1 ? "" : "s"} from Ubersuggest.`,
  };
}

// Compact, prompt-friendly summary of keyword data for Claude.
export function keywordResearchToContext(k: KeywordResearch): string {
  if (!k.configured) return `LIVE KEYWORD DATA: unavailable (${k.note}). Estimate metrics conservatively and label them as estimates.`;
  const fmt = (m: KeywordMetric) =>
    `- ${m.keyword} | vol:${m.volume ?? "?"} kd:${m.difficulty ?? "?"} cpc:${m.cpc ?? "?"} intent:${m.intent}`;
  return [
    `LIVE KEYWORD DATA (source: ${k.source}, country: ${k.country})`,
    k.primary ? `Primary:\n${fmt(k.primary)}` : "",
    k.related.length ? `Related:\n${k.related.slice(0, 20).map(fmt).join("\n")}` : "",
    k.longTail.length ? `Long-tail:\n${k.longTail.slice(0, 20).map(fmt).join("\n")}` : "",
    k.questions.length ? `Questions: ${k.questions.slice(0, 15).join("; ")}` : "",
    k.competitors.length ? `Competitors: ${k.competitors.slice(0, 10).join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
