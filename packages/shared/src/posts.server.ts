import { createClient } from "./supabase/server";
import type { BlogFaq, Post, PostCard } from "./posts";

const CARD_COLS =
  "id, slug, title, excerpt, cover_image, category, author, published_at";

// Normalize a raw jhb_posts row into a fully-shaped Post. The faqs columns are
// added by a later migration, so `select("*")` may not return them on older
// databases — default them here so reads never break before the migration runs.
function normalizePost(row: unknown): Post {
  const r = row as Post & { likes?: number; faqs?: BlogFaq[]; faqs_enabled?: boolean };
  return {
    ...r,
    likes: r.likes ?? 0,
    faqs: Array.isArray(r.faqs) ? r.faqs : [],
    faqs_enabled: r.faqs_enabled !== false,
  };
}

export async function getPublishedPosts(limit?: number): Promise<PostCard[]> {
  try {
    const supabase = await createClient();
    const build = (cols: string) => {
      let q = supabase
        .from("jhb_posts")
        .select(cols)
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (limit) q = q.limit(limit);
      return q;
    };
    // Try with the likes column; fall back gracefully until the migration runs.
    let { data, error } = await build(`${CARD_COLS}, likes`);
    if (error) ({ data } = await build(CARD_COLS));
    return ((data as unknown as PostCard[]) ?? []).map((p) => ({ ...p, likes: p.likes ?? 0 }));
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    return data ? normalizePost(data) : null;
  } catch {
    return null;
  }
}

export async function getRelatedPosts(
  slug: string,
  category: string | null,
  limit = 3
): Promise<PostCard[]> {
  try {
    const supabase = await createClient();
    const fetchPosts = async (cat: string | null) => {
      const build = (cols: string) => {
        let q = supabase
          .from("jhb_posts")
          .select(cols)
          .eq("status", "published")
          .neq("slug", slug)
          .order("published_at", { ascending: false })
          .limit(limit);
        if (cat) q = q.eq("category", cat);
        return q;
      };
      let { data, error } = await build(`${CARD_COLS}, likes`);
      if (error) ({ data } = await build(CARD_COLS));
      return ((data as unknown as PostCard[]) ?? []).map((p) => ({ ...p, likes: p.likes ?? 0 }));
    };

    // Prefer same-category posts; fall back to most recent if not enough.
    let related = category ? await fetchPosts(category) : [];
    if (related.length < limit) {
      const recent = await fetchPosts(null);
      const seen = new Set(related.map((p) => p.id));
      related = [...related, ...recent.filter((p) => !seen.has(p.id))].slice(
        0,
        limit
      );
    }
    return related;
  } catch {
    return [];
  }
}

export async function getPublishedSlugs(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_posts")
      .select("slug")
      .eq("status", "published");
    return (data ?? []).map((r: { slug: string }) => r.slug);
  } catch {
    return [];
  }
}

/* ---- Admin (staff reads, includes drafts via RLS) ---- */

export async function getAllPostsAdmin(): Promise<Post[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jhb_posts")
    .select("*")
    .order("updated_at", { ascending: false });
  return ((data as Post[]) ?? []).map(normalizePost);
}

export async function getPostByIdAdmin(id: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jhb_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? normalizePost(data) : null;
}
