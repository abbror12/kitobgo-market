import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    // Muqova va banner rasmlari backenddan to'liq URL bo'lib keladi (MinIO/CDN).
    remotePatterns: [
      { protocol: "https", hostname: "api.kitobgo.com" },
      { protocol: "https", hostname: "cdn.kitobgo.com" },
      { protocol: "https", hostname: "*.kitobgo.com" },
    ],
  },
};

export default nextConfig;
