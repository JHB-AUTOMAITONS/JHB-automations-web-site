"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "@/app/actions";

type Row = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: string;
  updated_at: string;
};

export default function PostsTable({ posts }: { posts: Row[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await deletePost(id);
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
    <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10 bg-surface shadow-soft">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wider text-muted">
            <th className="px-5 py-3 font-medium">Title</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="hidden px-5 py-3 font-medium sm:table-cell">Category</th>
            <th className="hidden px-5 py-3 font-medium md:table-cell">Updated</th>
            <th className="px-5 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
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
              <td className="hidden px-5 py-3 text-muted sm:table-cell">
                {p.category ?? "—"}
              </td>
              <td className="hidden px-5 py-3 text-muted md:table-cell">
                {new Date(p.updated_at).toLocaleDateString()}
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/posts/${p.id}`}
                    className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-primary hover:text-primary"
                  >
                    Edit
                  </Link>
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
  );
}
