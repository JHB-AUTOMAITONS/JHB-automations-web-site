/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@jhb/shared"],
  // Runs on the Netlify Next.js runtime (SSR/ISR) so admin content edits appear
  // live without a rebuild — see the `revalidate` in app/layout.tsx. NOT a static
  // export anymore.
  // Keep folder-style URLs (/about/ -> /about/index.html) to preserve existing
  // links, the sitemap and canonical tags.
  trailingSlash: true,
  // Images stay unoptimized: plain <img> tags pointing at Supabase CDN URLs, so no
  // Image Optimization or remote-hostname allowlist is required.
  images: {
    unoptimized: true,
  },
  // Legacy migrated-URL 301s run at the Netlify edge (netlify.toml). The services
  // move (/services/[slug] -> /[slug]) is a 301 here so old indexed service URLs
  // keep their SEO. `/services` (the listing index) is NOT matched because `:slug`
  // requires a segment after it.
  async redirects() {
    return [
      { source: "/services/:slug", destination: "/:slug", statusCode: 301 },
    ];
  },
  webpack: (config, { dev }) => {
    // In-memory cache in dev avoids the on-disk PackFileCache OOM seen on this machine.
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
