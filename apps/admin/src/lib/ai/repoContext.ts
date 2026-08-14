import "server-only";
import { promises as fs } from "fs";
import path from "path";

// Reads the public website's Next.js source (same monorepo) so Claude understands
// the page/component being edited: structure, routes, existing content & SEO.
//
// Works when the admin runs with filesystem access to the repo (local dev, a VPS,
// or a single-server deploy). In a split serverless deploy where apps/website/src
// isn't bundled with the admin functions, it degrades gracefully (returns a note),
// and you can set WEBSITE_SRC_DIR to an absolute path that IS available.

const MAX_FILE_CHARS = 6000;
const MAX_RELATED = 4;

function candidateRoots(): string[] {
  const env = process.env.WEBSITE_SRC_DIR;
  const cwd = process.cwd();
  return [
    env,
    path.join(cwd, "src"), // cwd === apps/website (unlikely for admin)
    path.join(cwd, "..", "website", "src"), // cwd === apps/admin
    path.join(cwd, "apps", "website", "src"), // cwd === monorepo root
    path.join(cwd, "..", "..", "apps", "website", "src"),
  ].filter(Boolean) as string[];
}

async function resolveSrcDir(): Promise<string | null> {
  for (const dir of candidateRoots()) {
    try {
      const stat = await fs.stat(path.join(dir, "app"));
      if (stat.isDirectory()) return dir;
    } catch {
      /* try next */
    }
  }
  return null;
}

// Map a public route to its most likely page file (handles dynamic segments).
function routeToPageRel(route: string): string {
  let p = (route || "/").split("?")[0].split("#")[0];
  if (p !== "/" && p.endsWith("/")) p = p.slice(0, -1);
  if (p === "/" || p === "") return path.join("app", "page.tsx");

  const seg = p.split("/").filter(Boolean);
  // Known dynamic groups.
  if (seg[0] === "blog" && seg.length === 2) return path.join("app", "blog", "[slug]", "page.tsx");
  if (seg[0] === "products" && seg.length >= 2) {
    return seg[2] === "about"
      ? path.join("app", "products", "[slug]", "about", "page.tsx")
      : path.join("app", "products", "[slug]", "page.tsx");
  }
  // Static known routes live at app/<seg>/page.tsx.
  const staticRoutes = new Set(["about", "blog", "services", "contact"]);
  if (seg.length === 1 && staticRoutes.has(seg[0])) return path.join("app", seg[0], "page.tsx");
  // Single-segment unknown → service/HR-hub catch-all (HR's URL is admin-editable).
  if (seg.length === 1) return path.join("app", "[slug]", "page.tsx");
  // Fallback: literal nested path.
  return path.join("app", ...seg, "page.tsx");
}

async function readTrimmed(file: string): Promise<string | null> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return raw.length > MAX_FILE_CHARS ? raw.slice(0, MAX_FILE_CHARS) + "\n/* …truncated… */" : raw;
  } catch {
    return null;
  }
}

// Pull local component imports ("@/components/X" or "./X") so we can include the
// main render component alongside the route file.
function localImports(src: string): string[] {
  const out: string[] = [];
  const re = /import\s+[^"']*from\s+["'](@\/components\/[^"']+|\.\.?\/[^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) && out.length < 20) out.push(m[1]);
  return out;
}

export type RepoContext = {
  available: boolean;
  route: string;
  pageFile: string | null;
  files: { path: string; content: string }[];
  note?: string;
};

export async function getRepoContext(route: string): Promise<RepoContext> {
  const srcDir = await resolveSrcDir();
  if (!srcDir) {
    return {
      available: false,
      route,
      pageFile: null,
      files: [],
      note: "Website source not found on this server. Set WEBSITE_SRC_DIR to the absolute path of apps/website/src to enable repo context.",
    };
  }
  const pageRel = routeToPageRel(route);
  const pageAbs = path.join(srcDir, pageRel);
  const pageSrc = await readTrimmed(pageAbs);
  if (!pageSrc) {
    return {
      available: false,
      route,
      pageFile: pageRel,
      files: [],
      note: `Could not read ${pageRel}. The route may render from a component or not exist.`,
    };
  }

  const files: { path: string; content: string }[] = [{ path: pageRel, content: pageSrc }];

  // Best-effort: include up to MAX_RELATED imported local components.
  for (const imp of localImports(pageSrc)) {
    if (files.length >= MAX_RELATED + 1) break;
    const rel = imp.startsWith("@/components/")
      ? path.join("components", imp.slice("@/components/".length))
      : null; // skip relative ("./x") for simplicity/safety
    if (!rel) continue;
    for (const ext of [".tsx", ".ts", "/index.tsx", ".jsx"]) {
      const content = await readTrimmed(path.join(srcDir, rel + ext));
      if (content) {
        files.push({ path: rel + ext, content });
        break;
      }
    }
  }

  return { available: true, route, pageFile: pageRel, files };
}

// Compact representation for a Claude prompt.
export function repoContextToPrompt(ctx: RepoContext): string {
  if (!ctx.available) return `WEBSITE REPO CONTEXT: unavailable (${ctx.note}).`;
  const parts = [`WEBSITE REPO CONTEXT for route "${ctx.route}" (file: ${ctx.pageFile}):`];
  for (const f of ctx.files) {
    parts.push(`\n----- ${f.path} -----\n${f.content}`);
  }
  return parts.join("\n");
}
