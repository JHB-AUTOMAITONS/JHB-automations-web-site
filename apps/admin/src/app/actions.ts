"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@jhb/shared/supabase/server";
import { getAuthorPublisherDraftDoc } from "@jhb/shared/content-server";
import type { AuthorPublisherDoc } from "@jhb/shared/content";
import { testimonials as fallbackTestimonials } from "@jhb/shared/data";
import { extractHrefs, seedWhatsIncluded, type ServicePagePayload } from "@jhb/shared/service-pages";
import { HOME_FAQ_DEFAULTS } from "@jhb/shared/home-faqs";
import type { PageContainer } from "@jhb/shared/containers";

async function getStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("jhb_profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, user, profile };
}

async function requireAdmin() {
  const ctx = await getStaff();
  if (ctx.profile?.role !== "admin") {
    return { ...ctx, ok: false as const };
  }
  return { ...ctx, ok: true as const };
}

async function log(action: string, detail: string) {
  try {
    const { supabase, user } = await getStaff();
    await supabase.from("jhb_activity_log").insert({
      user_id: user.id,
      user_email: user.email,
      action,
      detail,
    });
  } catch {
    /* non-fatal */
  }
}

// Save a full-content version snapshot for a module so an admin can restore it
// later. Non-fatal: a snapshot failure must never block the actual save.
async function snapshot(module: string, label: string, data: unknown, summary: string) {
  try {
    const { supabase, user } = await getStaff();
    const { data: last } = await supabase
      .from("jhb_versions")
      .select("version_number")
      .eq("module", module)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    const version_number = ((last?.version_number as number | undefined) ?? 0) + 1;
    await supabase.from("jhb_versions").insert({
      module,
      label,
      version_number,
      data: data as Record<string, unknown>,
      summary,
      user_id: user.id,
      user_email: user.email,
    });
  } catch {
    /* non-fatal */
  }
}

export async function saveContent(key: string, data: Record<string, unknown>) {
  const { supabase, user } = await getStaff();
  const { error } = await supabase
    .from("jhb_content")
    .upsert(
      { key, data, updated_at: new Date().toISOString(), updated_by: user.id },
      { onConflict: "key" }
    );
  if (error) return { ok: false, error: error.message };
  await log("content.update", `Updated content block "${key}"`);
  revalidatePath("/");
  revalidatePath("/home");
  return { ok: true };
}

// JHB Automation Tools hub — one editable document in jhb_content ("tools_hub").
export async function saveToolsHub(data: Record<string, unknown>) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;
  const { error } = await supabase.from("jhb_content").upsert(
    { key: "tools_hub", data, updated_at: new Date().toISOString(), updated_by: user.id },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };
  await log("tools_hub.update", "Updated JHB Automation Tools hub");
  await snapshot("tools_hub", "JHB Automation Tools", data, "Updated Automation Tools hub");
  revalidatePath("/jhb-automation-tools");
  revalidatePath("/");
  return { ok: true };
}

// JHB Products — one editable document in jhb_content ("products").
export async function saveProducts(data: Record<string, unknown>) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;
  const { error } = await supabase.from("jhb_content").upsert(
    { key: "products", data, updated_at: new Date().toISOString(), updated_by: user.id },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };
  await log("products.update", "Updated JHB Products");
  await snapshot("products", "JHB Products", data, "Updated JHB Products");
  revalidatePath("/", "layout"); // nav dropdown
  revalidatePath("/vasool-app");
  revalidatePath("/about-vasool");
  return { ok: true };
}

// Products draft — saves to "products_draft"; public pages are unaffected until
// publishProducts() is called.
export async function saveProductsDraft(data: Record<string, unknown>) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;
  const { error } = await supabase.from("jhb_content").upsert(
    { key: "products_draft", data, updated_at: new Date().toISOString(), updated_by: user.id },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };
  await log("products.draft", "Saved products draft");
  return { ok: true };
}

// Publish Products — copies current data to "products" and revalidates public pages.
export async function publishProducts(data: Record<string, unknown>) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;
  const now = new Date().toISOString();
  await supabase.from("jhb_content").upsert(
    { key: "products_draft", data, updated_at: now, updated_by: user.id },
    { onConflict: "key" }
  );
  const { error } = await supabase.from("jhb_content").upsert(
    { key: "products", data, updated_at: now, updated_by: user.id },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };
  await log("products.publish", "Published JHB Products");
  await snapshot("products", "JHB Products", data, "Published JHB Products");
  revalidatePath("/", "layout");
  revalidatePath("/vasool-app");
  revalidatePath("/about-vasool");
  return { ok: true };
}

// About page — one editable document in jhb_content ("about").
export async function saveAbout(data: Record<string, unknown>) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;
  const { error } = await supabase.from("jhb_content").upsert(
    { key: "about", data, updated_at: new Date().toISOString(), updated_by: user.id },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };
  await log("about.update", "Updated About page");
  await snapshot("about", "About Page", data, "Updated About page");
  revalidatePath("/about");
  return { ok: true };
}

// About page draft — saves to "about_draft" key; does NOT revalidate the public
// /about route so changes stay invisible to visitors until publishAbout() is called.
export async function saveAboutDraft(data: Record<string, unknown>) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;
  const { error } = await supabase.from("jhb_content").upsert(
    { key: "about_draft", data, updated_at: new Date().toISOString(), updated_by: user.id },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };
  await log("about.draft", "Saved about page draft");
  return { ok: true };
}

// Publish About page — saves data to both draft and published keys then
// revalidates the public /about route.
export async function publishAbout(data: Record<string, unknown>) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;
  const now = new Date().toISOString();
  // Keep draft in sync
  await supabase.from("jhb_content").upsert(
    { key: "about_draft", data, updated_at: now, updated_by: user.id },
    { onConflict: "key" }
  );
  const { error } = await supabase.from("jhb_content").upsert(
    { key: "about", data, updated_at: now, updated_by: user.id },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };
  await log("about.publish", "Published about page");
  await snapshot("about", "About Page", data, "Published about page");
  revalidatePath("/about");
  return { ok: true };
}

// Partners "Powered by" strip — one editable document in jhb_content ("partners").
export async function savePartners(data: Record<string, unknown>) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;
  const { error } = await supabase.from("jhb_content").upsert(
    { key: "partners", data, updated_at: new Date().toISOString(), updated_by: user.id },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };
  await log("partners.update", "Updated Partners strip");
  await snapshot("partners", "Partners", data, "Updated Partners strip");
  revalidatePath("/");
  return { ok: true };
}

export async function saveSettings(data: Record<string, unknown>) {
  const { supabase, user } = await getStaff();
  const { error } = await supabase
    .from("jhb_settings")
    .upsert(
      {
        key: "site",
        data,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      },
      { onConflict: "key" }
    );
  if (error) return { ok: false, error: error.message };
  await log("settings.update", "Updated website settings");
  await snapshot("settings", "Site Settings", data, "Updated website settings");
  revalidatePath("/", "layout");
  revalidatePath("/settings");
  return { ok: true };
}

// Logo Management — saves the same site-settings document but logs a
// logo-specific activity entry, and snapshots into the shared "settings"
// version chain so Restore works uniformly from Version History.
export async function saveBranding(data: Record<string, unknown>) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can manage logos." };
  const { supabase, user } = ctx;
  const { error } = await supabase
    .from("jhb_settings")
    .upsert(
      { key: "site", data, updated_at: new Date().toISOString(), updated_by: user.id },
      { onConflict: "key" }
    );
  if (error) return { ok: false, error: error.message };
  await log("logo.update", "Logo Management settings changed");
  await snapshot("settings", "Site Settings", data, "Logo Management settings changed");
  revalidatePath("/", "layout");
  revalidatePath("/branding");
  return { ok: true };
}

