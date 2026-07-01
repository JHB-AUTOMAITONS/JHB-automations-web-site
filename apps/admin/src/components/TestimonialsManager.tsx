"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TestimonialRow } from "@jhb/shared/testimonials";
import RichEditor from "./RichEditor";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  setTestimonialActive,
  reorderTestimonials,
  seedTestimonials,
  uploadMedia,
  type TestimonialInput,
} from "@/app/actions";

type Toast = { type: "success" | "error"; msg: string } | null;
type Form = TestimonialInput;

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

const emptyForm: Form = {
  name: "",
  role: "",
  company: "",
  quote: "",
  rating: 5,
  photo_url: null,
  active: true,
};

// Downscale + recompress an upload to a small WebP avatar before sending it up.
async function optimizeImage(file: File): Promise<File> {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) throw new Error("Use a JPG, PNG, or WebP image.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Image must be under 8 MB.");

  const dataUrl: string = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(new Error("Could not read file."));
    r.readAsDataURL(file);
  });
  const img: HTMLImageElement = await new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error("Invalid image file."));
    im.src = dataUrl;
  });

  const max = 480;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  ctx.drawImage(img, 0, 0, w, h);

  const blob: Blob = await new Promise((res, rej) =>
    canvas.toBlob(
      (b) => (b ? res(b) : rej(new Error("Compression failed."))),
      "image/webp",
      0.85
    )
  );
  const base = file.name.replace(/\.[^.]+$/, "") || "testimonial";
  return new File([blob], `${base}.webp`, { type: "image/webp" });
}

