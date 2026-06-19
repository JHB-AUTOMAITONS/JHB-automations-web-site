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
  // The 4 migrated-URL 301 redirects run at the Netlify edge (netlify.toml
  // [[redirects]]), so they don't need to be declared here.
  webpack: (config, { dev }) => {
    // In-memory cache in dev avoids the on-disk PackFileCache OOM seen on this machine.
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