export async function uploadMedia(formData: FormData) {
  const { supabase, user } = await getStaff();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { ok: false, error: "No file selected" };
  const alt = ((formData.get("alt") as string) || "").trim();
  const title = ((formData.get("title") as string) || "").trim();

  const ext = file.name.split(".").pop() || "bin";
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${safe}`;

  const { error: upErr } = await supabase.storage
    .from("jhb-media")
    // Long cache: filenames are unique (Date.now() prefix), so a 1-year
    // immutable cache header lets the CDN/browser serve images fast on repeat.
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: "31536000",
    });
  if (upErr) return { ok: false, error: upErr.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("jhb-media").getPublicUrl(path);

  const { error: dbErr } = await supabase.from("jhb_media").insert({
    name: file.name,
    path,
    url: publicUrl,
    size: file.size,
    mime: file.type || ext,
    uploaded_by: user.id,
    alt_text: alt || null,
    image_title: title || null,
    alt_updated_at: alt ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  });
  if (dbErr) return { ok: false, error: dbErr.message };

  await log("media.upload", `Uploaded "${file.name}"`);
  revalidatePath("/media");
  return { ok: true, url: publicUrl };
}

// Rename an image's DISPLAY name only (image_filename). The storage path and
// public URL are never touched, so every existing reference keeps working.
export async function renameMedia(id: string, name: string) {
  const { supabase } = await getStaff();
  const n = name.trim();
  if (!n) return { ok: false, error: "Name can't be empty" };
  const { error } = await supabase
    .from("jhb_media")
    .update({ image_filename: n, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  await log("media.rename", `Renamed media to "${n}"`);
  revalidatePath("/media");
  return { ok: true };
}

// Replace an image's file IN PLACE — overwrites the same storage path (upsert),
// so the public URL is unchanged and every page using this image updates at once.
export async function replaceMedia(id: string, path: string, formData: FormData) {
  const { supabase } = await getStaff();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { ok: false, error: "No file selected" };
  const { error: upErr } = await supabase.storage
    .from("jhb-media")
    // Shorter cache than a fresh upload so the new image shows soon; the URL
    // (a permanent reference) is intentionally kept the same.
    .upload(path, file, { contentType: file.type, upsert: true, cacheControl: "3600" });
  if (upErr) return { ok: false, error: upErr.message };
  const { error: dbErr } = await supabase
    .from("jhb_media")
    .update({ size: file.size, mime: file.type, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (dbErr) return { ok: false, error: dbErr.message };
  await log("media.replace", `Replaced image at "${path}"`);
  revalidatePath("/media");
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---- Image Alt Text (SEO / accessibility) ----

// Fetch the current alt text for an image by its public URL (used by ImagePicker).
export async function getMediaAlt(url: string) {
  if (!url) return { ok: true, alt: "" };
  const { supabase } = await getStaff();
  const { data } = await supabase
    .from("jhb_media")
    .select("alt_text")
    .eq("url", url)
    .maybeSingle();
  return { ok: true, alt: (data?.alt_text as string | null) ?? "" };
}

// List all image media (id/name/url/alt/title) for the in-editor image picker —
// so "Insert Image" can browse and reuse existing uploads, not just upload new.
export async function listMedia() {
  const { supabase } = await getStaff();
  const { data } = await supabase
    .from("jhb_media")
    .select("id, name, url, alt_text, image_title")
    .like("mime", "image/%")
    .order("created_at", { ascending: false });
  return {
    ok: true as const,
    items: (data ?? []) as { id: string; name: string; url: string; alt_text: string | null; image_title: string | null }[],
  };
}

// Save alt text for an image identified by its URL (used by ImagePicker on blur).
export async function updateMediaAltByUrl(url: string, alt: string) {
  const { supabase } = await getStaff();
  if (!url) return { ok: false, error: "Missing image URL" };
  const { error, count } = await supabase
    .from("jhb_media")
    .update(
      { alt_text: alt.trim() || null, alt_updated_at: new Date().toISOString() },
      { count: "exact" }
    )
    .eq("url", url);
  if (error) return { ok: false, error: error.message };
  await log("media.alt", `Updated alt text for image`);
  revalidatePath("/media");
  revalidatePath("/", "layout"); // refresh public pages that embed this image
  return { ok: true, matched: count ?? 0 };
}

// Save alt text for a single media row by id (Image SEO per-row save).
export async function updateMediaAlt(id: string, alt: string) {
  const { supabase } = await getStaff();
  const { error } = await supabase
    .from("jhb_media")
    .update({ alt_text: alt.trim() || null, alt_updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  await log("media.alt", `Updated alt text for media ${id}`);
  revalidatePath("/media");
  revalidatePath("/", "layout"); // refresh public pages that embed this image
  return { ok: true };
}

// Save full SEO metadata for a Media Library row.
export type MediaSeoFields = {
  alt: string;
  title: string;
  caption?: string;
  description?: string;
  keywords?: string[];
  filename?: string;
  ogTitle?: string;
  ogDescription?: string;
};

export async function updateMediaMeta(id: string, fields: MediaSeoFields) {
  const { supabase } = await getStaff();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("jhb_media")
    .update({
      alt_text: fields.alt.trim() || null,
      image_title: fields.title.trim() || null,
      image_caption: fields.caption?.trim() || null,
      image_description: fields.description?.trim() || null,
      image_keywords: (fields.keywords ?? []).map((k) => k.trim()).filter(Boolean),
      image_filename: fields.filename?.trim() || null,
      og_title: fields.ogTitle?.trim() || null,
      og_description: fields.ogDescription?.trim() || null,
      alt_updated_at: now,
      updated_at: now,
    })
    .eq("id", id);
  if (error) {
    console.error(`[media-seo] save FAILED id=${id}:`, error.message);
    return { ok: false, error: error.message };
  }
  await log("media.meta", `Updated image SEO for media ${id}`);
  revalidatePath("/media");
  revalidatePath("/", "layout"); // refresh public pages that embed this image
  return { ok: true };
}

// Optional setting: require alt text before images can be saved/published.
export async function setImageSeoRequireAlt(requireAlt: boolean) {
  const { supabase, user } = await getStaff();
  const { error } = await supabase.from("jhb_settings").upsert(
    {
      key: "image_seo",
      data: { requireAlt },
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };
  await log("media.settings", `Set require-alt to ${requireAlt}`);
  revalidatePath("/media");
  return { ok: true };
}

// Bulk-save alt text for many images (Image SEO "Save all").
export async function bulkUpdateMediaAlt(items: { id: string; alt: string }[]) {
  const { supabase } = await getStaff();
  const now = new Date().toISOString();
  for (const it of items) {
    const { error } = await supabase
      .from("jhb_media")
      .update({ alt_text: it.alt.trim() || null, alt_updated_at: now })
      .eq("id", it.id);
    if (error) return { ok: false, error: error.message };
  }
  await log("media.alt", `Bulk-updated alt text for ${items.length} images`);
  revalidatePath("/media");
  revalidatePath("/", "layout"); // refresh public pages that embed these images
  return { ok: true };
}

export async function deleteMedia(id: string, path: string) {
  const { supabase } = await getStaff();
  await supabase.storage.from("jhb-media").remove([path]);
  const { error } = await supabase.from("jhb_media").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await log("media.delete", `Deleted media "${path}"`);
  revalidatePath("/media");
  return { ok: true };
}

export async function saveSeo(
  path: string,
  data: { title: string; description: string; keywords: string; og_image: string }
) {
  const { supabase, user } = await getStaff();
  const { error } = await supabase.from("jhb_seo").upsert(
    {
      path,
      title: data.title,
      description: data.description,
      keywords: data.keywords,
      og_image: data.og_image || null,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    },
    { onConflict: "path" }
  );
  if (error) return { ok: false, error: error.message };
  await log("seo.update", `Updated SEO for "${path}"`);
  await snapshot(`seo:${path}`, `SEO — ${path}`, data, `Updated SEO for ${path}`);
  revalidatePath(path);
  revalidatePath("/seo");
  return { ok: true };
}

export async function deleteSeo(path: string) {
  const { supabase } = await getStaff();
  const { error } = await supabase.from("jhb_seo").delete().eq("path", path);
  if (error) return { ok: false, error: error.message };
  await log("seo.delete", `Deleted SEO override for "${path}"`);
  revalidatePath(path);
  revalidatePath("/seo");
  return { ok: true };
}

export type HomeSeoPayload = {
  title: string;
  meta_title: string;
  description: string;
  keywords: string;
  canonical: string;
  og_title: string;
  og_description: string;
  og_image: string;
  robots: string;
  structured_data: string;
  seo_content: string;
  slug: string;
};

// Home page slug: empty or "/" means the root URL; anything else is slugified
// with a single leading slash. We never auto-generate "/home".
function normHomeSlug(raw: string): string {
  const s = (raw || "").trim();
  if (s === "" || s === "/") return "/";
  const cleaned = toSlug(s);
  return cleaned ? `/${cleaned}` : "/";
}

export async function saveHomeSeo(payload: HomeSeoPayload) {
  const { supabase, user } = await getStaff();

  // Validate JSON-LD if provided.
  const sd = (payload.structured_data || "").trim();
  if (sd) {
    try {
      JSON.parse(sd);
    } catch {
      return { ok: false, error: "Structured Data (JSON-LD) must be valid JSON." };
    }
  }

  const slug = normHomeSlug(payload.slug);
  // Duplicate-slug guard: no other page may use the same (non-root) slug.
  if (slug !== "/") {
    const { data: dup } = await supabase
      .from("jhb_seo")
      .select("path")
      .eq("slug", slug)
      .neq("path", "/")
      .maybeSingle();
    if (dup) return { ok: false, error: `That slug is already used by "${dup.path}".` };
  }

  const { error } = await supabase.from("jhb_seo").upsert(
    {
      path: "/",
      title: payload.title.trim() || null,
      meta_title: payload.meta_title.trim() || null,
      description: payload.description.trim() || null,
      keywords: payload.keywords.trim() || null,
      canonical: payload.canonical.trim() || null,
      og_title: payload.og_title.trim() || null,
      og_description: payload.og_description.trim() || null,
      og_image: payload.og_image.trim() || null,
      robots: payload.robots.trim() || null,
      structured_data: sd || null,
      seo_content: payload.seo_content.trim() || null,
      slug,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    },
    { onConflict: "path" }
  );
  if (error) {
    // Most likely the new columns don't exist yet — point the admin at the migration.
    return {
      ok: false,
      error:
        error.message +
        " (If this mentions a missing column, run the jhb_seo migration SQL first.)",
    };
  }
  await log("seo.home.save", "Updated Home Page SEO");
  await snapshot("seo:/", "SEO — Home", payload, "Updated Home Page SEO");
  revalidatePath("/");
  revalidatePath("/seo");
  return { ok: true };
}

// Self-service schema repair for Admin → SEO. Calls the SECURITY DEFINER
// function installed by supabase/migrations/jhb_seo_setup.sql, which adds any
// missing jhb_seo columns and reloads the PostgREST schema cache. If the
// function isn't installed yet, we return a clear instruction to run the SQL
// once (the very first bootstrap can't create the function from the client).
export async function runSeoMigration() {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can run the SEO migration." };
  const { supabase } = ctx;

  const { data, error } = await supabase.rpc("jhb_seo_run_migration");
  if (error) {
    const missing =
      error.code === "PGRST202" ||
      /jhb_seo_run_migration|function .* does not exist|schema cache/i.test(error.message);
    if (missing) {
      return {
        ok: false,
        needsSql: true,
        error:
          "First-time setup: open the Supabase SQL Editor and run " +
          "supabase/migrations/jhb_seo_setup.sql once. After that, this button " +
          "will repair the schema and reload the cache on its own.",
      };
    }
    return { ok: false, error: error.message };
  }

  await log("seo.migration", "Ran jhb_seo schema migration");
  revalidatePath("/seo");
  return { ok: true, columns: (data as { columns?: string[] } | null)?.columns ?? [] };
}

export async function updateLeadStatus(id: number, status: string) {
  const { supabase } = await getStaff();
  const { error } = await supabase
    .from("jhb_leads")
    .update({ status })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/leads");
  return { ok: true };
}

export async function deleteLead(id: number) {
  const { supabase } = await getStaff();
  const { error } = await supabase.from("jhb_leads").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await log("lead.delete", `Deleted lead #${id}`);
  revalidatePath("/leads");
  return { ok: true };
}

