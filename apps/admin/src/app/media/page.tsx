import { getMediaLibrary } from "@jhb/shared/media-server";
import MediaManager from "@/components/MediaManager";

export default async function AdminMedia() {
  const items = await getMediaLibrary();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Gallery</h1>
      <p className="mt-1 text-sm text-muted">
        Every image uploaded anywhere in the admin lives here. Upload, search,
        reuse, replace or remove your images — one library for the whole site.
      </p>
      <MediaManager items={items} />
    </div>
  );
}
