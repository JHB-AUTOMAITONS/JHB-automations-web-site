import "server-only";

// Secure, server-only Claude client. Talks to the Anthropic Messages API with
// plain fetch (no SDK dependency). The API key lives in server env and is NEVER
// sent to the browser — every caller is a "use server" action.
//
// Required env:
//   ANTHROPIC_API_KEY   — your Anthropic key (secret).
// Optional env:
//   CLAUDE_MODEL        — model id (default: claude-sonnet-4-6).
//   CLAUDE_MAX_TOKENS   — default max output tokens (default: 4096).

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";
const DEFAULT_MAX_TOKENS = Number(process.env.CLAUDE_MAX_TOKENS || 4096);

export function isClaudeConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export type ClaudeResult =
  | { ok: true; text: string; model: string; usage?: { input: number; output: number } }
  | { ok: false; error: string };

type TextBlock = { type: "text"; text: string };
type ImageBlock = { type: "image"; source: { type: "url"; url: string } };
type Block = TextBlock | ImageBlock;
type Msg = { role: "user" | "assistant"; content: string | Block[] };

type CallOpts = {
  system?: string;
  messages?: Msg[];
  prompt?: string; // convenience: single user turn
  model?: string;
  maxTokens?: number;
  temperature?: number;
};

// Low-level call. Returns the concatenated text of all text blocks.
export async function callClaude(opts: CallOpts): Promise<ClaudeResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return { ok: false, error: "Claude is not configured. Set ANTHROPIC_API_KEY on the server." };
  }
  const messages: Msg[] =
    opts.messages ?? (opts.prompt ? [{ role: "user", content: opts.prompt }] : []);
  if (messages.length === 0) return { ok: false, error: "No prompt provided." };

  const body = {
    model: opts.model || DEFAULT_MODEL,
    max_tokens: opts.maxTokens || DEFAULT_MAX_TOKENS,
    ...(opts.system ? { system: opts.system } : {}),
    ...(typeof opts.temperature === "number" ? { temperature: opts.temperature } : {}),
    messages,
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
      // Never cache AI generations.
      cache: "no-store",
    });

    if (!res.ok) {
      let detail = `${res.status} ${res.statusText}`;
      try {
        const j = await res.json();
        detail = j?.error?.message || detail;
      } catch {
        /* ignore parse error */
      }
      return { ok: false, error: `Claude API error: ${detail}` };
    }

    const json = (await res.json()) as {
      content?: { type: string; text?: string }[];
      model?: string;
      usage?: { input_tokens?: number; output_tokens?: number };
    };
    const text = (json.content ?? [])
      .filter((b) => b.type === "text" && typeof b.text === "string")
      .map((b) => b.text as string)
      .join("\n")
      .trim();

    return {
      ok: true,
      text,
      model: json.model || body.model,
      usage: {
        input: json.usage?.input_tokens ?? 0,
        output: json.usage?.output_tokens ?? 0,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error calling Claude." };
  }
}

// Extract a JSON object/array from a model response that may include prose or
// ```json fences. Tolerant by design so a stray sentence doesn't break parsing.
function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : text).trim();
  // Try the whole thing first, then the first {...} / [...] span.
  for (const slice of [candidate, sliceBalanced(candidate)]) {
    if (!slice) continue;
    try {
      return JSON.parse(slice);
    } catch {
      /* try next */
    }
  }
  throw new Error("Model did not return valid JSON.");
}

function sliceBalanced(s: string): string | null {
  const start = s.search(/[[{]/);
  if (start === -1) return null;
  const open = s[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    if (s[i] === open) depth++;
    else if (s[i] === close) {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

export type ClaudeJsonResult<T> =
  | { ok: true; data: T; model: string }
  | { ok: false; error: string };

// Schema-guided JSON generation. Pass a JSON-schema-ish description in `schemaHint`
// (free text) — the system prompt forces strict JSON-only output.
export async function callClaudeJSON<T = unknown>(opts: CallOpts & { schemaHint?: string }): Promise<ClaudeJsonResult<T>> {
  const system = [
    opts.system || "",
    "You are a precise JSON generator. Reply with a SINGLE valid JSON value and nothing else.",
    "Do not wrap it in markdown, do not add commentary before or after.",
    opts.schemaHint ? `The JSON MUST match this shape:\n${opts.schemaHint}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const res = await callClaude({ ...opts, system });
  if (!res.ok) return { ok: false, error: res.error };
  try {
    return { ok: true, data: extractJson(res.text) as T, model: res.model };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON from model." };
  }
}

// Vision helper: analyze one image by public URL (Supabase CDN URLs work).
export async function callClaudeVision(opts: {
  imageUrl: string;
  prompt: string;
  system?: string;
  model?: string;
  maxTokens?: number;
}): Promise<ClaudeResult> {
  return callClaude({
    system: opts.system,
    model: opts.model,
    maxTokens: opts.maxTokens,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "url", url: opts.imageUrl } },
          { type: "text", text: opts.prompt },
        ],
      },
    ],
  });
}