// Slugs that collide with existing top-level routes. Service pages now live at the
// root (/[slug]), so a reserved slug would be shadowed by a real page and 404.
const RESERVED_SLUGS = new Set([
  "about", "contact", "blog", "services", "products",
  "jhb-automation-tools", "admin", "dashboard", "login", "api",
  "sitemap.xml", "robots.txt", "favicon.ico", "_next",
]);

export async function saveService(
  key: string,
  data: {
    slug: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
  }
) {
  const { supabase, user } = await getStaff();
  // Same normalisation as service-page slugs (accepts a bare slug or a full URL,
  // lowercase, spaces/invalid -> hyphen, collapse repeats, trim) so both editors
  // store identical, valid slugs.
  const slug = toSlug(data.slug);
  if (!slug) return { ok: false, error: "Slug cannot be empty" };
  if (RESERVED_SLUGS.has(slug))
    return {
      ok: false,
      error: `"${slug}" is a reserved path and can't be used as a service slug. Choose a different slug.`,
    };

  const { error } = await supabase
    .from("jhb_services")
    .update({
      slug,
      meta_title: data.meta_title || null,
      meta_description: data.meta_description || null,
      meta_keywords: data.meta_keywords || null,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("key", key);

  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "That slug is already used by another service." };
    return { ok: false, error: error.message };
  }
  await log("service.update", `Updated service "${key}" (slug: ${slug})`);
  revalidatePath("/", "layout");
  revalidatePath("/services");
  revalidatePath(`/${slug}`);
  return { ok: true, slug };
}

// ---- Service Links (internal/external link management) ----

export async function saveServiceLinks(
  key: string,
  items: {
    anchor_text: string;
    url: string;
    new_tab: boolean;
    link_type?: "dofollow" | "nofollow";
    sponsored?: boolean;
    ugc?: boolean;
  }[]
) {
  const { supabase } = await getStaff();
  const clean = items
    .map((i) => {
      const url = i.url.trim();
      const external = /^https?:\/\//i.test(url);
      return {
        anchor_text: i.anchor_text.trim(),
        url,
        type: external ? "external" : "internal",
        new_tab: i.new_tab || external,
        link_type: i.link_type === "nofollow" ? "nofollow" : "dofollow",
        sponsored: !!i.sponsored,
        ugc: !!i.ugc,
      };
    })
    .filter((i) => i.anchor_text && i.url);

  const del = await supabase
    .from("jhb_service_links")
    .delete()
    .eq("service_key", key);
  if (del.error) return { ok: false, error: del.error.message };

  if (clean.length > 0) {
    const rows = clean.map((i, idx) => ({
      service_key: key,
      anchor_text: i.anchor_text,
      url: i.url,
      type: i.type,
      new_tab: i.new_tab,
      link_type: i.link_type,
      sponsored: i.sponsored,
      ugc: i.ugc,
      sort_order: idx,
      updated_at: new Date().toISOString(),
    }));
    const ins = await supabase.from("jhb_service_links").insert(rows);
    if (ins.error) return { ok: false, error: ins.error.message };
  }

  await log("links.update", `Updated links for service "${key}"`);
  revalidatePath("/links");
  return { ok: true };
}

