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
  // Eski xatlardagi havolalar (`/verify-email?token=…`, `/reset-password?token=…`) uchun.
  // Backend 2026-08-13 dan kod yuboradi va `one_time_tokens` jadvalini tashladi — ya'ni
  // bu havolalar allaqachon o'lik. Pochtasida eski xat qolganlar 404 emas, kirish sahifasini
  // ko'rsin. Bir-ikki haftadan keyin bu ikki qatorni olib tashlash mumkin.
  async redirects() {
    return [
      { source: "/verify-email", destination: "/login", permanent: false },
      { source: "/reset-password", destination: "/login", permanent: false },
    ];
  },
};

export default nextConfig;
