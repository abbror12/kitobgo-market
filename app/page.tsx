import { CategorySection } from "@/components/home/CategorySection";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import { HeroSection } from "@/components/home/HeroSection";
import { SpecialCollections, TestimonialsSection, VideoReviews } from "@/components/home/AdditionalSections";
import { StatisticsBanner } from "@/components/home/StatisticsBanner";
import { TelegramCTA } from "@/components/home/TelegramCTA";
import { TrustBenefits } from "@/components/home/TrustBenefits";
import { StoreShell } from "@/components/layout/StoreShell";
import { ProductSection } from "@/components/product/ProductSection";
import { books as fallbackBooks } from "@/data/books";
import { categories as fallbackCategories } from "@/data/home";
import { getCategories, getProducts } from "@/lib/store-api";
import type { CategoryIcon } from "@/types/book";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [apiBooks, apiCategories] = await Promise.all([
    getProducts().catch(() => []),
    getCategories().catch(() => []),
  ]);
  const storeBooks = apiBooks.length ? apiBooks : fallbackBooks;
  const categoryIcons: CategoryIcon[] = ["book-open", "library", "heart-handshake", "flower", "landmark", "scroll", "sparkles", "baby", "person-standing", "book-marked"];
  const storeCategories = apiCategories.length
    ? apiCategories.map((category, index) => ({ id: String(category.id), name: category.name, icon: categoryIcons[index % categoryIcons.length] }))
    : fallbackCategories;
  const featuredBooks = storeBooks.slice(0, 6);
  const newBooks = [...storeBooks].sort((a, b) => b.publishedYear - a.publishedYear).slice(0, 4);

  return (
    <StoreShell>
        <HeroSection book={storeBooks[0]} />
        <TrustBenefits />
        <CategorySection categories={storeCategories} />
        <ProductSection title="Eng ko‘p sotilgan kitoblar" subtitle="Xaridorlarimiz eng ko‘p tanlagan nashrlar" books={featuredBooks} />
        <StatisticsBanner />
        <ProductSection id="yangi-kelganlar" title="Yangi kelganlar" subtitle="Kutubxonamizga yaqinda qo‘shilgan kitoblar" books={newBooks} compact />
        <SpecialCollections />
        <VideoReviews />
        <TestimonialsSection />
        <FAQAccordion />
        <TelegramCTA />
    </StoreShell>
  );
}