// ---- Testimonials (Super Admin only) ----

export type TestimonialInput = {
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  photo_url: string | null;
  active: boolean;
};

// Validate + normalize a testimonial payload. Returns an error string or null.
function validateTestimonial(input: Partial<TestimonialInput>) {
  const name = (input.name ?? "").trim();
  const quote = (input.quote ?? "").trim();
  if (!name) return { error: "Customer name is required." };
  if (!quote) return { error: "Testimonial content is required." };
  const rating = Math.min(5, Math.max(1, Math.round(Number(input.rating) || 5)));
  const photo = (input.photo_url ?? "").trim();
  return {
    error: null as null,
    clean: {
      name,
      role: (input.role ?? "").trim(),
      company: (input.company ?? "").trim(),
      quote,
      rating,
      photo_url: photo || null,
      active: input.active !== false,
    },
  };
}

export async function createTestimonial(input: TestimonialInput) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;

  const v = validateTestimonial(input);
  if (v.error || !v.clean) return { ok: false, error: v.error ?? "Invalid input." };

  // Place new testimonial at the end.
  const { data: last } = await supabase
    .from("jhb_testimonials")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (last?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("jhb_testimonials").insert({
    ...v.clean,
    sort_order,
    updated_by: user.id,
  });
  if (error) return { ok: false, error: error.message };

  await log("testimonial.create", `Added testimonial from "${v.clean.name}"`);
  revalidatePath("/");
  revalidatePath("/testimonials");
  return { ok: true };
}

export async function updateTestimonial(id: string, input: TestimonialInput) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;

  const v = validateTestimonial(input);
  if (v.error || !v.clean) return { ok: false, error: v.error ?? "Invalid input." };

  const { error } = await supabase
    .from("jhb_testimonials")
    .update({ ...v.clean, updated_at: new Date().toISOString(), updated_by: user.id })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await log("testimonial.update", `Updated testimonial from "${v.clean.name}"`);
  revalidatePath("/");
  revalidatePath("/testimonials");
  return { ok: true };
}

export async function deleteTestimonial(id: string) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase } = ctx;

  const { error } = await supabase.from("jhb_testimonials").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  await log("testimonial.delete", `Deleted testimonial ${id}`);
  revalidatePath("/");
  revalidatePath("/testimonials");
  return { ok: true };
}

export async function setTestimonialActive(id: string, active: boolean) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;

  const { error } = await supabase
    .from("jhb_testimonials")
    .update({ active, updated_at: new Date().toISOString(), updated_by: user.id })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await log(
    "testimonial.publish",
    `${active ? "Published" : "Unpublished"} testimonial ${id}`
  );
  revalidatePath("/");
  revalidatePath("/testimonials");
  return { ok: true };
}

export async function reorderTestimonials(ids: string[]) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;

  // Persist the new order one row at a time (small lists; keeps it simple/safe).
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from("jhb_testimonials")
      .update({ sort_order: i, updated_by: user.id })
      .eq("id", ids[i]);
    if (error) return { ok: false, error: error.message };
  }

  await log("testimonial.reorder", `Reordered ${ids.length} testimonials`);
  revalidatePath("/");
  revalidatePath("/testimonials");
  return { ok: true };
}

// One-click import of the built-in sample testimonials (only when table empty).
export async function seedTestimonials() {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;

  const { count } = await supabase
    .from("jhb_testimonials")
    .select("id", { count: "exact", head: true });
  if ((count ?? 0) > 0)
    return { ok: false, error: "Testimonials already exist — nothing to import." };

  const rows = fallbackTestimonials.map((t, i) => ({
    name: t.name,
    role: t.role,
    company: t.company,
    quote: t.quote,
    rating: t.rating,
    photo_url: null,
    sort_order: i,
    active: true,
    updated_by: user.id,
  }));
  const { error } = await supabase.from("jhb_testimonials").insert(rows);
  if (error) return { ok: false, error: error.message };

  await log("testimonial.seed", `Imported ${rows.length} sample testimonials`);
  revalidatePath("/");
  revalidatePath("/testimonials");
  return { ok: true };
}

// ---- Service Page Editor (Super Admin only) ----

// A feature "Word Link" may be empty, an internal path/anchor, mailto/tel, or
// an absolute http(s) URL.
const featureUrlOk = (u: string) => {
  const s = u.trim();
  if (!s) return true;
  if (s.startsWith("/") || s.startsWith("#")) return true;
  if (/^(mailto:|tel:)/i.test(s)) return true;
  try {
    const x = new URL(s);
    return x.protocol === "http:" || x.protocol === "https:";
  } catch {
    return false;
  }
};

// Validate + normalise a service-page payload into the clean CONTENT object that
// is stored (as the draft) and later promoted (into the live content columns).
// Returns the content with column-matching keys, or a user-facing error. Status
// and timestamps are NOT part of content — the caller sets those.
function buildServiceContent(
  key: string,
  payload: ServicePagePayload
): { ok: true; content: Record<string, unknown> } | { ok: false; error: string } {
  // Normalise the slug (lowercase, spaces/invalid -> hyphen, collapse repeats,
  // trim) rather than rejecting messy-but-fixable input. Fall back to the page
  // key (the original slug) so a blank slug never blocks a content save.
  const slug = toSlug(payload.slug || "") || slugify(key);
  if (!slug) return { ok: false, error: "Could not generate a valid slug." };
  if (RESERVED_SLUGS.has(slug))
    return {
      ok: false,
      error: `"${slug}" is a reserved path and can't be used as a service slug. Choose a different slug.`,
    };

  // Normalise + validate feature list (incl. the per-feature "Word Link").
  // These are the "What's Included" cards, so we also carry the richer optional
  // fields (id / icon / image) added for that editable section.
  const features = (payload.features ?? []).map((f) => ({
    title: (f.title || "").trim(),
    desc: (f.desc || "").trim(),
    link: (f.link || "").trim(),
    linkText: (f.linkText || "").trim(),
    id: (f.id || "").trim(),
    icon: (f.icon || "").trim(),
    image: typeof f.image === "string" ? f.image.trim() : f.image ?? null,
  }));
  const badLink = features.find((f) => !featureUrlOk(f.link));
  if (badLink)
    return {
      ok: false,
      error: `Invalid Word Link for "${badLink.title || "a container"}": ${badLink.link} — use https://…, /path, #anchor, mailto:/tel:, or leave it empty.`,
    };
  // Persist a clean shape (omit empty optional fields so the JSON stays tidy).
  const cleanFeatures = features.map((f) => ({
    title: f.title,
    desc: f.desc,
    ...(f.link ? { link: f.link } : {}),
    ...(f.linkText ? { linkText: f.linkText } : {}),
    ...(f.id ? { id: f.id } : {}),
    ...(f.icon ? { icon: f.icon } : {}),
    ...(f.image ? { image: f.image } : {}),
  }));

  // Hero "Word Link" — same validation as feature links (empty or valid URL).
  const heroLink = (payload.hero_link || "").trim();
  if (!featureUrlOk(heroLink))
    return {
      ok: false,
      error: `Invalid Hero Word Link: ${heroLink} — use https://…, /path, #anchor, mailto:/tel:, or leave it empty.`,
    };

  return {
    ok: true,
    content: {
      slug,
      meta_title: payload.meta_title?.trim() || null,
      meta_description: payload.meta_description?.trim() || null,
      meta_keywords: payload.meta_keywords?.trim() || null,
      hero_heading: payload.hero_heading?.trim() || null,
      hero_highlight: payload.hero_highlight?.trim() || null,
      hero_tail: payload.hero_tail?.trim() || null,
      hero_description: payload.hero_description?.trim() || null,
      hero_link: heroLink || null,
      features: cleanFeatures,
      whats_included: payload.whats_included ?? seedWhatsIncluded(key),
      faq: payload.faq ?? [],
      why_choose: payload.why_choose ?? [],
      cta: payload.cta ?? null,
      image_url: payload.image_url || null,
      image_alt: payload.image_alt || null,
      image_title: payload.image_title || null,
      containers: payload.containers ?? [],
      chrome: payload.chrome ?? null,
    },
  };
}

