"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate, type Post, type BlogFaq } from "@jhb/shared/posts";
import { savePost, deletePost } from "@/app/actions";
import { withTimeout, actionErrorMessage } from "@/lib/asyncAction";
import RichText from "./RichText";
import ImagePicker from "./ImagePicker";
import BlogFaqEditor from "./BlogFaqEditor";
import AiSeoPanel from "./ai/AiSeoPanel";
import AuthorPublisherEditor from "./AuthorPublisherEditor";
import { usePageContainers } from "@/lib/usePageContainers";
import { PageContainersView } from "@jhb/shared/container-view";
import FaqAccordionView from "@jhb/shared/faq-accordion-view";
import type { PageContainer } from "@jhb/shared/containers";
import EditorHeader from "./EditorHeader";
import SplitPane from "./SplitPane";
import { sanitizeRichText } from "@jhb/shared/rich-text";

const faqUid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `faq-${Date.now()}-${Math.round(Math.random() * 1e6)}`;

const BLOG_SECTIONS = [{ label: "Post", zone: "bottom" }];

type Toast = { type: "success" | "error"; msg: string } | null;

// Accept a bare slug, a title, or a pasted full URL; keep only the slug portion,
// lowercase, spaces/symbols -> hyphen, collapse repeats (trailing hyphen kept
// while typing; the server normalises again on save).
const cleanSlugInput = (raw: string) => {
  let s = raw.trim();
  if (s.includes("/")) {
    s = s.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]+/i, "").split(/[?#]/)[0];
    const parts = s.split("/").filter(Boolean);
    if (parts.length) s = parts[parts.length - 1];
  }
  return s.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-").replace(/^-+/, "");
};

