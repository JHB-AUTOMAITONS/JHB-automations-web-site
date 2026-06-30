"use client";

import { useEffect, useState } from "react";
import { buildPrompt, aiGeneratePageSeo, aiAutoEnabled, type PageSeoResult } from "@/app/ai-seo/actions";
import ResultView from "./ResultView";
import CopyButton from "./CopyButton";

const CLAUDE_URL = "https://claude.ai/new";

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : text).trim();
  try {
    return JSON.parse(candidate);
  } catch {
    /* fall through */
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

// Manual-mode "✨ Generate SEO with AI": builds the full prompt (CMS + repo +
// keyword + analysis), you run it in claude.ai (your subscription), paste the
// reply back, review, and apply the supported fields. No API key, nothing saved
// automatically — the host editor's Save/Publish stays in control.
export default function GenerateSeoButton({
  route,
  getContext,
  onApply,
  label = "✨ Generate SEO with AI",
}: {
  route: string;
  getContext: () => { title?: string; contentHtml?: string; focusKeyword?: string; country?: string };
  onApply: (r: PageSeoResult) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [result, setResult] = useState<PageSeoResult | null>(null);

  const [autoReady, setAutoReady] = useState(false);
  useEffect(() => {
    let alive = true;
    aiAutoEnabled().then((v) => alive && setAutoReady(v)).catch(() => {});
    return () => { alive = false; };
  }, []);

  const start = async () => {
    setOpen(true); setBusy(true); setError(""); setPrompt(null); setReply(""); setResult(null);
    const ctx = getContext();
    try {
      if (autoReady) {
        // One-click auto-fetch: call Claude directly and show suggestions.
        const res = await aiGeneratePageSeo({
          route,
          title: ctx.title,
          contentHtml: ctx.contentHtml,
          focusKeyword: ctx.focusKeyword,
          country: ctx.country,
        });
        if (res.ok) setResult(res.data);
        else setError(res.error || "Generation failed.");
      } else {
        // Manual: build the prompt to run in claude.ai.
        const res = await buildPrompt("page-seo", {
          route,
          title: ctx.title ?? "",
          contentHtml: ctx.contentHtml ?? "",
          focusKeyword: ctx.focusKeyword ?? "",
          country: ctx.country ?? "",
        });
        if (res.ok) setPrompt(res.prompt);
        else setError(res.error || "Could not build the prompt.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const parse = () => {
    setError("");
    if (!reply.trim()) return setError("Paste Claude's reply first.");
    try {
      setResult(extractJson(reply) as PageSeoResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not parse the reply.");
    }
  };

  const close = () => {
    setOpen(false); setPrompt(null); setReply(""); setResult(null); setError("");
  };

  return (
    <>
      <button
        type="button"
        onClick={start}
        className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
      >
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8" onClick={close}>
          <div className="my-4 w-full max-w-2xl rounded-2xl border border-ink/10 bg-base p-6 shadow-soft-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold">Generate SEO with AI {autoReady ? "" : "(manual)"}</h2>
              <button onClick={close} className="rounded-lg border border-ink/10 px-2 py-1 text-xs text-muted hover:text-ink">Close</button>
            </div>

            {busy && <p className="mt-4 text-sm text-muted">{autoReady ? "Analyzing & generating…" : "Building prompt…"}</p>}
            {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

            {/* Step 1+2: prompt + paste */}
            {prompt && !result && (
              <div className="mt-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Step 1 · Copy &amp; run in Claude</h3>
                  <div className="flex gap-2">
                    <CopyButton text={prompt} label="Copy prompt" />
                    <a href={CLAUDE_URL} target="_blank" rel="noopener noreferrer" className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/15">Open Claude ↗</a>
                  </div>
                </div>
                <pre className="mt-2 max-h-52 overflow-auto rounded-lg border border-ink/10 bg-surface p-3 text-[11px] leading-relaxed whitespace-pre-wrap break-words">{prompt}</pre>

                <h3 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Step 2 · Paste Claude’s reply</h3>
                <textarea
                  rows={6}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Paste Claude’s full JSON answer here…"
                  className="mt-2 w-full resize-y rounded-xl border border-ink/10 bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button onClick={parse} className="btn btn-primary mt-3 !px-4 !py-2 !text-sm">③ Review suggestions</button>
              </div>
            )}

            {/* Step 3: review + apply */}
            {result && (
              <>
                <div className="mt-4"><ResultView data={result as unknown as Record<string, unknown>} /></div>
                <div className="mt-5 flex items-center justify-end gap-2 border-t border-ink/10 pt-4">
                  <button onClick={() => setResult(null)} className="btn btn-ghost !px-4 !py-2 !text-sm">← Back</button>
                  <button onClick={() => { onApply(result); close(); }} className="btn btn-primary !px-4 !py-2 !text-sm">Apply to form</button>
                </div>
                <p className="mt-2 text-right text-[11px] text-muted">Applies the fields this editor supports. Review, then Save / Publish.</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
