import { createClient } from "@jhb/shared/supabase/server";

type HistoryRow = {
  id: string;
  tool: string;
  user_email: string | null;
  created_at: string;
  input: Record<string, unknown> | null;
};

const TOOL_LABEL: Record<string, string> = {
  "page-seo": "Generate Page SEO",
  "image-seo": "Image SEO",
  "keyword-research": "Keyword Research",
  analyze: "SEO Analyzer",
  "blog-writer": "Blog Writer",
  "faq-generator": "FAQ Generator",
  "schema-generator": "Schema Generator",
  "content-generator": "Content Generator",
};

export default async function AiHistoryPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jhb_ai_history")
    .select("id, tool, user_email, created_at, input")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (data as HistoryRow[] | null) ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">AI History</h1>
      <p className="mt-1 text-sm text-muted">The last 100 AI generations, for review and auditing.</p>

      {error ? (
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">History table not found</p>
          <p className="mt-0.5 text-xs">
            Run <code>supabase/migrations/jhb_ai_history.sql</code> once to enable logging. AI tools still
            work without it — they just won’t be recorded here.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-ink/15 p-10 text-center text-sm text-muted">
          No AI generations yet. Use any AI SEO tool and it’ll appear here.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-2.5">Tool</th>
                <th className="px-4 py-2.5">By</th>
                <th className="px-4 py-2.5">When</th>
                <th className="px-4 py-2.5">Input</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {rows.map((r) => (
                <tr key={r.id} className="bg-base/50">
                  <td className="px-4 py-2.5 font-medium">{TOOL_LABEL[r.tool] ?? r.tool}</td>
                  <td className="px-4 py-2.5 text-muted">{r.user_email ?? "—"}</td>
                  <td className="px-4 py-2.5 text-muted">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="max-w-[28rem] truncate px-4 py-2.5 text-xs text-muted">
                    {r.input ? JSON.stringify(r.input) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
