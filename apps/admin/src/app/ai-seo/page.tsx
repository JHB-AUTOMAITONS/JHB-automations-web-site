import Link from "next/link";
import { getAiSeoStatus } from "./actions";

const TOOLS: { href: string; label: string; icon: string; desc: string; ready: boolean }[] = [
  { href: "/ai-seo/content-generator", label: "AI Content Generator", icon: "✍️", desc: "Hero, sections, CTAs, benefits, features — on-brand & SEO-aware.", ready: true },
  { href: "/ai-seo/analyzer", label: "SEO Analyzer", icon: "🔬", desc: "Score a page/URL and get prioritized fixes.", ready: true },
  { href: "/ai-seo/keyword-research", label: "Keyword Research", icon: "🔑", desc: "Volume, difficulty, intent, long-tail & questions.", ready: true },
  { href: "/ai-seo/blog-writer", label: "Blog Writer", icon: "📝", desc: "Full SEO article: H1/H2/H3, FAQ, schema, CTA.", ready: true },
  { href: "/ai-seo/service-writer", label: "Service Page Writer", icon: "🧩", desc: "Conversion-focused service page copy.", ready: true },
  { href: "/ai-seo/image-seo", label: "Image SEO", icon: "🖼", desc: "Alt text, title, caption, description & filename from the image.", ready: true },
  { href: "/ai-seo/faq-generator", label: "FAQ Generator", icon: "❓", desc: "People-Also-Ask-style FAQs from a topic or content.", ready: true },
  { href: "/ai-seo/schema-generator", label: "Schema Generator", icon: "🧷", desc: "Valid JSON-LD for any Schema.org type.", ready: true },
  { href: "/ai-seo/competitor", label: "Competitor Analysis", icon: "🥊", desc: "Competitor keyword & content gaps.", ready: false },
  { href: "/ai-seo/internal-links", label: "Internal Link Suggestions", icon: "🔗", desc: "Site-wide internal linking map.", ready: false },
  { href: "/ai-seo/reports", label: "SEO Reports", icon: "📊", desc: "Full-site audit with per-page scores — free, no API key.", ready: true },
  { href: "/ai-seo/history", label: "AI History", icon: "🕑", desc: "Every AI generation, logged for review.", ready: true },
];

function StatusPill({ ok, label, hint }: { ok: boolean; label: string; hint: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${ok ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{label}</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ok ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
          {ok ? "Connected" : "Not configured"}
        </span>
      </div>
      <p className={`mt-1 text-xs ${ok ? "text-green-700/80" : "text-amber-700/90"}`}>{hint}</p>
    </div>
  );
}

export default async function AiSeoDashboard() {
  const status = await getAiSeoStatus();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">AI SEO Assistant</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        An enterprise AI SEO workflow: Claude AI + live keyword data + native SEO analysis + your website
        repo context. Everything runs server-side; you always review before Save/Publish.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatusPill ok={status.claude} label="Claude AI (API)" hint={status.claude ? "Automatic one-click mode is live." : "No API key — running in Manual mode below (uses your claude.ai subscription)."} />
        <StatusPill ok={status.seoConnector} label="SEO Connector" hint={status.seoConnector ? "Live keyword data is connected." : "Paste keyword rows from Ubersuggest in Keyword Research to use real numbers."} />
        <StatusPill ok={status.repo} label="Repo Context" hint={status.repo ? "Website source is readable for page context." : "Set WEBSITE_SRC_DIR if running split from the repo."} />
      </div>

      <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 text-sm">
        <p className="font-semibold text-primary">✨ Manual mode is on</p>
        <p className="mt-1 text-muted">
          Each tool builds a ready-to-use prompt. Click <strong>Build prompt</strong>, press <strong>Open Claude ↗</strong>,
          paste it into your claude.ai chat, then paste Claude’s reply back — the tool formats it for you. No API key or extra
          cost. (Add <code>ANTHROPIC_API_KEY</code> later to switch to one-click automatic mode.)
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{t.icon}</span>
              {!t.ready && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Soon</span>}
            </div>
            <h2 className="mt-3 font-display text-base font-semibold group-hover:text-primary">{t.label}</h2>
            <p className="mt-1 text-xs text-muted">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
