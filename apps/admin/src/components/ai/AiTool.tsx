"use client";

import { useEffect, useState } from "react";
import ResultView from "./ResultView";
import CopyButton from "./CopyButton";
import { aiAutoEnabled } from "@/app/ai-seo/actions";

export type AiField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string;
  required?: boolean;
  help?: string;
};

type RunResult = { ok: boolean; error?: string } & Record<string, unknown>;
type BuiltPrompt = { ok: boolean; prompt?: string; error?: string; note?: string };

// Tolerant client-side JSON extraction from a pasted claude.ai reply.
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
  throw new Error("Couldn't read JSON from the pasted reply — copy Claude's full answer (including the { } ).");
}

const CLAUDE_URL = "https://claude.ai/new";

export default function AiTool({
  title,
  description,
  fields,
  run,
  buildPrompt,
  responseFormat = "json",
  submitLabel = "✨ Generate with AI",
}: {
  title: string;
  description?: string;
  fields: AiField[];
  run?: (values: Record<string, string>) => Promise<RunResult>;
  buildPrompt?: (values: Record<string, string>) => Promise<BuiltPrompt>;
  responseFormat?: "json" | "text";
  submitLabel?: string;
}) {
  const init: Record<string, string> = {};
  for (const f of fields) init[f.name] = f.defaultValue ?? "";
  const [values, setValues] = useState<Record<string, string>>(init);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);

  // Manual-mode state
  const [prompt, setPrompt] = useState<string | null>(null);
  const [promptNote, setPromptNote] = useState<string>("");
  const [reply, setReply] = useState("");

  // Auto when an API key is present (one-click); otherwise manual copy-paste.
  // Until the check resolves we assume manual so nothing one-click-fires early.
  const [autoReady, setAutoReady] = useState(false);
  useEffect(() => {
    let alive = true;
    aiAutoEnabled().then((v) => alive && setAutoReady(v)).catch(() => {});
    return () => { alive = false; };
  }, []);

  // Manual only when there's no API key AND a prompt builder is available.
  // (Tools with only `run` — e.g. Keyword Research, Analyzer — always run directly.)
  const manual = !autoReady && Boolean(buildPrompt);
  const set = (name: string, v: string) => setValues((p) => ({ ...p, [name]: v }));
  const checkRequired = () => fields.find((f) => f.required && !values[f.name]?.trim());

  // ---- auto mode ----
  const submitAuto = async () => {
    if (!run) return setError("Automatic mode needs an API key. Add ANTHROPIC_API_KEY, or use manual mode.");
    const missing = checkRequired();
    if (missing) return setError(`${missing.label} is required.`);
    setBusy(true); setError(""); setResult(null);
    try {
      const res = await run(values);
      if (res.ok) setResult(res);
      else setError(res.error || "Generation failed.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  // ---- manual mode ----
  const doBuild = async () => {
    const missing = checkRequired();
    if (missing) return setError(`${missing.label} is required.`);
    setBusy(true); setError(""); setResult(null); setPrompt(null); setReply("");
    try {
      const res = await buildPrompt!(values);
      if (res.ok && res.prompt) {
        setPrompt(res.prompt);
        setPromptNote(res.note || "");
      } else setError(res.error || "Could not build the prompt.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const parseReply = () => {
    setError("");
    if (!reply.trim()) return setError("Paste Claude's reply first.");
    if (responseFormat === "text") {
      setResult({ ok: true, output: reply.replace(/```(?:html)?/gi, "").trim() });
      return;
    }
    try {
      const data = extractJson(reply) as Record<string, unknown>;
      setResult({ ok: true, ...data });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not parse the reply.");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
      {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      {manual && (
        <p className="mt-2 inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Manual mode — uses your claude.ai subscription (no API key needed)
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
        {/* inputs */}
        <div className="space-y-4 rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft lg:sticky lg:top-6 lg:h-fit">
          {fields.map((f) => (
            <label key={f.name} className="block">
              <span className="mb-1 block text-xs font-medium text-muted">
                {f.label}
                {f.required && <span className="text-red-500"> *</span>}
              </span>
              {f.type === "textarea" ? (
                <textarea rows={5} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} className="w-full resize-y rounded-xl border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary" />
              ) : f.type === "select" ? (
                <select value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} className="w-full rounded-xl border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary">
                  {(f.options ?? []).map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              ) : (
                <input value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} className="w-full rounded-xl border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary" />
              )}
              {f.help && <span className="mt-1 block text-[11px] text-muted">{f.help}</span>}
            </label>
          ))}

          <button
            type="button"
            onClick={manual ? doBuild : submitAuto}
            disabled={busy}
            className="btn btn-primary w-full !py-2.5 !text-sm disabled:opacity-60"
          >
            {busy ? "Working…" : manual ? "① Build prompt" : submitLabel}
          </button>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* output */}
        <div className="min-w-0 space-y-4">
          {/* manual: prompt to copy */}
          {manual && prompt && !result && (
            <div className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Step 1 · Copy this prompt</h3>
                <div className="flex gap-2">
                  <CopyButton text={prompt} label="Copy prompt" />
                  <a href={CLAUDE_URL} target="_blank" rel="noopener noreferrer" className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/15">Open Claude ↗</a>
                </div>
              </div>
              {promptNote && <p className="mt-1 text-[11px] text-amber-700">{promptNote}</p>}
              <pre className="mt-2 max-h-56 overflow-auto rounded-lg border border-ink/10 bg-base p-3 text-[11px] leading-relaxed whitespace-pre-wrap break-words">{prompt}</pre>

              <h3 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Step 2 · Paste Claude’s reply</h3>
              <textarea
                rows={6}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Paste Claude’s full answer here…"
                className="mt-2 w-full resize-y rounded-xl border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button type="button" onClick={parseReply} className="btn btn-primary mt-3 !py-2 !text-sm">③ Show result</button>
            </div>
          )}

          {busy && (
            <div className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-surface p-6 text-sm text-muted shadow-soft">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Working…
            </div>
          )}
          {!busy && !result && !prompt && !error && (
            <div className="rounded-2xl border border-dashed border-ink/15 p-10 text-center text-sm text-muted">
              {manual ? "Fill the form and click “Build prompt”." : "Fill in the form and run the assistant — results appear here."}
            </div>
          )}
          {result && (
            <div>
              {manual && (
                <button type="button" onClick={() => { setResult(null); }} className="mb-3 text-xs font-medium text-muted hover:text-primary">← Back to prompt / reply</button>
              )}
              <ResultView data={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
