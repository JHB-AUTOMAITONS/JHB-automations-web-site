"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "@jhb/shared/posts";
import { savePost, deletePost } from "@/app/actions";
import RichText from "./RichText";
import ImagePicker from "./ImagePicker";

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

  const [busy, setBusy] = useState<"" | "draft" | "publish">("");
  const [toast, setToast] = useState<Toast>(null);

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
    setBusy(status === "draft" ? "draft" : "publish");
    const res = await savePost({
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
    });
    setBusy("");
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
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-soft-lg ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            onClick={() => router.push("/posts")}
            className="text-sm text-muted transition-colors hover:text-ink"
          >
            ← Back to posts
          </button>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
            {editing ? "Edit Post" : "New Post"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {editing && (
            <button
              onClick={remove}
              className="rounded-lg border border-ink/10 px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:border-red-300 hover:text-red-500"
            >
              Delete
            </button>
          )}
          <button
            onClick={() => save("draft")}
            disabled={busy !== ""}
            className="btn btn-ghost !px-5 !py-2.5 !text-sm disabled:opacity-60"
          >
            {busy === "draft" ? "Saving…" : "Save draft"}
          </button>
          <button
            onClick={() => save("published")}
            disabled={busy !== ""}
            className="btn btn-primary !px-5 !py-2.5 !text-sm disabled:opacity-60"
          >
            {busy === "publish" ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* main */}
        <div className="space-y-6">
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
              <RichText value={content} onChange={setContent} />
            </div>
          </Card>

          <Card title="SEO">
            <Field label="Meta title" value={metaTitle} onChange={setMetaTitle} />
            <Field label="Meta description" value={metaDesc} onChange={setMetaDesc} textarea />
          </Card>
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
