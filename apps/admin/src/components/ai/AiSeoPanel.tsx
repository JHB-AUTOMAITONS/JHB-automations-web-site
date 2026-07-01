"use client";

import { useEffect, useState } from "react";
import {
  aiAutoEnabled,
  aiGeneratePageSeo,
  aiImproveContent,
  aiAnalyze,
  aiGenerateFaqs,
  aiGenerateSchema,
  aiOptimizeKeywords,
  aiSuggestInternalLinks,
  buildPrompt,
} from "@/app/ai-seo/actions";
import ResultView from "./ResultView";
import CopyButton from "./CopyButton";

const CLAUDE_URL = "https://claude.ai/new";

// What an editor hands the panel about the page being edited.
export type AiPageContext = {
  title?: string;
  contentHtml?: string;
  focusKeyword?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  country?: string;
};

// Normalized fields the panel can hand back; the editor applies whatever it has.
export type AiSeoPatch = {
  seoTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  schemaJsonLd?: string;
  contentHtml?: string;
  faqs?: { question: string; answer: string }[];
  internalLinks?: { anchor: string; href: string; reason?: string }[];
};

type Json = Record<string, unknown>;
type ActionDef = {
  key: string;
  label: string;
  icon: string;
  manualKind?: string; // buildPrompt kind for manual mode
  format: "json" | "text"; // how to parse a manual reply
  native?: boolean; // runs without a key (Analyze) → always uses auto()
  auto: (ctx: AiPageContext, route: string) => Promise<{ ok: boolean; error?: string } & Json>;
  toPatch?: (res: Json) => AiSeoPatch; // when present, an "Apply to form" button appears
};

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : text).trim();
  try {
    return JSON.parse(candidate);
  } catch {
    /* balanced fallback */
  }
  const start = candidate.search(/[[{]/);
  if (start >= 0) {
    const open = candidate[start];
    const close = open === "{" ? "}" : "]";
    let depth = 0;
    for (let i = start; i < candidate.length; i++) {
      if (candidate[i] === open) depth++;
      else if (candidate[i] === close) {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(candidate.slice(start, i + 1));
          } catch {
            break;
          }
        }
      }
    }
  }
  throw new Error("Couldn't read JSON from the pasted reply — copy Claude's full answer including the { }.");
}

