/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@jhb/shared"],
  webpack: (config, { dev }) => {
    // In-memory cache in dev avoids the on-disk PackFileCache OOM seen on this machine.
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
