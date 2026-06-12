import Link from "next/link";
import { formatDate, type PostCard as PostCardType } from "@jhb/shared/posts";

export default function PostCard({ post }: { post: PostCardType }) {
  return (
    <article className="group glass glow-border flex h-full flex-col overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1.5">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/15 to-secondary/15">
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
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/blog/${post.slug}`}>
          <h3 className="font-display text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
            {post.title}
          </h3>
        </Link>
        {post.excerpt && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
            {post.excerpt}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3 text-xs text-muted">
          <span>{post.author}</span>
          <span>{formatDate(post.published_at)}</span>
        </div>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          Read More
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </article>
  );
}
