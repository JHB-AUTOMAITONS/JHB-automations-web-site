// Client-side image optimization: resize (keep aspect ratio) to fit within a max
// dimension and re-encode as WebP before upload. This shrinks a multi-MB photo /
// 16:9 thumbnail to ~100-300 KB so the upload (and the public page) is fast.
// SVG and GIF are passed through unchanged (vector / animation).

export type OptimizeResult = {
  blob: Blob;
  width: number;
  height: number;
  type: string;
  passthrough: boolean; // true when the original was kept as-is (svg/gif)
};

const PASSTHROUGH = ["image/svg+xml", "image/gif"];

function readDataUrl(file: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(new Error("Could not read file."));
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error("Invalid image."));
    im.src = src;
  });
}

/** Read an image's natural dimensions without resizing. */
export async function readImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  if (PASSTHROUGH.includes(file.type)) return { width: 0, height: 0 };
  try {
    const img = await loadImage(await readDataUrl(file));
    return { width: img.width, height: img.height };
  } catch {
    return { width: 0, height: 0 };
  }
}

/** Resize to fit `maxDim` and encode as WebP. SVG/GIF pass through unchanged. */
export async function optimizeImage(
  file: File,
  opts: { maxDim?: number; quality?: number } = {}
): Promise<OptimizeResult> {
  const maxDim = opts.maxDim ?? 1600;
  const quality = opts.quality ?? 0.85;

  if (PASSTHROUGH.includes(file.type)) {
    const dims = await readImageDimensions(file);
    return { blob: file, width: dims.width, height: dims.height, type: file.type, passthrough: true };
  }

  const img = await loadImage(await readDataUrl(file));
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);

  const blob = await new Promise<Blob>((res, rej) =>
    canvas.toBlob(
      (b) => (b ? res(b) : rej(new Error("Compression failed."))),
      "image/webp",
      quality
    )
  );
  return { blob, width: w, height: h, type: "image/webp", passthrough: false };
}

/** Human-readable byte size. */
export const fmtBytes = (n: number) =>
  n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
