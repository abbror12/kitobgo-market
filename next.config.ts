import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    // Backend s3/CDN saqlashga o'tsa rasm to'liq URL bo'lib keladi —
    // CDN hostini shu ro'yxatga qo'shish kerak.
    remotePatterns: [{ protocol: "https", hostname: "api.kitobgo.com" }],
  },
};

export default nextConfig;
