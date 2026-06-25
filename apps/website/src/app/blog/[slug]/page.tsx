import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import PostCard from "@/components/PostCard";
import ShareButtons from "@/components/ShareButtons";
import {
  getPostBySlug,
  getRelatedPosts,
  getPublishedSlugs,
} from "@jhb/shared/posts-server";
import { formatDate } from "@jhb/shared/posts";
import { getMediaAltMap, getMediaTitleMap } from "@jhb/shared/media-server";
import { altFor } from "@jhb/shared/media";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateStaticParams() {
  // Pre-render currently-published posts for fast first loads; newly published
  // posts render on demand (dynamicParams below), no rebuild needed.
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article Not Found — JHB Automations" };
  const title = post.meta_title || `${post.title} — JHB Automations`;
  const description = post.meta_description || post.excerpt || undefined;
  const canonical = `/blog/${post.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      siteName: "JHB Automations",
      url: canonical,
      title,
      description,
      type: "article",
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.slug, post.category, 3);
  const [altMap, titleMap] = await Promise.all([getMediaAltMap(), getMediaTitleMap()]);
  const url = `${SITE}/blog/${post.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.meta_description || undefined,
    image: post.cover_image || undefined,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "JHB Automations",
    },
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at,
    mainEntityOfPage: url,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <main className="relative pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />

      <article className="container-x pb-16">
        {/* breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted">
          <Link href="/#home" className="transition-colors hover:text-ink">Home</Link>
          <span>/</span>
          <Link href="/blog" className="transition-colors hover:text-ink">Blog</Link>
          <span>/</span>
          <span className="truncate text-primary">{post.title}</span>
        </nav>

        <div className="mx-auto max-w-3xl">
          {post.category && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {post.category}
            </span>
          )}
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            <span className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-[10px] font-bold text-white">
                JH
              </span>
              {post.author}
            </span>
            <span>·</span>
            <time dateTime={post.published_at ?? undefined}>
              {formatDate(post.published_at)}
            </time>
          </div>

          {post.cover_image && (
            <div className="mt-8 overflow-hidden rounded-3xl shadow-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image}
                alt={altFor(post.cover_image, altMap, post.title)}
                {...(altFor(post.cover_image, titleMap, "") ? { title: altFor(post.cover_image, titleMap, "") } : {})}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          )}

          {/* article body */}
          <div
            className="prose-jhb mt-10 text-lg leading-relaxed text-ink/80"
            dangerouslySetInnerHTML={{ __html: post.content_html || "" }}
          />

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
            <ShareButtons url={url} title={post.title} />
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
