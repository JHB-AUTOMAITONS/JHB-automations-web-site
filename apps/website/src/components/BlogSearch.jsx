"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";
import PostCard from "@/components/PostCard";

// Client-side search over the pre-rendered list of published posts. The blog
// index is statically exported, so filtering happens in the browser (no server
// request / searchParams).
export default function BlogSearch({
  posts,
  placeholder = "Search articles…",
  buttonLabel = "Search",
  noMatchTemplate,
  emptyText = "No articles published yet. Check back soon!",
  banner,
}) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const filtered = query
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          (p.excerpt ?? "").toLowerCase().includes(query) ||
          (p.category ?? "").toLowerCase().includes(query)
      )
    : posts;

  const noMatchText = (noMatchTemplate ?? "No articles match \"{query}\".").replace("{query}", q);

  return (
    <>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="mx-auto mt-8 flex max-w-md gap-2"
      >
        <input
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full rounded-xl border border-ink/10 bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <button type="submit" className="btn btn-primary !px-5 !py-3 !text-sm">
          {buttonLabel}
        </button>
      </form>

      {banner}

      {filtered.length === 0 ? (
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-ink/10 bg-surface p-10 text-center text-muted shadow-soft">
          {query ? noMatchText : emptyText}
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, i) => (
            <Reveal key={post.id} delay={(i % 3) * 0.06}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}