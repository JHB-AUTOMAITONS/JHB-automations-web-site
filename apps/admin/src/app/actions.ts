"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@jhb/shared/supabase/server";

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
  revalidatePath("/content");
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
  revalidatePath("/", "layout");
  revalidatePath("/settings");
  return { ok: true };
}

export async function uploadMedia(formData: FormData) {
  const { supabase, user } = await getStaff();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { ok: false, error: "No file selected" };

  const ext = file.name.split(".").pop() || "bin";
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${safe}`;

  const { error: upErr } = await supabase.storage
    .from("jhb-media")
    .upload(path, file, { contentType: file.type, upsert: false });
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
  });
  if (dbErr) return { ok: false, error: dbErr.message };

  await log("media.upload", `Uploaded "${file.name}"`);
  revalidatePath("/media");
  return { ok: true, url: publicUrl };
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
  revalidatePath(path);
  revalidatePath("/seo");
  return { ok: true };
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
  const slug = data.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) return { ok: false, error: "Slug cannot be empty" };

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
  revalidatePath(`/services/${slug}`);
  revalidatePath("/services");
  return { ok: true, slug };
}

export async function updateUserRole(id: string, role: string) {
  const { supabase, profile } = await getStaff();
  if (profile?.role !== "admin")
    return { ok: false, error: "Only admins can change roles" };
  const { error } = await supabase
    .from("jhb_profiles")
    .update({ role })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  await log("user.role", `Set role "${role}" for user ${id}`);
  revalidatePath("/users");
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