export default function PostEditor({
  post,
  categories,
}: {
  post: Post | null;
  categories: string[];
}) {
  const router = useRouter();
  const editing = Boolean(post);
  const cb = usePageContainers(post?.containers ?? [], BLOG_SECTIONS);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content_html ?? "");
  const [cover, setCover] = useState<string | null>(post?.cover_image ?? null);
  const [category, setCategory] = useState(post?.category ?? "");
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [author, setAuthor] = useState(post?.author ?? "JHB Automations");
  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? "");
  const [metaDesc, setMetaDesc] = useState(post?.meta_description ?? "");
  const [faqs, setFaqs] = useState<BlogFaq[]>(post?.faqs ?? []);
  const [faqsEnabled, setFaqsEnabled] = useState(post?.faqs_enabled ?? true);

  const [busy, setBusy] = useState<"" | "save" | "publish">("");
  const [toast, setToast] = useState<Toast>(null);
  const [showPreview, setShowPreview] = useState(true);

  const flash = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  const onTitle = (v: string) => {
    setTitle(v);
    if (!slugTouched) {
      setSlug(
        v.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      );
    }
  };

  const save = async (status: "draft" | "published") => {
    if (busy) return;
    setBusy(status === "draft" ? "save" : "publish");
    try {
      const res = await withTimeout(
        savePost({
          id: post?.id,
          slug,
          title,
          excerpt,
          content_html: content,
          cover_image: cover,
          category,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          author,
          meta_title: metaTitle,
          meta_description: metaDesc,
          status,
          containers: cb.containers,
          faqs,
          faqs_enabled: faqsEnabled,
        })
      );
      if (res.ok) {
        flash({
          type: "success",
          msg: status === "published" ? "Published!" : "Draft saved.",
        });
        if (!editing && res.id) {
          router.push(`/posts/${res.id}`);
        } else {
          router.refresh();
        }
      } else {
        flash({ type: "error", msg: res.error || "Save failed." });
      }
    } catch (e) {
      flash({ type: "error", msg: actionErrorMessage(e, "Save failed. Please try again.") });
    } finally {
      setBusy("");
    }
  };

  const remove = async () => {
    if (!post) return;
    if (!confirm("Delete this post?")) return;
    const res = await deletePost(post.id);
    if (res.ok) router.push("/posts");
    else flash({ type: "error", msg: res.error || "Delete failed." });
  };

  return (
    <div>
      <EditorHeader
        title={editing ? "Edit Post" : "New Post"}
        backHref="/posts"
        backLabel="← Back to posts"
        status={post?.status ?? "draft"}
        busy={busy}
        toast={toast}
        onSave={() => save("draft")}
        onPublish={() => save("published")}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview((s) => !s)}
        extra={
          editing ? (
            <button
              type="button"
              onClick={remove}
              className="rounded-lg border border-ink/10 px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:border-red-300 hover:text-red-500"
            >
              Delete
            </button>
          ) : undefined
        }
      />

      <SplitPane
        storageKey="cms-split:post"
        className="mt-8"
        left={
          /* editor (left) */
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* main */}
          <div className="space-y-6">
          {cb.slot("top")}
          <Card>
            <Field label="Title" value={title} onChange={onTitle} />
            <Field
              label="Slug (URL)"
              value={slug}
              onChange={(v) => {
                setSlug(cleanSlugInput(v));
                setSlugTouched(true);
              }}
              prefix="/blog/"
            />
            <Field label="Excerpt" value={excerpt} onChange={setExcerpt} textarea />
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">Content</span>
              {/* Blog Content only: fixed-height editor that scrolls internally
                  (~640px) so editing a long article doesn't scroll the whole page.
                  The toolbar stays above the scroll area. No other editor uses this. */}
              <RichText value={content} onChange={setContent} maxHeight={640} />
            </div>
          </Card>

          <BlogFaqEditor
            value={faqs}
            onChange={setFaqs}
            enabled={faqsEnabled}
            onToggleEnabled={setFaqsEnabled}
          />

          <Card title="SEO">
            <Field label="Meta title" value={metaTitle} onChange={setMetaTitle} />
            <Field label="Meta description" value={metaDesc} onChange={setMetaDesc} textarea />
          </Card>

          <AiSeoPanel
            route={slug ? `/blog/${slug}` : "/blog"}
            getContext={() => ({
              title: metaTitle || title,
              contentHtml: content,
              focusKeyword: category || undefined,
              metaTitle,
              metaDescription: metaDesc,
            })}
            onApply={(r) => {
              if (r.seoTitle) setMetaTitle(r.seoTitle);
              if (r.metaDescription) setMetaDesc(r.metaDescription);
              if (r.metaDescription && !excerpt.trim()) setExcerpt(r.metaDescription);
              if (r.contentHtml) setContent(r.contentHtml);
              // Seed the post's FAQ section only when it's currently empty.
              if (faqs.length === 0 && Array.isArray(r.faqs) && r.faqs.length > 0) {
                setFaqs(r.faqs.map((f) => ({ id: faqUid(), question: f.question, answer: f.answer, visible: true })));
                setFaqsEnabled(true);
              }
            }}
          />

          <AuthorPublisherEditor path={slug ? `/blog/${slug}` : "/blog"} />
          {cb.slot("bottom")}
        </div>

        {/* sidebar */}
        <div className="space-y-6">
          <Card title="Featured Image">
            <ImagePicker value={cover} onChange={setCover} />
          </Card>
          <Card title="Organize">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">Category</span>
              <input
                list="post-categories"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
              <datalist id="post-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <Field
              label="Tags (comma-separated)"
              value={tags}
              onChange={setTags}
            />
            <Field label="Author" value={author} onChange={setAuthor} />
          </Card>
          </div>
          </div>
        }
        right={
          showPreview ? (
          /* live preview (right) */
          <div className="xl:sticky xl:top-6 xl:h-fit">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Live preview (draft)
            </div>
            <BlogPreview
              title={title}
              slug={slug}
              excerpt={excerpt}
              content={content}
              cover={cover}
              category={category}
              tags={tags.split(",").map((t) => t.trim()).filter(Boolean)}
              author={author}
              date={post?.published_at ?? null}
              metaTitle={metaTitle}
              metaDesc={metaDesc}
              containers={cb.containers}
              faqs={faqs}
              faqsEnabled={faqsEnabled}
            />
          </div>
          ) : null
        }
      />

      {cb.modal}
    </div>
  );
}

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
      {title && <h2 className="mb-4 font-display text-lg font-semibold">{title}</h2>}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  prefix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-none rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      ) : prefix ? (
        <div className="flex items-center overflow-hidden rounded-xl border border-ink/10 bg-base">
          <span className="px-3 py-2.5 text-sm text-muted">{prefix}</span>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent py-2.5 pr-4 text-sm outline-none"
          />
        </div>
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      )}
    </label>
  );
}

