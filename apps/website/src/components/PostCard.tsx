import Link from "next/link";
import { formatDate, type PostCard as PostCardType } from "@jhb/shared/posts";
import LikeButton from "./LikeButton";

export default function PostCard({ post }: { post: PostCardType }) {
  return (
    <article className="group glass glow-border relative flex h-full flex-col overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1.5">
      {/* Card-wide navigation: a stretched link sits beneath the content so the
          whole card is clickable, yet it stays a sibling (not an ancestor) of the
          Like button and "Read More" link — keeping the HTML valid and those
          controls independently interactive. Content sets `pointer-events-none`
          so clicks fall through to this link; interactive bits re-enable them. */}
      <Link
        href={`/blog/${post.slug}`}
        aria-label={post.title}
        className="absolute inset-0 z-0"
      />

      <div className="pointer-events-none relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/15 to-secondary/15">
        {post.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-4xl">📝</div>
        )}
        {post.category && (
          <span className="absolute left-3 top-3 rounded-full bg-base/85 px-3 py-1 text-[11px] font-semibold text-primary backdrop-blur">
            {post.category}
          </span>
        )}
      </div>

      <div className="pointer-events-none relative flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
            {post.excerpt}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3 text-xs text-muted">
          <span>{post.author}</span>
          <span>{formatDate(post.published_at)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          {/* Like is a real action, not navigation — keep it clickable above the card link. */}
          <span className="pointer-events-auto relative z-10">
            <LikeButton postId={post.id} initialLikes={post.likes} variant="card" />
          </span>
          {/* Visible affordance; the whole card already links here, so it stays
              out of the tab order to avoid a duplicate focus stop. */}
          <Link
            href={`/blog/${post.slug}`}
            tabIndex={-1}
            className="pointer-events-auto relative z-10 inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            Read More
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
