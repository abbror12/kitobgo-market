import type { MetadataRoute } from "next";
import { posts } from "@/data/blog";
import { SITE_URL } from "@/lib/site";
import { flattenCategoryTree, getBooks, getCategoryTree } from "@/lib/store-api";

// /sitemap.xml — kitob sahifalari Google uchun shu yerdan topiladi. Katalog ichkarida,
// filtrlar ortida turgani uchun havolalar bo'ylab yurib topish sekin va to'liqmas bo'lardi.
export const revalidate = 3600;

const PAGE_SIZE = 100;   // API.md §2: katalog qidiruvida `size` 100 bilan cheklangan
const MAX_PAGES = 50;    // 5000 kitob. Bundan oshsa sitemap'ni indeksga bo'lish kerak bo'ladi.

async function bookEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    // Sahifa 0 dan boshlanadi (API.md §2). Xatolik bo'lsa to'xtaymiz — sitemap qisman
    // bo'lgani butunlay yiqilganidan yaxshi.
    const result = await getBooks({ page, size: PAGE_SIZE }, revalidate).catch(() => null);
    if (!result?.content.length) break;
    for (const book of result.content) {
      entries.push({ url: `${SITE_URL}/books/${book.slug}`, changeFrequency: "weekly", priority: 0.8 });
    }
    if (result.last) break;
    if (page === MAX_PAGES - 1) console.warn(`sitemap: ${MAX_PAGES * PAGE_SIZE} kitobdan keyin to'xtatildi`);
  }
  return entries;
}

async function categoryEntries(): Promise<MetadataRoute.Sitemap> {
  const tree = await getCategoryTree().catch(() => []);
  return flattenCategoryTree(tree).map((category) => ({
    url: `${SITE_URL}/catalog?category=${category.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/catalog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/authors`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    changeFrequency: "yearly",
    priority: 0.4,
  }));

  const [books, categories] = await Promise.all([bookEntries(), categoryEntries()]);
  return [...staticPages, ...blogPages, ...categories, ...books];
}
