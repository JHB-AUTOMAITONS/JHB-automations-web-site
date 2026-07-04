"use client";

import { useEffect, useState } from "react";
import { createClient } from "@jhb/shared/supabase/client";

// Per-device de-duplication. A liked post id is remembered in localStorage so
// the same browser can't inflate the count; the heart shows filled on return.
const KEY = "jhb.liked.posts";
function readLiked(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
  } catch {
    return new Set();
  }
}
function markLiked(id: string) {
  try {
    const s = readLiked();
    s.add(id);
    localStorage.setItem(KEY, JSON.stringify([...s]));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-[1.15em] w-[1.15em]"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

export default function LikeButton({
  postId,
  initialLikes,
  variant = "card",
}: {
  postId: string;
  initialLikes: number;
  variant?: "card" | "detail";
}) {
  const [count, setCount] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [burst, setBurst] = useState(false);

  // Read the per-device flag after mount (avoids SSR/hydration mismatch).
  useEffect(() => {
    setLiked(readLiked().has(postId));
  }, [postId]);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // never trigger a wrapping card link
    e.stopPropagation();
    if (liked) return;
    // Optimistic: bump instantly, persist in the background.
    setLiked(true);
    setCount((c) => c + 1);
    setBurst(true);
    markLiked(postId);
    window.setTimeout(() => setBurst(false), 500);
    try {
      const supabase = createClient();
      const { data } = await supabase.rpc("increment_post_likes", { p_id: postId });
      if (typeof data === "number") setCount(data); // reconcile to the true total
    } catch {
      /* keep the optimistic count if the request fails */
    }
  };

  const detail = variant === "detail";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={liked}
      title={liked ? "You liked this post" : "Like this post"}
      className={`group/like inline-flex items-center gap-2 rounded-full border font-medium transition-colors ${
        detail ? "px-4 py-2 text-sm" : "min-h-10 px-3 py-1.5 text-xs"
      } ${liked ? "border-red-200 bg-red-50 text-red-500" : "border-ink/10 text-muted hover:border-red-200 hover:text-red-500"}`}
    >
      <span className={`inline-flex transition-transform group-hover/like:scale-110 ${burst ? "like-pop" : ""}`}>
        <Heart filled={liked} />
      </span>
      <span className="tabular-nums">{count}</span>
      {detail ? <span>{liked ? "Liked" : "Like"}</span> : null}
    </button>
  );
}
