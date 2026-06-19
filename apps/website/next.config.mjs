/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@jhb/shared"],
  // STATIC EXPORT for Hostinger shared hosting: `next build` emits a plain
  // HTML/CSS/JS site into `out/` that is uploaded to public_html. No Node server.
  output: "export",
  // Apache serves /about/ -> /about/index.html, so emit folder-style URLs.
  trailingSlash: true,
  // The Next image optimizer needs a running server, which static export has not.
  // `unoptimized` emits plain <img> tags pointing at the original (Supabase) URLs,
  // which also removes the previous remote-hostname allowlist requirement.
  images: {
    unoptimized: true,
  },
  // NOTE: redirects() is NOT supported with output: "export". The 4 migrated-URL
  // 301s are implemented in the uploaded .htaccess (Apache) instead.
  webpack: (config, { dev }) => {
    // In-memory cache in dev avoids the on-disk PackFileCache OOM seen on this machine.
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