export default function TestimonialsManager({
  initial,
}: {
  initial: TestimonialRow[];
}) {
  const router = useRouter();
  const [list, setList] = useState<TestimonialRow[]>(initial);
  const [toast, setToast] = useState<Toast>(null);
  const [busy, setBusy] = useState(false);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [formErr, setFormErr] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoErr, setPhotoErr] = useState("");
  const photoInput = useRef<HTMLInputElement>(null);

  // drag/reorder state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);

  // keep local list in sync after server refreshes (unless mid-reorder)
  useEffect(() => {
    if (!orderDirty) setList(initial);
  }, [initial, orderDirty]);

  const flash = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErr("");
    setPhotoErr("");
    setModalOpen(true);
  };
  const openEdit = (t: TestimonialRow) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      role: t.role,
      company: t.company,
      quote: t.quote,
      rating: t.rating,
      photo_url: t.photo_url,
      active: t.active,
    });
    setFormErr("");
    setPhotoErr("");
    setModalOpen(true);
  };
  const closeModal = () => {
    if (busy || photoBusy) return;
    setModalOpen(false);
  };

  const pickPhoto = async (file: File | undefined) => {
    if (!file) return;
    setPhotoBusy(true);
    setPhotoErr("");
    try {
      const optimized = await optimizeImage(file);
      const fd = new FormData();
      fd.append("file", optimized);
      const res = await uploadMedia(fd);
      if (res.ok && res.url) setForm((f) => ({ ...f, photo_url: res.url! }));
      else setPhotoErr(res.error || "Upload failed.");
    } catch (e) {
      setPhotoErr(e instanceof Error ? e.message : "Upload failed.");
    }
    setPhotoBusy(false);
  };

  const submit = async () => {
    if (!form.name.trim()) return setFormErr("Customer name is required.");
    if (!form.quote.replace(/<[^>]*>/g, "").trim())
      return setFormErr("Testimonial content is required.");
    setFormErr("");
    setBusy(true);
    const res = editingId
      ? await updateTestimonial(editingId, form)
      : await createTestimonial(form);
    setBusy(false);
    if (res.ok) {
      setModalOpen(false);
      flash({ type: "success", msg: editingId ? "Testimonial updated." : "Testimonial added." });
      router.refresh();
    } else {
      setFormErr(res.error || "Save failed.");
    }
  };

  const remove = async (t: TestimonialRow) => {
    if (!confirm(`Delete the testimonial from "${t.name}"? This cannot be undone.`))
      return;
    setBusy(true);
    const res = await deleteTestimonial(t.id);
    setBusy(false);
    if (res.ok) {
      flash({ type: "success", msg: "Testimonial deleted." });
      router.refresh();
    } else flash({ type: "error", msg: res.error || "Delete failed." });
  };

  const togglePublish = async (t: TestimonialRow) => {
    setBusy(true);
    const res = await setTestimonialActive(t.id, !t.active);
    setBusy(false);
    if (res.ok) {
      flash({ type: "success", msg: !t.active ? "Published." : "Unpublished." });
      router.refresh();
    } else flash({ type: "error", msg: res.error || "Update failed." });
  };

  const seed = async () => {
    setBusy(true);
    const res = await seedTestimonials();
    setBusy(false);
    if (res.ok) {
      flash({ type: "success", msg: "Sample testimonials imported." });
      router.refresh();
    } else flash({ type: "error", msg: res.error || "Import failed." });
  };

  // ---- drag reorder ----
  const move = (from: number, to: number) => {
    if (to < 0 || to >= list.length) return;
    setList((p) => {
      const n = [...p];
      const [m] = n.splice(from, 1);
      n.splice(to, 0, m);
      return n;
    });
    setOrderDirty(true);
  };
  const onDrop = (target: number) => {
    if (dragIndex === null || dragIndex === target) return setDragIndex(null);
    move(dragIndex, target);
    setDragIndex(null);
  };
  const saveOrder = async () => {
    setBusy(true);
    const res = await reorderTestimonials(list.map((t) => t.id));
    setBusy(false);
    if (res.ok) {
      setOrderDirty(false);
      flash({ type: "success", msg: "Order saved." });
      router.refresh();
    } else flash({ type: "error", msg: res.error || "Reorder failed." });
  };

  return (
    <div className="mt-8">
      {toast && (
        <div
          className={`fixed right-6 top-6 z-[60] rounded-xl px-4 py-3 text-sm font-medium shadow-soft-lg ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-surface p-4 shadow-soft">
        <p className="text-sm text-muted">
          <span className="font-semibold text-ink">{list.length}</span> testimonial
          {list.length === 1 ? "" : "s"} ·{" "}
          <span className="font-semibold text-green-600">
            {list.filter((t) => t.active).length}
          </span>{" "}
          active
        </p>
        <div className="flex items-center gap-2">
          <a
            href={`${WEBSITE_URL}/#testimonials`}
            target="_blank"
            className="text-xs text-primary hover:underline"
          >
            Preview on site ↗
          </a>
          {orderDirty && (
            <button
              onClick={saveOrder}
              disabled={busy}
              className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-60"
            >
              Save order
            </button>
          )}
          <button onClick={openAdd} className="btn btn-primary !px-5 !py-2.5 !text-sm">
            + Add testimonial
          </button>
        </div>
      </div>

      {/* empty state */}
      {list.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-ink/15 bg-surface p-10 text-center">
          <p className="text-sm text-muted">No testimonials yet.</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button onClick={openAdd} className="btn btn-primary !px-5 !py-2.5 !text-sm">
              + Add your first testimonial
            </button>
            <button
              onClick={seed}
              disabled={busy}
              className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary disabled:opacity-60"
            >
              Import 12 sample testimonials
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((t, i) => (
            <article
              key={t.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              className={`flex flex-col rounded-2xl border bg-surface p-5 shadow-soft transition-shadow ${
                dragIndex === i ? "border-primary opacity-60" : "border-ink/10"
              } ${!t.active ? "opacity-70" : ""}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-1 cursor-grab select-none text-muted active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  ⠿
                </span>
                {t.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.photo_url}
                    alt={t.name}
                    className="h-12 w-12 shrink-0 rounded-xl object-cover ring-1 ring-ink/10"
                  />
                ) : (
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary font-display text-sm font-bold text-white">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-semibold">{t.name}</p>
                  <p className="truncate text-xs text-muted">
                    {[t.role, t.company].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    t.active
                      ? "bg-green-100 text-green-700"
                      : "bg-ink/[0.06] text-muted"
                  }`}
                >
                  {t.active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-3 flex gap-0.5 text-sm text-accent">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <span key={s}>★</span>
                ))}
              </div>

              <div
                className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink/80 [&_a]:text-primary [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: `&ldquo;${t.quote}&rdquo;` }}
              />

              <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-ink/[0.06] pt-3">
                <button
                  onClick={() => openEdit(t)}
                  className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary"
                >
                  Edit
                </button>
                <button
                  onClick={() => togglePublish(t)}
                  disabled={busy}
                  className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary disabled:opacity-60"
                >
                  {t.active ? "Unpublish" : "Publish"}
                </button>
                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                    className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 text-xs text-muted hover:text-ink disabled:opacity-30"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(i, i + 1)}
                    disabled={i === list.length - 1}
                    className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 text-xs text-muted hover:text-ink disabled:opacity-30"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => remove(t)}
                    disabled={busy}
                    className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 text-xs text-muted hover:border-red-300 hover:text-red-500 disabled:opacity-30"
                    aria-label="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* add/edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft-lg">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">
                {editingId ? "Edit testimonial" : "Add testimonial"}
              </h2>
              <button
                onClick={closeModal}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-ink/[0.05] hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-[1fr_1.2fr]">
              {/* left: photo + meta */}
              <div className="space-y-4">
                <div>
                  <span className="mb-1 block text-xs font-medium text-muted">
                    Customer photo
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-ink/10 bg-base">
                      {form.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={form.photo_url}
                          alt="preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl text-muted">🖼</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        ref={photoInput}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => pickPhoto(e.target.files?.[0])}
                      />
                      <button
                        type="button"
                        onClick={() => photoInput.current?.click()}
                        disabled={photoBusy}
                        className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary disabled:opacity-60"
                      >
                        {photoBusy
                          ? "Optimizing…"
                          : form.photo_url
                          ? "Replace"
                          : "Upload"}
                      </button>
                      {form.photo_url && (
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, photo_url: null }))}
                          className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted hover:border-red-300 hover:text-red-500"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted">
                    JPG, PNG or WebP — auto-optimized to a small WebP avatar.
                  </p>
                  {photoErr && <p className="mt-1 text-xs text-red-500">{photoErr}</p>}
                </div>

                <Field label="Rating">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, rating: n }))}
                        className={`text-2xl leading-none transition-colors ${
                          n <= form.rating ? "text-accent" : "text-ink/20 hover:text-accent/50"
                        }`}
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-2 text-xs text-muted">{form.rating}/5</span>
                  </div>
                </Field>

                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  />
                  Active (visible on site)
                </label>
              </div>

              {/* right: text fields */}
              <div className="space-y-3">
                <Field label="Customer name *">
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Arjun Mehta"
                    className="input"
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Designation">
                    <input
                      value={form.role}
                      onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                      placeholder="e.g. CEO"
                      className="input"
                    />
                  </Field>
                  <Field label="Company">
                    <input
                      value={form.company}
                      onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                      placeholder="e.g. Nexa Retail"
                      className="input"
                    />
                  </Field>
                </div>
                <Field label="Testimonial content *">
                  <RichEditor
                    value={form.quote}
                    onChange={(html) => setForm((f) => ({ ...f, quote: html }))}
                  />
                </Field>
              </div>
            </div>

            {formErr && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {formErr}
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={closeModal}
                disabled={busy || photoBusy}
                className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:text-ink disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={busy || photoBusy}
                className="btn btn-primary !px-5 !py-2.5 !text-sm disabled:opacity-60"
              >
                {busy ? "Saving…" : editingId ? "Save changes" : "Add & publish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
