"use client";

import { useEffect, useState } from "react";
import type { Post, PostCard } from "@jhb/shared/posts";
import BlogArticle from "@/components/BlogArticle";

/**
 * Draft-aware blog-post preview. Renders the real BlogArticle layout and swaps
 * in the post being edited as the admin streams it over postMessage — so the
 * preview matches the live page exactly and updates live while editing.
 */
export default function BlogPreviewClient({
  seedPost,
  related,
  siteUrl,
}: {
  seedPost: Post;
  related: PostCard[];
  siteUrl: string;
}) {
  const [post, setPost] = useState<Post>(seedPost);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; post?: Partial<Post> } | null;
      if (d && d.type === "jhb-preview:set" && d.post) {
        // Merge the streamed draft onto the seed so server-only fields
        // (id/status/timestamps) stay defined.
        setPost((prev) => ({ ...prev, ...d.post } as Post));
      }
    };
    window.addEventListener("message", onMsg);
    try {
      window.parent?.postMessage({ type: "jhb-preview:ready" }, "*");
    } catch {
      /* standalone load */
    }
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const shareUrl = `${siteUrl.replace(/\/$/, "")}/blog/${post.slug || ""}`;

  return (
    <BlogArticle
      post={post}
      related={related}
      coverAlt={post.title}
      shareUrl={shareUrl}
    />
  );
}