// Compact, live mock of the public blog article (apps/website blog/[slug]) plus
// a search/SEO snippet — same card styling as the Home Live Preview. A
// fixed-height viewport that scrolls internally so the whole article is
// reachable while the editor on the left scrolls independently.
function BlogPreview({
  title,
  slug,
  excerpt,
  content,
  cover,
  category,
  tags,
  author,
  date,
  metaTitle,
  metaDesc,
  containers,
  faqs,
  faqsEnabled,
}: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover: string | null;
  category: string;
  tags: string[];
  author: string;
  date: string | null;
  metaTitle: string;
  metaDesc: string;
  containers: PageContainer[];
  faqs: BlogFaq[];
  faqsEnabled: boolean;
}) {
  const heading = title.trim() || "Untitled post";
  const visibleFaqs = faqs.filter((f) => f.visible && f.question.trim());
  return (
    <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-ink/10 bg-base shadow-soft xl:max-h-[calc(100vh-10rem)]">
      <PageContainersView containers={containers} zone="top" />
      <article className="p-5">
        {/* breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] text-muted">
          <span>Home</span>
          <span>/</span>
          <span>Blog</span>
          <span>/</span>
          <span className="truncate text-primary">{heading}</span>
        </nav>

        {/* category */}
        {category.trim() && (
          <span className="mt-4 inline-block rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
            {category}
          </span>
        )}

        {/* title */}
        <h3 className="mt-3 font-display text-xl font-bold leading-tight tracking-tight">
          {heading}
        </h3>

        {/* author + date */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-[8px] font-bold text-white">
              JH
            </span>
            {author.trim() || "JHB Automations"}
          </span>
          <span>·</span>
          <span>{date ? formatDate(date) : "Draft — not published yet"}</span>
        </div>

        {/* cover */}
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="mt-4 aspect-[16/9] w-full rounded-xl object-cover shadow-soft" />
        )}

        {/* lead / excerpt */}
        {excerpt.trim() && (
          <p className="mt-4 text-sm font-medium text-ink/70">{excerpt}</p>
        )}

        {/* body */}
        {content.trim() ? (
          <div
            className="prose-jhb mt-4 text-sm leading-relaxed text-ink/80 [&_a]:text-primary [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_li]:my-1 [&_ul_ul]:list-[circle] [&_ul_ul_ul]:list-[square] [&_ol_ol]:list-[lower-alpha] [&_ol_ol_ol]:list-[lower-roman] [&_.rt-checklist]:list-none"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(content) }}
          />
        ) : (
          <p className="mt-4 text-xs italic text-muted">Start writing content to see it render here…</p>
        )}

        {/* tags */}
        {tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-md bg-ink/[0.04] px-2 py-0.5 text-[10px] font-medium text-muted ring-1 ring-ink/10"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* FAQ accordion — mirrors the live post (content → tags → FAQ) */}
        {faqsEnabled && visibleFaqs.length > 0 && (
          <div className="mt-6 border-t border-ink/10 pt-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">FAQ</p>
            <h4 className="mt-1 font-display text-base font-bold">
              Frequently Asked <span className="grad-text">Questions</span>
            </h4>
            <div className="mt-3">
              <FaqAccordionView items={visibleFaqs} />
            </div>
          </div>
        )}
      </article>

      <PageContainersView containers={containers} zone="bottom" />

      {/* search / SEO snippet — reflects Slug, Meta title, Meta description live */}
      <div className="border-t border-ink/10 bg-surface p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Search preview</p>
        <div className="mt-2">
          <p className="text-[11px] text-emerald-700">
            jhbautomations.com › blog › {slug.trim() || "your-post-slug"}
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-[#1a0dab]">
            {metaTitle.trim() || `${heading} — JHB Automations`}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">
            {metaDesc.trim() ||
              excerpt.trim() ||
              "Add a meta description to control the snippet shown in search results."}
          </p>
        </div>
      </div>
    </div>
  );
}
