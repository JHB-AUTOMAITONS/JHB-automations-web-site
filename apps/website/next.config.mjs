/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@jhb/shared"],
  // Optimize images: serve AVIF/WebP + responsive sizes, including admin-uploaded
  // images hosted on Supabase Storage (prevents oversized downloads).
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "wzvzzcuennotfutklulh.supabase.co" },
    ],
  },
  // CRM is now a section of the JHB Automation Tools hub. Permanently redirect
  // the old standalone CRM URLs (root + /services/) to the hub to preserve SEO.
  async redirects() {
    return [
      {
        source: "/customer-relationship-management-software",
        destination: "/jhb-automation-tools",
        permanent: true,
      },
      {
        source: "/services/customer-relationship-management-software",
        destination: "/jhb-automation-tools",
        permanent: true,
      },
      // Friendly top-level URLs for the Vasool App product + its About page.
      { source: "/vasool-app", destination: "/products/vasool-app", permanent: true },
      { source: "/about-vasool", destination: "/products/vasool-app/about", permanent: true },
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
