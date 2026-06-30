# AI SEO Assistant — setup

The **AI SEO Assistant** (Admin → ✨ AI SEO Assistant) adds Claude-powered SEO
tooling on top of the existing CMS. It changes nothing about the current editors,
SEO fields or publish workflow — it only *adds* capabilities. Everything runs
server-side; no secret ever reaches the browser.

## 1. Required: Claude API key

```env
ANTHROPIC_API_KEY=sk-ant-...        # required — the AI engine
CLAUDE_MODEL=claude-sonnet-4-6      # optional — default shown; use claude-opus-4-8 for max quality
CLAUDE_MAX_TOKENS=4096              # optional
```

Without `ANTHROPIC_API_KEY`, the tools load but report "Claude is not configured".

## 2. Optional: live SEO keyword data (SEO Connector)

Ubersuggest has **no official public API**, so the connector is provider-agnostic.
Point it at any keyword/SERP API you have (DataForSEO, SE Ranking, SerpApi,
Keywords Everywhere, a self-hosted Ubersuggest proxy…):

```env
SEO_CONNECTOR_BASE_URL=https://your-provider.example/keyword   # GET ?keyword=&country=
SEO_CONNECTOR_API_KEY=...                                       # sent as: Authorization: Bearer <key>
SEO_CONNECTOR_COUNTRY=IN                                        # optional default
SEO_CONNECTOR_NAME=dataforseo                                   # optional label
```

The expected JSON response shape (map your provider in
`src/lib/ai/seoConnector.ts → mapProviderPayload` if it differs):

```json
{
  "primary":   { "keyword": "...", "volume": 1900, "difficulty": 34, "cpc": 1.2, "competition": 0.4, "intent": "commercial" },
  "related":   [ { "keyword": "...", "volume": 0, "difficulty": 0, "cpc": 0, "intent": "..." } ],
  "longTail":  [ { "keyword": "..." } ],
  "questions": ["...?"],
  "competitors": ["domain.com"]
}
```

When unconfigured, Claude estimates keyword ideas and the UI labels them as
estimates — nothing breaks.

## 3. Optional: repo context

The assistant reads `apps/website/src` to understand the page being edited. This
works automatically in local dev and single-server / VPS deploys. In a split
serverless deploy where the website source isn't bundled with the admin, set:

```env
WEBSITE_SRC_DIR=/absolute/path/to/apps/website/src
```

## 4. One-time DB migration (optional, for AI History)

Run once in the Supabase SQL editor to enable the AI History audit log:

```
supabase/migrations/jhb_ai_history.sql
```

AI tools work without it — they just won't be recorded in AI History.

## About the `claude-seo` repository

`github.com/AgriciDaniel/claude-seo` is a **Claude Code plugin** (Python +
Playwright + skill markdown), designed to run as `/seo` slash-commands inside
Claude Code — it cannot be imported into a Next.js server. Its analysis
*methodology* (technical/E-E-A-T/schema/GEO/heading/thin-content/image checks) is
re-implemented natively in `src/lib/ai/seoAnalysis.ts`, and its optional MCP data
providers (DataForSEO/Ahrefs/SE Ranking) map onto the SEO Connector above.
