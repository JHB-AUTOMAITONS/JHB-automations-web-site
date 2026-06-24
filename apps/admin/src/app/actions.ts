"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@jhb/shared/supabase/server";
import { testimonials as fallbackTestimonials } from "@jhb/shared/data";
import { extractHrefs, type ServicePagePayload } from "@jhb/shared/service-pages";
import { HOME_FAQ_DEFAULTS } from "@jhb/shared/home-faqs";

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
  console.log(`[media-seo] saved id=${id} at ${now}`);
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

export async function saveServicePage(key: string, payload: ServicePagePayload) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return { ok: false, error: "Only a Super Admin can do this." };
  const { supabase, user } = ctx;

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
  const features = (payload.features ?? []).map((f) => ({
    title: (f.title || "").trim(),
    desc: (f.desc || "").trim(),
    link: (f.link || "").trim(),
    linkText: (f.linkText || "").trim(),
  }));
  const badLink = features.find((f) => !featureUrlOk(f.link));
  if (badLink)
    return {
      ok: false,
      error: `Invalid Word Link for "${badLink.title || "a container"}": ${badLink.link} — use https://…, /path, #anchor, mailto:/tel:, or leave it empty.`,
    };
  // Persist a clean shape (omit empty link/linkText so the JSON stays tidy).
  const cleanFeatures = features.map((f) => ({
    title: f.title,
    desc: f.desc,
    ...(f.link ? { link: f.link } : {}),
    ...(f.linkText ? { linkText: f.linkText } : {}),
  }));

  // Hero "Word Link" — same validation as feature links (empty or valid URL).
  const heroLink = (payload.hero_link || "").trim();
  if (!featureUrlOk(heroLink))
    return {
      ok: false,
      error: `Invalid Hero Word Link: ${heroLink} — use https://…, /path, #anchor, mailto:/tel:, or leave it empty.`,
    };

  const now = new Date().toISOString();
  const row = {
    key,
    slug,
    meta_title: payload.meta_title?.trim() || null,
    meta_description: payload.meta_description?.trim() || null,
    meta_keywords: payload.meta_keywords?.trim() || null,
    status: payload.status === "published" ? "published" : "draft",
    hero_heading: payload.hero_heading?.trim() || null,
    hero_description: payload.hero_description?.trim() || null,
    hero_link: heroLink || null,
    features: cleanFeatures,
    faq: payload.faq ?? [],
    cta: payload.cta ?? null,
    image_url: payload.image_url || null,
    image_alt: payload.image_alt || null,
    image_title: payload.image_title || null,
    content_updated_at: now,
    updated_at: now,
    updated_by: user.id,
  };
  const { error } = await supabase.from("jhb_services").upsert(row, { onConflict: "key" });
  if (error) {
    console.error(`[service-page] SAVE FAILED key="${key}":`, error.message);
    return { ok: false, error: error.message };
  }
  console.log(
    `[service-page] saved key="${key}" status=${payload.status} slug="${slug}" at ${now}`
  );
  await log("service.page.save", `Saved service page "${key}"`);
  await snapshot(`service_page:${key}`, `Service Page — ${key}`, row, `Saved service page "${key}"`);
  revalidatePath("/service-pages");
  revalidatePath(`/service-pages/${key}`);
  return { ok: true, savedAt: now };
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

  const { data: src } = await supabase
    .from("jhb_services")
    .select("hero_heading, hero_description, hero_link, features, faq, cta, image_url, image_alt")
    .eq("key", fromKey)
    .maybeSingle();
  if (!src) return { ok: false, error: "Source has no saved content to copy." };

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("jhb_services")
    .update({
      hero_heading: src.hero_heading,
      hero_description: src.hero_description,
      hero_link: src.hero_link,
      features: src.features ?? [],
      faq: src.faq ?? [],
      cta: src.cta ?? null,
      image_url: src.image_url,
      image_alt: src.image_alt,
      status: "draft",
      content_updated_at: now,
      updated_at: now,
      updated_by: user.id,
    })
    .eq("key", toKey);
  if (error) return { ok: false, error: error.message };
  await log("service.page.duplicate", `Copied content "${fromKey}" → "${toKey}"`);
  revalidatePath("/service-pages");
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
      hero_description: null,
      hero_link: null,
      features: [],
      faq: [],
      cta: null,
      image_url: null,
      image_alt: null,
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
    updated_at: now,
    updated_by: user.id,
  };

  let result;
  if (input.id) {
    const { data: existing } = await supabase
      .from("jhb_posts")
      .select("published_at")
      .eq("id", input.id)
      .maybeSingle();
    const published_at =
      existing?.published_at ?? (input.status === "published" ? now : null);
    result = await supabase
      .from("jhb_posts")
      .update({ ...base, published_at })
      .eq("id", input.id)
      .select("id")
      .maybeSingle();
  } else {
    const published_at = input.status === "published" ? now : null;
    result = await supabase
      .from("jhb_posts")
      .insert({ ...base, published_at })
      .select("id")
      .maybeSingle();
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