// Save Draft — mirrors saveHomeDraft: writes ONLY the working draft. The live
// content columns + status are untouched, so the public page never changes until
// Publish is clicked.
export async function saveServicePage(key: string, payload: ServicePagePayload) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;

  const built = buildServiceContent(key, payload);
  if (!built.ok) return built;

  const now = new Date().toISOString();
  // Ensure a row exists so the draft has somewhere to live (slug is NOT NULL).
  // DO NOTHING on conflict so an existing page's live slug/content is preserved.
  await supabase
    .from("jhb_services")
    .upsert({ key, slug: slugify(key) }, { onConflict: "key", ignoreDuplicates: true });
  const { error } = await supabase
    .from("jhb_services")
    .update({ draft: built.content, draft_updated_at: now, updated_at: now, updated_by: user.id })
    .eq("key", key);
  if (error) {
    console.error(`[service-page] DRAFT SAVE FAILED key="${key}":`, error.message);
    return { ok: false, error: error.message };
  }
  await log("service.page.draft", `Saved draft for service page "${key}"`);
  await snapshot(`service_page:${key}`, `Service Page — ${key}`, built.content, `Saved draft for "${key}"`);
  revalidatePath("/service-pages");
  revalidatePath(`/service-pages/${key}`);
  return { ok: true, savedAt: now };
}

// Publish — mirrors publishHome: promotes the saved draft into the live content
// columns and flips status to "published". draft_updated_at is set equal to
// content_updated_at so there are no remaining "unpublished changes".
export async function publishServicePage(key: string) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;

  const { data } = await supabase
    .from("jhb_services")
    .select("draft")
    .eq("key", key)
    .maybeSingle();
  const draft = (data?.draft ?? null) as ServicePagePayload | null;
  if (!draft) return { ok: false, error: "Nothing to publish yet — save a draft first." };

  const built = buildServiceContent(key, draft);
  if (!built.ok) return built;

  const now = new Date().toISOString();
  const row = {
    key,
    ...built.content,
    status: "published",
    content_updated_at: now,
    draft_updated_at: now,
    updated_at: now,
    updated_by: user.id,
  };
  const { error } = await supabase.from("jhb_services").upsert(row, { onConflict: "key" });
  if (error) {
    console.error(`[service-page] PUBLISH FAILED key="${key}":`, error.message);
    return { ok: false, error: error.message };
  }
  await log("service.page.publish", `Published service page "${key}"`);
  await snapshot(`service_page:${key}`, `Service Page — ${key}`, row, `Published service page "${key}"`);
  revalidatePath("/service-pages");
  revalidatePath(`/service-pages/${key}`);
  return { ok: true, publishedAt: now };
}

export async function setServicePageStatus(key: string, status: "draft" | "published") {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;
  const { error } = await supabase
    .from("jhb_services")
    .update({ status, updated_at: new Date().toISOString(), updated_by: user.id })
    .eq("key", key);
  if (error) return { ok: false, error: error.message };
  await log("service.page.status", `Set "${key}" to ${status}`);
  revalidatePath("/service-pages");
  return { ok: true };
}

export async function duplicateServicePage(fromKey: string, toKey: string) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  if (fromKey === toKey) return { ok: false, error: "Choose a different target service." };
  const { supabase, user } = ctx;

  // Copy the SOURCE's full editable content (all content columns, draft-first so an
  // unsaved draft is copied too), then land it in the TARGET's DRAFT — NOT its live
  // columns. The previous version overwrote the target's LIVE content and flipped it
  // to draft, silently destroying a published target's page and copying only a
  // subset of fields. Writing to `draft` mirrors the Save Draft → Publish model:
  // the copy is a reviewable draft, and the target stays live/untouched until the
  // admin publishes.
  const CONTENT_COLS =
    "slug, meta_title, meta_description, meta_keywords, hero_heading, hero_highlight, hero_tail, hero_description, hero_link, features, whats_included, faq, why_choose, cta, image_url, image_alt, image_title, containers, chrome";
  const { data: src } = await supabase
    .from("jhb_services")
    .select(`${CONTENT_COLS}, draft`)
    .eq("key", fromKey)
    .maybeSingle();
  if (!src) return { ok: false, error: "Source has no saved content to copy." };

  const { draft: srcDraftRaw, ...srcLive } = src as Record<string, unknown>;
  const srcDraft =
    srcDraftRaw && typeof srcDraftRaw === "object" ? (srcDraftRaw as Record<string, unknown>) : {};
  // Editor-visible content = live columns overlaid by any saved draft.
  const effective = { ...srcLive, ...srcDraft };

  // Preserve the TARGET's own slug so its public URL never collides with the source
  // (key === slug by default for a target that has no row yet).
  const { data: tgt } = await supabase
    .from("jhb_services")
    .select("slug")
    .eq("key", toKey)
    .maybeSingle();
  const targetSlug = (tgt?.slug as string | undefined) ?? toKey;
  const targetDraft = { ...effective, slug: targetSlug };

  const now = new Date().toISOString();
  // upsert (not update): if the target has no row yet, insert one — slug satisfies
  // the NOT NULL constraint and status defaults to 'draft'. On an existing row only
  // draft/slug/timestamps are set, so live columns and published status are untouched.
  const { error } = await supabase
    .from("jhb_services")
    .upsert(
      { key: toKey, slug: targetSlug, draft: targetDraft, draft_updated_at: now, updated_at: now, updated_by: user.id },
      { onConflict: "key" },
    );
  if (error) return { ok: false, error: error.message };
  await log("service.page.duplicate", `Copied content "${fromKey}" → "${toKey}" (as a draft)`);
  revalidatePath("/service-pages");
  revalidatePath(`/service-pages/${toKey}`);
  return { ok: true };
}

// "Delete"/Reset for the fixed catalog: clears stored content (reverts to defaults).
export async function resetServicePage(key: string) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;
  const { error } = await supabase
    .from("jhb_services")
    .update({
      hero_heading: null,
      hero_highlight: null,
      hero_tail: null,
      hero_description: null,
      hero_link: null,
      features: [],
      whats_included: {},
      faq: [],
      why_choose: [],
      cta: null,
      image_url: null,
      image_alt: null,
      image_title: null,
      meta_title: null,
      meta_description: null,
      meta_keywords: null,
      containers: [],
      chrome: {},
      // Reset must also clear the DRAFT — getServicePage overlays `draft` over the
      // live columns, so a leftover draft would mask the reset in the editor AND
      // resurface the old content on the next Publish (buildServiceContent reads
      // the draft). Nulling it makes Reset revert to code defaults everywhere.
      draft: null,
      draft_updated_at: null,
      status: "draft",
      content_updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("key", key);
  if (error) return { ok: false, error: error.message };
  await log("service.page.reset", `Reset service page "${key}"`);
  revalidatePath("/service-pages");
  revalidatePath(`/service-pages/${key}`);
  return { ok: true };
}

// Link validation / broken-link check for editor content.
export async function checkServiceLinks(html: string, internalUrls: string[]) {
  await getStaff();
  const known = new Set(internalUrls);
  const seen = new Set<string>();
  const results: { href: string; type: string; ok: boolean; reason: string }[] = [];
  for (const href of extractHrefs(html)) {
    if (seen.has(href)) continue;
    seen.add(href);
    if (href.startsWith("#")) {
      results.push({ href, type: "anchor", ok: true, reason: "In-page anchor" });
    } else if (/^https?:\/\//i.test(href)) {
      results.push({ href, type: "external", ok: true, reason: "External (not auto-checked)" });
    } else if (href.startsWith("/")) {
      const base = href.split("#")[0].split("?")[0];
      const ok = known.has(base);
      results.push({
        href,
        type: "internal",
        ok,
        reason: ok ? "Resolves" : "Page not found — possible broken link",
      });
    } else {
      results.push({ href, type: "invalid", ok: false, reason: "Invalid/relative URL" });
    }
  }
  return { ok: true, results };
}

// ---- Home Page FAQ (Super Admin only) ----

export type HomeFaqInput = { question: string; answer: string; active: boolean };

export async function createHomeFaq(input: HomeFaqInput) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;
  const question = input.question.trim();
  const answer = input.answer.trim();
  if (!question) return { ok: false, error: "Question is required." };
  if (!answer) return { ok: false, error: "Answer is required." };
  const { data: last } = await supabase
    .from("jhb_home_faqs").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const { error } = await supabase.from("jhb_home_faqs").insert({
    question, answer, active: input.active !== false,
    sort_order: (last?.sort_order ?? -1) + 1, updated_by: user.id,
  });
  if (error) return { ok: false, error: error.message };
  await log("home_faq.create", `Added home FAQ`);
  revalidatePath("/"); revalidatePath("/home");
  return { ok: true };
}

