import type { MetadataRoute } from "next";
import { PRIVATE_PATHS, SITE_URL } from "@/lib/site";

// /robots.txt — Next fayl nomiga qarab o'zi chiqaradi.
// Shaxsiy sahifalar yopiladi: ular qidiruvda foyda bermaydi va "yupqa" sahifa sifatida
// saytning umumiy bahosini pasaytiradi. `/api/*` — BFF route'lari, indekslashga hech nima yo'q.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", ...PRIVATE_PATHS] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
