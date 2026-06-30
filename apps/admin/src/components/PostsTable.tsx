"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePost, resetPostLikes } from "@/app/actions";
import LocalDateTime from "./LocalDateTime";

type Row = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: string;
  updated_at: string;
  likes: number;
};

export default function PostsTable({ posts }: { posts: Row[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [sort, setSort] = useState<"recent" | "likes">("recent");
  const [minLikes, setMinLikes] = useState(0);

  const totalLikes = useMemo(() => posts.reduce((s, p) => s + p.likes, 0), [posts]);
  const rows = useMemo(() => {
    const filtered = posts.filter((p) => p.likes >= minLikes);
    // "recent" keeps the server order (already newest-first); "likes" sorts desc.
    return sort === "likes" ? [...filtered].sort((a, b) => b.likes - a.likes) : filtered;
  }, [posts, sort, minLikes]);

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await deletePost(id);
    startTransition(() => router.refresh());
  };
  const reset = async (id: string, title: string) => {
    if (!confirm(`Reset likes for "${title}" to 0?`)) return;
    await resetPostLikes(id);
    startTransition(() => router.refresh());
  };

  if (posts.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-ink/10 bg-surface p-10 text-center text-sm text-muted">
        No posts yet. Click <b>New Post</b> to write your first article.
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted">
          {posts.length} post{posts.length === 1 ? "" : "s"} · <span className="font-medium text-ink">{totalLikes}</span> total likes
        </span>
        <span className="ml-auto flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-muted">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "recent" | "likes")}
              className="rounded-lg border border-ink/10 bg-base px-2 py-1.5 text-xs outline-none focus:border-primary"
            >
              <option value="recent">Most recent</option>
              <option value="likes">Most liked</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-xs text-muted">
            Min likes
            <input
              type="number"
              min={0}
              value={minLikes}
              onChange={(e) => setMinLikes(Math.max(0, Number(e.target.value) || 0))}
              className="w-16 rounded-lg border border-ink/10 bg-base px-2 py-1.5 text-xs outline-none focus:border-primary"
            />
          </label>
        </span>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-ink/10 bg-surface shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="hidden px-5 py-3 font-medium sm:table-cell">Category</th>
              <th className="px-5 py-3 font-medium">
                <button
                  onClick={() => setSort(sort === "likes" ? "recent" : "likes")}
                  className="inline-flex items-center gap-1 transition-colors hover:text-ink"
                  title="Sort by most liked"
                >
                  Likes {sort === "likes" ? "▾" : ""}
                </button>
              </th>
              <th className="hidden px-5 py-3 font-medium md:table-cell">Updated</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-ink/5 last:border-0">
                <td className="px-5 py-3">
                  <p className="font-medium">{p.title}</p>
                  <p className="font-mono text-[11px] text-muted">/{p.slug}</p>
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                      p.status === "published"
                        ? "bg-green-500/10 text-green-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="hidden px-5 py-3 text-muted sm:table-cell">{p.category ?? "—"}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 font-medium tabular-nums text-red-500">
                    <span aria-hidden>❤️</span> {p.likes}
                  </span>
                </td>
                <td className="hidden px-5 py-3 text-muted md:table-cell">
                  <LocalDateTime value={p.updated_at} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/posts/${p.id}`}
                      className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-primary hover:text-primary"
                    >
                      Edit
                    </Link>
                    {p.likes > 0 && (
                      <button
                        onClick={() => reset(p.id, p.title)}
                        className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-amber-300 hover:text-amber-600"
                      >
                        Reset likes
                      </button>
                    )}
                    <button
                      onClick={() => remove(p.id, p.title)}
                      className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-red-300 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