export async function updateHomeFaq(id: string, input: HomeFaqInput) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;
  if (!input.question.trim() || !input.answer.trim())
    return { ok: false, error: "Question and answer are required." };
  const { error } = await supabase.from("jhb_home_faqs").update({
    question: input.question.trim(), answer: input.answer.trim(),
    active: input.active !== false, updated_at: new Date().toISOString(), updated_by: user.id,
  }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await log("home_faq.update", `Updated home FAQ ${id}`);
  revalidatePath("/"); revalidatePath("/home");
  return { ok: true };
}

export async function deleteHomeFaq(id: string) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { error } = await ctx.supabase.from("jhb_home_faqs").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await log("home_faq.delete", `Deleted home FAQ ${id}`);
  revalidatePath("/"); revalidatePath("/home");
  return { ok: true };
}

export async function setHomeFaqActive(id: string, active: boolean) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { error } = await ctx.supabase.from("jhb_home_faqs")
    .update({ active, updated_at: new Date().toISOString(), updated_by: ctx.user.id }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await log("home_faq.publish", `${active ? "Published" : "Unpublished"} home FAQ ${id}`);
  revalidatePath("/"); revalidatePath("/home");
  return { ok: true };
}

export async function reorderHomeFaqs(ids: string[]) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  for (let i = 0; i < ids.length; i++) {
    const { error } = await ctx.supabase.from("jhb_home_faqs")
      .update({ sort_order: i, updated_by: ctx.user.id }).eq("id", ids[i]);
    if (error) return { ok: false, error: error.message };
  }
  await log("home_faq.reorder", `Reordered ${ids.length} home FAQs`);
  revalidatePath("/"); revalidatePath("/home");
  return { ok: true };
}

export async function seedHomeFaqs() {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;
  const { count } = await supabase.from("jhb_home_faqs").select("id", { count: "exact", head: true });
  if ((count ?? 0) > 0) return { ok: false, error: "FAQs already exist — nothing to import." };
  const rows = HOME_FAQ_DEFAULTS.map((f, i) => ({
    question: f.question, answer: f.answer, sort_order: i, active: true, updated_by: user.id,
  }));
  const { error } = await supabase.from("jhb_home_faqs").insert(rows);
  if (error) return { ok: false, error: error.message };
  await log("home_faq.seed", `Imported ${rows.length} default FAQs`);
  revalidatePath("/"); revalidatePath("/home");
  return { ok: true };
}

// ---- Client Logos (Super Admin) ----

export async function updateClientLogo(
  id: string,
  fields: { logo_url: string | null; alt_text: string | null; active: boolean }
) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;
  const { error } = await supabase
    .from("jhb_client_logos")
    .update({
      logo_url: fields.logo_url || null,
      alt_text: fields.alt_text?.trim() || null,
      active: fields.active !== false,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  await log("client_logo.update", `Updated client logo ${id}`);
  revalidatePath("/");
  revalidatePath("/client-logos");
  return { ok: true };
}

export async function createClientLogo(name: string, logo_url?: string | null, alt_text?: string | null) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;
  const clean = (name ?? "").trim();
  if (!clean) return { ok: false, error: "Client name is required." };
  const { data: last } = await supabase
    .from("jhb_client_logos").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const { error } = await supabase.from("jhb_client_logos").insert({
    name: clean,
    logo_url: logo_url || null,
    alt_text: alt_text?.trim() || null,
    sort_order: (last?.sort_order ?? -1) + 1,
    active: true,
    updated_by: user.id,
  });
  if (error) return { ok: false, error: error.message };
  await log("client_logo.create", `Added client "${clean}"`);
  revalidatePath("/");
  revalidatePath("/client-logos");
  return { ok: true };
}

export async function deleteClientLogo(id: string) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { error } = await ctx.supabase.from("jhb_client_logos").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await log("client_logo.delete", `Deleted client ${id}`);
  revalidatePath("/");
  revalidatePath("/client-logos");
  return { ok: true };
}

export async function reorderClientLogos(ids: string[]) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  for (let i = 0; i < ids.length; i++) {
    const { error } = await ctx.supabase
      .from("jhb_client_logos")
      .update({ sort_order: i, updated_by: ctx.user.id })
      .eq("id", ids[i]);
    if (error) return { ok: false, error: error.message };
  }
  await log("client_logo.reorder", `Reordered ${ids.length} client logos`);
  revalidatePath("/");
  revalidatePath("/client-logos");
  return { ok: true };
}

const ASSIGNABLE_ROLES = ["admin", "editor", "viewer"];

export async function updateUserRole(id: string, role: string) {
  const { supabase, user, profile } = await getStaff();
  if (profile?.role !== "admin")
    return { ok: false, error: "Only an admin can change user roles." };
  if (id === user.id)
    return { ok: false, error: "You can't change your own role." };
  if (!ASSIGNABLE_ROLES.includes(role))
    return { ok: false, error: `Invalid role "${role}".` };
  const { error } = await supabase
    .from("jhb_profiles")
    .update({ role })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  await log("user.role", `Set role "${role}" for user ${id}`);
  revalidatePath("/users");
  return { ok: true };
}

// ---- Home Page Content Manager (Super Admin only) ----

