/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    // The on-disk PackFileCache was repeatedly throwing
    // "Array buffer allocation failed" on this machine. Use in-memory
    // caching in dev to keep rebuilds fast without the crash.
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
