"use client";

import Link from "next/link";
import Reveal from "./Reveal";
import PostCard from "./PostCard";
import ShareButtons from "./ShareButtons";
import { formatDate, type Post, type PostCard as PostCardType } from "@jhb/shared/posts";

/**
 * The blog-post article layout — the single source of truth for how a post
 * renders on the live website. Both the real /blog/[slug] page and the admin
 * draft preview (/preview/blog) render through this component, so the preview is
 * always pixel-accurate with no duplicated template.
 */
export default function BlogArticle({
  post,
  related,
  coverAlt,
  coverTitle,
  shareUrl,
}: {
  post: Post;
  related: PostCardType[];
  coverAlt?: string;
  coverTitle?: string;
  shareUrl: string;
}) {
  const authorInitials =
    (post.author || "JHB")
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "JH";

  return (
    <main className="relative pt-28">
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />

      <article className="container-x pb-16">
        {/* breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted">
          <Link href="/#home" className="transition-colors hover:text-ink">Home</Link>
          <span>/</span>
          <Link href="/blog" className="transition-colors hover:text-ink">Blog</Link>
          <span>/</span>
          <span className="truncate text-primary">{post.title || "Untitled post"}</span>
        </nav>

        <div className="mx-auto max-w-3xl">
          {post.category && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {post.category}
            </span>
          )}
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {post.title || "Untitled post"}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            <span className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-[10px] font-bold text-white">
                {authorInitials}
              </span>
              {post.author}
            </span>
            <span>·</span>
            <time dateTime={post.published_at ?? undefined}>
              {formatDate(post.published_at) || "Draft preview"}
            </time>
          </div>

          {post.cover_image && (
            <div className="mt-8 overflow-hidden rounded-3xl shadow-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image}
                alt={coverAlt || post.title || "Cover image"}
                loading="lazy"
                decoding="async"
                {...(coverTitle ? { title: coverTitle } : {})}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          )}

          {/* article body */}
          {post.content_html ? (
            <div
              className="prose-jhb mt-10 text-lg leading-relaxed text-ink/80"
              dangerouslySetInnerHTML={{ __html: post.content_html }}
            />
          ) : (
            <p className="mt-10 text-lg leading-relaxed text-muted">
              Start writing your post content — it will appear here as you type.
            </p>
          )}

          {/* tags */}
          {post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-ink/[0.04] px-2.5 py-1 text-xs font-medium text-muted ring-1 ring-ink/10"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* share */}
          <div className="mt-8 border-t border-ink/10 pt-6">
            <ShareButtons url={shareUrl} title={post.title} />
          </div>
        </div>

        {/* related */}
        {related.length > 0 && (
          <div className="mx-auto mt-14 max-w-6xl">
            <h2 className="mb-8 font-display text-2xl font-bold">
              Related <span className="grad-text">Articles</span>
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 0.06}>
                  <PostCard post={p} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