export async function saveHomeDraft(data: Record<string, unknown>) {
  const { supabase, user, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Only Super Admin can edit the home page." };
  const { error } = await supabase
    .from("jhb_home")
    .upsert(
      { key: "draft", data, updated_at: new Date().toISOString(), updated_by: user.id },
      { onConflict: "key" }
    );
  if (error) return { ok: false, error: error.message };
  await log("home.draft", "Saved home page draft");
  await snapshot("home_draft", "Home Page", data, "Saved home page draft");
  revalidatePath("/home");
  return { ok: true };
}

export async function publishHome() {
  const { supabase, user, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Only Super Admin can publish the home page." };

  // Copy the current draft into the published row
  const { data: draft } = await supabase
    .from("jhb_home")
    .select("data")
    .eq("key", "draft")
    .maybeSingle();
  if (!draft) return { ok: false, error: "No draft to publish." };

  const { error } = await supabase
    .from("jhb_home")
    .upsert(
      {
        key: "published",
        data: draft.data,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      },
      { onConflict: "key" }
    );
  if (error) return { ok: false, error: error.message };
  await log("home.publish", "Published home page");
  revalidatePath("/home");
  return { ok: true };
}

// ---- Blog posts ----

type BlogFaqInput = { id: string; question: string; answer: string; visible: boolean };

type PostInput = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content_html: string;
  cover_image: string | null;
  category: string;
  tags: string[];
  author: string;
  meta_title: string;
  meta_description: string;
  status: "draft" | "published";
  containers?: PageContainer[];
  faqs?: BlogFaqInput[];
  faqs_enabled?: boolean;
};

function slugify(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Accept a bare slug OR a full URL/path and reduce it to just the slug, e.g.
// "https://jhbautomations.com/services/influencer-marketing/" -> "influencer-marketing".
function toSlug(raw: string) {
  let s = (raw || "").trim();
  if (s.includes("/")) {
    s = s.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]+/i, ""); // drop scheme://host
    s = s.split(/[?#]/)[0]; // drop query/hash
    const parts = s.split("/").filter(Boolean);
    if (parts.length) s = parts[parts.length - 1]; // last path segment
  }
  return slugify(s);
}

export async function savePost(input: PostInput) {
  const { supabase, user } = await getStaff();
  // Accept a bare slug, a title, or a pasted full URL for the slug field; fall
  // back to the title. toSlug strips a URL/path down to its last segment.
  const slug = toSlug(input.slug || "") || slugify(input.title);
  if (!slug) return { ok: false, error: "A title or slug is required." };
  if (!input.title.trim()) return { ok: false, error: "Title is required." };

  const now = new Date().toISOString();
  const base = {
    slug,
    title: input.title.trim(),
    excerpt: input.excerpt || null,
    content_html: input.content_html || null,
    cover_image: input.cover_image || null,
    category: input.category || null,
    tags: input.tags ?? [],
    author: input.author || "JHB Automations",
    meta_title: input.meta_title || null,
    meta_description: input.meta_description || null,
    status: input.status,
    containers: input.containers ?? [],
    updated_at: now,
    updated_by: user.id,
  };

  // FAQ columns ship in a later migration. Keep them in a separate object so a
  // database that hasn't run jhb_posts_faqs.sql yet can still save posts — we
  // detect the missing-column error and retry without these fields.
  const faqFields = {
    faqs: (input.faqs ?? []).map((f) => ({
      id: f.id,
      question: (f.question || "").trim(),
      answer: f.answer || "",
      visible: f.visible !== false,
    })),
    faqs_enabled: input.faqs_enabled !== false,
  };
  const missingFaqColumn = (e: { code?: string; message?: string } | null) =>
    !!e && (e.code === "PGRST204" || /faqs(_enabled)?/i.test(e.message || ""));

  const published_at_for = async () => {
    if (!input.id) return input.status === "published" ? now : null;
    const { data: existing } = await supabase
      .from("jhb_posts")
      .select("published_at")
      .eq("id", input.id)
      .maybeSingle();
    return existing?.published_at ?? (input.status === "published" ? now : null);
  };
  const published_at = await published_at_for();

  const run = (includeFaqs: boolean) => {
    const row = includeFaqs ? { ...base, ...faqFields, published_at } : { ...base, published_at };
    return input.id
      ? supabase.from("jhb_posts").update(row).eq("id", input.id).select("id").maybeSingle()
      : supabase.from("jhb_posts").insert(row).select("id").maybeSingle();
  };

  let result = await run(true);
  if (result.error && missingFaqColumn(result.error)) {
    console.warn("[post] faqs columns missing — saved without FAQs. Run supabase/migrations/jhb_posts_faqs.sql.");
    result = await run(false);
  }

  if (result.error) {
    if (result.error.code === "23505")
      return { ok: false, error: "That slug is already used by another post." };
    return { ok: false, error: result.error.message };
  }

  await log(
    input.id ? "post.update" : "post.create",
    `${input.status === "published" ? "Published" : "Saved"} post "${input.title}"`
  );
  revalidatePath("/posts");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  return { ok: true, id: result.data?.id as string };
}

export async function deletePost(id: string) {
  const { supabase } = await getStaff();
  const { error } = await supabase.from("jhb_posts").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await log("post.delete", `Deleted post ${id}`);
  revalidatePath("/posts");
  revalidatePath("/blog");
  return { ok: true };
}

export async function resetPostLikes(id: string) {
  const { supabase } = await getStaff();
  const { error } = await supabase.from("jhb_posts").update({ likes: 0 }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await log("post.likes.reset", `Reset likes for post ${id}`);
  revalidatePath("/posts");
  revalidatePath(`/blog`);
  return { ok: true };
}

// ---- Author & Publisher (SEO) ----
// One jhb_content document ("author_publisher" + draft) holds global defaults +
// per-page overrides. The editor panel loads the draft-preferred doc, edits its
// slice, and saves the whole doc. SEO-only — never rendered as a visible section.

export async function loadAuthorPublisher(): Promise<
  { ok: true; doc: AuthorPublisherDoc } | { ok: false; error: string }
> {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can edit Author & Publisher SEO." };
  return { ok: true, doc: await getAuthorPublisherDraftDoc() };
}

export async function saveAuthorPublisherDraft(data: Record<string, unknown>) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;
  const { error } = await supabase.from("jhb_content").upsert(
    { key: "author_publisher_draft", data, updated_at: new Date().toISOString(), updated_by: user.id },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };
  await log("author_publisher.draft", "Saved Author & Publisher SEO draft");
  return { ok: true };
}

export async function publishAuthorPublisher(data: Record<string, unknown>) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;
  const now = new Date().toISOString();
  await supabase.from("jhb_content").upsert(
    { key: "author_publisher_draft", data, updated_at: now, updated_by: user.id },
    { onConflict: "key" }
  );
  const { error } = await supabase.from("jhb_content").upsert(
    { key: "author_publisher", data, updated_at: now, updated_by: user.id },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };
  await log("author_publisher.publish", "Published Author & Publisher SEO");
  await snapshot("author_publisher", "Author & Publisher SEO", data, "Published Author & Publisher SEO");
  // Author/publisher feeds structured data on every page → revalidate the layout.
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---- Blog Hero (full-width banner on the /blog landing page) ----
// One jhb_content document ("blog_hero" + "blog_hero_draft"). Save Draft never
// touches the published key; publishBlogHero() copies it across and revalidates.

export async function saveBlogHeroDraft(data: Record<string, unknown>) {
  const { supabase, user } = await getStaff();
  const { error } = await supabase.from("jhb_content").upsert(
    { key: "blog_hero_draft", data, updated_at: new Date().toISOString(), updated_by: user.id },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };
  await log("blog_hero.draft", "Saved blog hero draft");
  return { ok: true };
}

export async function publishBlogHero(data: Record<string, unknown>) {
  const { supabase, user } = await getStaff();
  const now = new Date().toISOString();
  await supabase.from("jhb_content").upsert(
    { key: "blog_hero_draft", data, updated_at: now, updated_by: user.id },
    { onConflict: "key" }
  );
  const { error } = await supabase.from("jhb_content").upsert(
    { key: "blog_hero", data, updated_at: now, updated_by: user.id },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };
  await log("blog_hero.publish", "Published blog hero");
  await snapshot("blog_hero", "Blog Hero", data, "Published blog hero");
  revalidatePath("/blog");
  return { ok: true };
}

// ---- Blog Article Hero (full-width banner on each /blog/[slug] article) ----
// Global appearance config in jhb_content ("blog_article_hero" + draft). Save
// Draft never touches the published key; publishBlogArticleHero() copies it
// across and revalidates the article pages. Per-post content (title/breadcrumb/
// author/date/reading time) is dynamic and not stored here.

export async function saveBlogArticleHeroDraft(data: Record<string, unknown>) {
  const { supabase, user } = await getStaff();
  const { error } = await supabase.from("jhb_content").upsert(
    { key: "blog_article_hero_draft", data, updated_at: new Date().toISOString(), updated_by: user.id },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };
  await log("blog_article_hero.draft", "Saved blog article hero draft");
  return { ok: true };
}

export async function publishBlogArticleHero(data: Record<string, unknown>) {
  const { supabase, user } = await getStaff();
  const now = new Date().toISOString();
  await supabase.from("jhb_content").upsert(
    { key: "blog_article_hero_draft", data, updated_at: now, updated_by: user.id },
    { onConflict: "key" }
  );
  const { error } = await supabase.from("jhb_content").upsert(
    { key: "blog_article_hero", data, updated_at: now, updated_by: user.id },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };
  await log("blog_article_hero.publish", "Published blog article hero");
  await snapshot("blog_article_hero", "Blog Article Hero", data, "Published blog article hero");
  // Affects every article page header.
  revalidatePath("/blog/[slug]", "page");
  return { ok: true };
}

// ---- Legal pages (Privacy Policy + Terms & Conditions) ----
// One jhb_content document ("legal" + "legal_draft"). Save Draft never touches
// the published key, so the live pages are unaffected until publishLegal()
// copies it across and revalidates the routes + layout (footer links).

export async function saveLegalDraft(data: Record<string, unknown>) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can edit legal pages." };
  const { supabase, user } = ctx;
  const { error } = await supabase.from("jhb_content").upsert(
    { key: "legal_draft", data, updated_at: new Date().toISOString(), updated_by: user.id },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };
  await log("legal.draft", "Saved legal pages draft");
  return { ok: true };
}

export async function publishLegal(data: Record<string, unknown>) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can publish legal pages." };
  const { supabase, user } = ctx;
  const now = new Date().toISOString();
  await supabase.from("jhb_content").upsert(
    { key: "legal_draft", data, updated_at: now, updated_by: user.id },
    { onConflict: "key" }
  );
  const { error } = await supabase.from("jhb_content").upsert(
    { key: "legal", data, updated_at: now, updated_by: user.id },
    { onConflict: "key" }
  );
  if (error) return { ok: false, error: error.message };
  await log("legal.publish", "Published legal pages");
  await snapshot("legal", "Legal Pages", data, "Published legal pages");
  revalidatePath("/privacy-policy");
  revalidatePath("/terms-and-conditions");
  revalidatePath("/", "layout"); // footer links
  return { ok: true };
}

