import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import PostCard from "@/components/PostCard";
import ShareButtons from "@/components/ShareButtons";
import PageContainers from "@/components/PageContainers";
import LikeButton from "@/components/LikeButton";
import BlogFaq from "@/components/BlogFaq";
import {
  getPostBySlug,
  getRelatedPosts,
  getPublishedSlugs,
} from "@jhb/shared/posts-server";
import { formatDate, readingTimeMinutes } from "@jhb/shared/posts";
import { getEffectiveAuthorPublisher, getSettings, getBlogArticleHero } from "@jhb/shared/content-server";
import BlogArticleHeroBanner from "@jhb/shared/blog-article-hero-view";
import { eeatSchemaFields } from "@jhb/shared/seo-schema";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Reduce rich-text answer HTML to clean plain text for the FAQ JSON-LD. Keeps
// the structured data valid and avoids any markup leaking into the schema.
function htmlToText(html: string): string {
  return (html || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

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
  const [authorPublisher, settings, articleHero] = await Promise.all([
    getEffectiveAuthorPublisher(`/blog/${post.slug}`),
    getSettings(),
    getBlogArticleHero(),
  ]);
  const url = `${SITE}/blog/${post.slug}`;
  const dateLabel = formatDate(post.published_at);
  const readingLabel = `${readingTimeMinutes(post.content_html)} min read`;

  // E-E-A-T fields from the CMS Author & Publisher settings (Person + Organization,
  // creator, copyrightHolder, dates, mainEntityOfPage) override the fallbacks below.
  const eeat = eeatSchemaFields(authorPublisher, {
    url,
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at,
    siteName: "JHB Automations",
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.meta_description || undefined,
    image: post.cover_image || undefined,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: "JHB Automations" },
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at,
    mainEntityOfPage: url,
    ...eeat,
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

  // FAQ JSON-LD (FAQPage) — generated per-post from the visible FAQs so search
  // engines can surface rich results. Built only when the section is enabled and
  // has at least one answered, visible question.
  const faqItems = post.faqs_enabled
    ? post.faqs.filter((f) => f.visible && f.question.trim() && htmlToText(f.answer))
    : [];
  const faqSchema =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((f) => ({
            "@type": "Question",
            name: f.question.trim(),
            acceptedAnswer: { "@type": "Answer", text: htmlToText(f.answer) },
          })),
        }
      : null;

  return (
    <main className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Full-width hero banner — same design language as the Blog listing hero.
          Background + styling come from the CMS "Blog Article Hero" config; the
          title, breadcrumb, category badge, author, date and reading time are
          pulled from this post. Replaces the old top featured image. */}
      {articleHero.enabled && (
        <BlogArticleHeroBanner
          hero={articleHero}
          title={post.title}
          category={post.category}
          author={post.author}
          dateLabel={dateLabel}
          readingLabel={readingLabel}
        />
      )}

      <div className={`relative ${articleHero.enabled ? "pt-12" : "pt-24"}`}>
        <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />

        <PageContainers containers={post.containers ?? []} zone="top" />

        {/* Wider reading container — blog detail only (~1200px content, up to 1320px
            frame; 16/24/40px responsive padding). Does not touch the shared
            container-x utility, so other pages are unaffected. */}
        <article className="mx-auto w-full max-w-[1320px] px-4 pb-20 sm:px-6 lg:px-10">
          {/* Hero disabled → plain title header here (no banner, no featured image).
              Hero enabled → the title/breadcrumb/meta live inside the hero above. */}
          {!articleHero.enabled && (
            <nav className="mb-8 flex items-center gap-2 text-sm text-muted">
              <Link href="/#home" className="transition-colors hover:text-ink">Home</Link>
              <span>/</span>
              <Link href="/blog" className="transition-colors hover:text-ink">Blog</Link>
              <span>/</span>
              <span className="truncate text-primary">{post.title}</span>
            </nav>
          )}

          <div className="mx-auto max-w-[1200px]">
            {!articleHero.enabled && (
              <>
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
                  <time dateTime={post.published_at ?? undefined}>{dateLabel}</time>
                  <span>·</span>
                  <span>{readingLabel}</span>
                </div>
              </>
            )}

          {/* article body */}
          <div
            className="prose-jhb mt-10 text-lg leading-relaxed text-ink/80 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_pre]:overflow-x-auto [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_iframe]:max-w-full [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_li]:my-1 [&_ul_ul]:list-[circle] [&_ul_ul_ul]:list-[square] [&_ol_ol]:list-[lower-alpha] [&_ol_ol_ol]:list-[lower-roman] [&_.rt-checklist]:list-none"
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

          {/* FAQ — blog-specific accordion, after the article body & tags */}
          {post.faqs_enabled && <BlogFaq faqs={post.faqs} showNumbers={settings.faqShowNumbers} />}

          {/* like + share */}
          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-ink/10 pt-6">
            <LikeButton postId={post.id} initialLikes={post.likes} variant="detail" />
            <ShareButtons url={url} title={post.title} />
          </div>
        </div>

        {/* related */}
        {related.length > 0 && (
          <div className="mx-auto mt-10 max-w-[1200px]">
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

        <PageContainers containers={post.containers ?? []} zone="bottom" />
      </div>
    </main>
  );
}