const ALL_ACTIONS: ActionDef[] = [
  {
    key: "seo", label: "Generate SEO", icon: "✨", manualKind: "page-seo", format: "json",
    auto: (ctx, route) => aiGeneratePageSeo({ route, title: ctx.title, contentHtml: ctx.contentHtml, focusKeyword: ctx.focusKeyword, country: ctx.country }).then((r) => (r.ok ? { ok: true, ...r.data } : r)),
    toPatch: (r) => ({
      seoTitle: r.seoTitle as string, metaDescription: r.metaDescription as string, metaKeywords: r.metaKeywords as string,
      focusKeyword: r.focusKeyword as string, secondaryKeywords: r.secondaryKeywords as string[], canonical: r.canonical as string,
      ogTitle: r.ogTitle as string, ogDescription: r.ogDescription as string, twitterTitle: r.twitterTitle as string,
      twitterDescription: r.twitterDescription as string, schemaJsonLd: r.schemaJsonLd as string,
      faqs: r.faqs as AiSeoPatch["faqs"], internalLinks: r.internalLinks as AiSeoPatch["internalLinks"],
    }),
  },
  {
    key: "improve", label: "Improve Content", icon: "✍️", manualKind: "improve", format: "text",
    auto: (ctx) => aiImproveContent({ contentHtml: ctx.contentHtml || "", keyword: ctx.focusKeyword }),
    toPatch: (r) => ({ contentHtml: (r.html as string) ?? (r.output as string) }),
  },
  {
    key: "analyze", label: "Analyze SEO", icon: "🔬", format: "json", native: true,
    auto: (ctx, route) => aiAnalyze({ url: ctx.metaDescription ? undefined : undefined, title: ctx.metaTitle || ctx.title, metaDescription: ctx.metaDescription, contentHtml: ctx.contentHtml, withRecommendations: true }).then((r) => (r.ok ? { ok: true, score: r.report.score, findings: r.report.findings, recommendations: r.recommendations } : r)),
  },
  {
    key: "faq", label: "Generate FAQ", icon: "❓", manualKind: "faqs", format: "json",
    auto: (ctx) => aiGenerateFaqs({ topic: ctx.title || "this page", contentHtml: ctx.contentHtml }).then((r) => (r.ok ? { ok: true, faqs: r.faqs } : r)),
    toPatch: (r) => ({ faqs: r.faqs as AiSeoPatch["faqs"] }),
  },
  {
    key: "schema", label: "Generate Schema", icon: "🧷", manualKind: "schema", format: "text",
    auto: (ctx, route) => aiGenerateSchema({ type: "Article", details: `Title: ${ctx.title || ""}\nURL: ${route}\nContent:\n${(ctx.contentHtml || "").slice(0, 2000)}`, url: route }).then((r) => (r.ok ? { ok: true, schemaJsonLd: r.schemaJsonLd } : r)),
    toPatch: (r) => ({ schemaJsonLd: (r.schemaJsonLd as string) ?? (r.output as string) }),
  },
  {
    key: "keywords", label: "Optimize Keywords", icon: "🔑", manualKind: "keywords", format: "json",
    auto: (ctx, route) => aiOptimizeKeywords({ route, title: ctx.title, contentHtml: ctx.contentHtml, focusKeyword: ctx.focusKeyword, country: ctx.country }).then((r) => (r.ok ? { ok: true, focusKeyword: r.focusKeyword, secondaryKeywords: r.secondaryKeywords, metaKeywords: r.metaKeywords } : r)),
    toPatch: (r) => ({ focusKeyword: r.focusKeyword as string, secondaryKeywords: r.secondaryKeywords as string[], metaKeywords: r.metaKeywords as string }),
  },
  {
    key: "links", label: "Suggest Internal Links", icon: "🔗", manualKind: "internal-links", format: "json",
    auto: (ctx, route) => aiSuggestInternalLinks({ route, title: ctx.title, contentHtml: ctx.contentHtml }).then((r) => (r.ok ? { ok: true, internalLinks: r.internalLinks } : r)),
    toPatch: (r) => ({ internalLinks: r.internalLinks as AiSeoPatch["internalLinks"] }),
  },
];