// ---- Service FAQs ----

export async function saveServiceFaqs(
  serviceKey: string,
  items: { question: string; answer: string }[]
) {
  const { supabase, user } = await getStaff();

  const clean = items
    .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
    .filter((f) => f.question && f.answer);

  // Replace the FAQ set for this service (handles add/edit/delete/reorder)
  const del = await supabase
    .from("jhb_service_faqs")
    .delete()
    .eq("service_key", serviceKey);
  if (del.error) return { ok: false, error: del.error.message };

  if (clean.length > 0) {
    const rows = clean.map((f, i) => ({
      service_key: serviceKey,
      question: f.question,
      answer: f.answer,
      sort_order: i,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    }));
    const ins = await supabase.from("jhb_service_faqs").insert(rows);
    if (ins.error) return { ok: false, error: ins.error.message };
  }

  await log("faq.update", `Updated FAQs for "${serviceKey}"`);
  revalidatePath("/faqs");
  revalidatePath(`/${serviceKey}`);
  return { ok: true };
}

// ---- Version history: restore & delete (Super Admin only) ----

// Restore a module to an earlier full-content snapshot. Writes the snapshot's
// data back to its source table/key, logs the restore, and snapshots the
// restored state (so the audit history is preserved even after a restore).
export async function restoreVersion(id: string) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can restore versions." };
  const { supabase, user } = ctx;

  const { data: v, error: vErr } = await supabase
    .from("jhb_versions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (vErr || !v) return { ok: false, error: "Version not found." };

  const module = v.module as string;
  const data = v.data as Record<string, unknown>;
  const now = new Date().toISOString();
  let writeError: string | null = null;
  const paths: string[] = [];

  if (module === "products" || module === "tools_hub") {
    const { error } = await supabase
      .from("jhb_content")
      .upsert({ key: module, data, updated_at: now, updated_by: user.id }, { onConflict: "key" });
    writeError = error?.message ?? null;
    paths.push(module === "products" ? "/vasool-app" : "/jhb-automation-tools");
  } else if (module === "settings") {
    const { error } = await supabase
      .from("jhb_settings")
      .upsert({ key: "site", data, updated_at: now, updated_by: user.id }, { onConflict: "key" });
    writeError = error?.message ?? null;
    paths.push("/settings");
  } else if (module === "home_draft") {
    const { error } = await supabase
      .from("jhb_home")
      .upsert({ key: "draft", data, updated_at: now, updated_by: user.id }, { onConflict: "key" });
    writeError = error?.message ?? null;
    paths.push("/home");
  } else if (module === "blog_hero") {
    const { error } = await supabase
      .from("jhb_content")
      .upsert({ key: "blog_hero", data, updated_at: now, updated_by: user.id }, { onConflict: "key" });
    await supabase
      .from("jhb_content")
      .upsert({ key: "blog_hero_draft", data, updated_at: now, updated_by: user.id }, { onConflict: "key" });
    writeError = error?.message ?? null;
    paths.push("/blog");
  } else if (module === "blog_article_hero") {
    const { error } = await supabase
      .from("jhb_content")
      .upsert({ key: "blog_article_hero", data, updated_at: now, updated_by: user.id }, { onConflict: "key" });
    await supabase
      .from("jhb_content")
      .upsert({ key: "blog_article_hero_draft", data, updated_at: now, updated_by: user.id }, { onConflict: "key" });
    writeError = error?.message ?? null;
    paths.push("/blog");
  } else if (module === "author_publisher") {
    const { error } = await supabase
      .from("jhb_content")
      .upsert({ key: "author_publisher", data, updated_at: now, updated_by: user.id }, { onConflict: "key" });
    await supabase
      .from("jhb_content")
      .upsert({ key: "author_publisher_draft", data, updated_at: now, updated_by: user.id }, { onConflict: "key" });
    writeError = error?.message ?? null;
    paths.push("/");
  } else if (module === "legal") {
    const { error } = await supabase
      .from("jhb_content")
      .upsert({ key: "legal", data, updated_at: now, updated_by: user.id }, { onConflict: "key" });
    await supabase
      .from("jhb_content")
      .upsert({ key: "legal_draft", data, updated_at: now, updated_by: user.id }, { onConflict: "key" });
    writeError = error?.message ?? null;
    paths.push("/privacy-policy", "/terms-and-conditions");
  } else if (module.startsWith("seo:")) {
    const path = module.slice(4);
    const d = data as { title?: string; description?: string; keywords?: string; og_image?: string };
    const { error } = await supabase.from("jhb_seo").upsert(
      {
        path,
        title: d.title ?? "",
        description: d.description ?? "",
        keywords: d.keywords ?? "",
        og_image: d.og_image || null,
        updated_at: now,
        updated_by: user.id,
      },
      { onConflict: "path" }
    );
    writeError = error?.message ?? null;
    paths.push("/seo");
  } else if (module.startsWith("service_page:")) {
    const key = module.slice("service_page:".length);
    const { error } = await supabase
      .from("jhb_services")
      .upsert({ ...data, updated_at: now, updated_by: user.id }, { onConflict: "key" });
    writeError = error?.message ?? null;
    paths.push("/service-pages", `/service-pages/${key}`);
  } else {
    return { ok: false, error: `Cannot restore unknown module "${module}".` };
  }

  if (writeError) return { ok: false, error: writeError };

  await log("version.restore", `Restored ${v.label ?? module} to version ${v.version_number}`);
  await snapshot(module, (v.label as string) ?? module, data, `Restored to version ${v.version_number}`);
  for (const p of paths) revalidatePath(p);
  revalidatePath("/", "layout");
  revalidatePath("/activity");
  return { ok: true };
}

export async function deleteVersion(id: string) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can delete versions." };
  const { error } = await ctx.supabase.from("jhb_versions").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/activity");
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
