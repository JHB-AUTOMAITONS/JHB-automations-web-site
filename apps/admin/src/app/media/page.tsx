import { createClient } from "@jhb/shared/supabase/server";
import MediaManager, { type MediaItem } from "@/components/MediaManager";

export default async function AdminMedia() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jhb_media")
    .select("id, name, path, url, size, mime, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">
        Media Library
      </h1>
      <p className="mt-1 text-sm text-muted">
        Upload and manage images. Drag &amp; drop, then copy the URL to use anywhere.
      </p>
      <MediaManager items={(data as MediaItem[]) ?? []} />
    </div>
  );
}