export default function AiSeoPanel({
  route,
  getContext,
  onApply,
  actions,
}: {
  route: string;
  getContext: () => AiPageContext;
  onApply?: (patch: AiSeoPatch) => void;
  actions?: string[]; // optional subset of action keys
}) {
  const list = actions ? ALL_ACTIONS.filter((a) => actions.includes(a.key)) : ALL_ACTIONS;

  const [autoReady, setAutoReady] = useState(false);
  useEffect(() => {
    let alive = true;
    aiAutoEnabled().then((v) => alive && setAutoReady(v)).catch(() => {});
    return () => { alive = false; };
  }, []);

  const [active, setActive] = useState<ActionDef | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [result, setResult] = useState<Json | null>(null);

  const ctxValues = (ctx: AiPageContext): Record<string, string> => ({
    route,
    title: ctx.title ?? "",
    contentHtml: ctx.contentHtml ?? "",
    focusKeyword: ctx.focusKeyword ?? "",
    keyword: ctx.focusKeyword ?? "",
    country: ctx.country ?? "",
    topic: ctx.title ?? "",
    type: "Article",
    details: `Title: ${ctx.title ?? ""}\nURL: ${route}\nContent:\n${(ctx.contentHtml ?? "").slice(0, 2000)}`,
  });

  const open = async (a: ActionDef) => {
    setActive(a); setBusy(true); setError(""); setPrompt(null); setReply(""); setResult(null);
    const ctx = getContext();
    try {
      if (autoReady || a.native) {
        const res = await a.auto(ctx, route);
        if (res.ok) {
          const { ok, ...data } = res;
          void ok;
          setResult(data);
        } else setError(res.error || "Generation failed.");
      } else if (a.manualKind) {
        const res = await buildPrompt(a.manualKind, ctxValues(ctx));
        if (res.ok) setPrompt(res.prompt);
        else setError(res.error || "Could not build the prompt.");
      } else {
        setError("This action needs an API key.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const parse = () => {
    if (!active) return;
    setError("");
    if (!reply.trim()) return setError("Paste Claude's reply first.");
    if (active.format === "text") {
      setResult({ output: reply.replace(/```(?:html)?/gi, "").trim() });
      return;
    }
    try {
      setResult(extractJson(reply) as Json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not parse the reply.");
    }
  };

  const close = () => { setActive(null); setBusy(false); setError(""); setPrompt(null); setReply(""); setResult(null); };

  return (
    <section className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold">
          <span>🤖</span> AI SEO Assistant
        </h2>
        <span className="text-[11px] text-muted">
          {autoReady ? "One-click — reads this page automatically" : "Manual mode — uses your claude.ai subscription"}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {list.map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={() => open(a)}
            className="rounded-lg border border-primary/30 bg-surface px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8" onClick={close}>
          <div className="my-4 w-full max-w-2xl rounded-2xl border border-ink/10 bg-base p-6 shadow-soft-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-lg font-semibold">{active.icon} {active.label}</h3>
              <button onClick={close} className="rounded-lg border border-ink/10 px-2 py-1 text-xs text-muted hover:text-ink">Close</button>
            </div>

            {busy && <p className="mt-4 text-sm text-muted">{autoReady || active.native ? "Analyzing & generating…" : "Building prompt…"}</p>}
            {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

            {/* manual: prompt + paste */}
            {prompt && !result && (
              <div className="mt-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">Step 1 · Copy &amp; run in Claude</h4>
                  <div className="flex gap-2">
                    <CopyButton text={prompt} label="Copy prompt" />
                    <a href={CLAUDE_URL} target="_blank" rel="noopener noreferrer" className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/15">Open Claude ↗</a>
                  </div>
                </div>
                <pre className="mt-2 max-h-52 overflow-auto rounded-lg border border-ink/10 bg-surface p-3 text-[11px] leading-relaxed whitespace-pre-wrap break-words">{prompt}</pre>
                <h4 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Step 2 · Paste Claude’s reply</h4>
                <textarea rows={6} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Paste Claude’s full answer here…" className="mt-2 w-full resize-y rounded-xl border border-ink/10 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
                <button onClick={parse} className="btn btn-primary mt-3 !px-4 !py-2 !text-sm">③ Show result</button>
              </div>
            )}

            {/* result */}
            {result && (
              <>
                <div className="mt-4"><ResultView data={result} /></div>
                {active.toPatch && onApply && (
                  <div className="mt-5 flex items-center justify-end gap-2 border-t border-ink/10 pt-4">
                    <button onClick={close} className="btn btn-ghost !px-4 !py-2 !text-sm">Cancel</button>
                    <button onClick={() => { onApply(active.toPatch!(result)); close(); }} className="btn btn-primary !px-4 !py-2 !text-sm">Apply to form</button>
                  </div>
                )}
                {(!active.toPatch || !onApply) && (
                  <div className="mt-5 flex justify-end border-t border-ink/10 pt-4">
                    <button onClick={close} className="btn btn-ghost !px-4 !py-2 !text-sm">Close</button>
                  </div>
                )}
                {active.toPatch && onApply && (
                  <p className="mt-2 text-right text-[11px] text-muted">Applies the fields this editor supports. Review, then Save / Publish.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
