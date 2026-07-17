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
import { getProducts } from "@/lib/store-api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const apiBooks = await getProducts().catch(() => []);
  const storeBooks = apiBooks.length ? apiBooks : fallbackBooks;
  const featuredBooks = storeBooks.slice(0, 6);
  const newBooks = [...storeBooks].sort((a, b) => b.publishedYear - a.publishedYear).slice(0, 4);

  return (
    <StoreShell>
        <HeroSection book={storeBooks[0]} />
        <TrustBenefits />
        <CategorySection />
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
