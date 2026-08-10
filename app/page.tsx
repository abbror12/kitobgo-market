import { FAQAccordion } from "@/components/home/FAQAccordion";
import { HeroSection } from "@/components/home/HeroSection";
import { SpecialCollections, TestimonialsSection, VideoReviews } from "@/components/home/AdditionalSections";
import { StatisticsBanner } from "@/components/home/StatisticsBanner";
import { TelegramCTA } from "@/components/home/TelegramCTA";
import { TrustBenefits } from "@/components/home/TrustBenefits";
import { StoreShell } from "@/components/layout/StoreShell";
import { ProductSection } from "@/components/product/ProductSection";
import { books as fallbackBooks } from "@/data/books";
import { getBooks } from "@/lib/store-api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Backend'da "sotuvlar soni" bo'yicha sort yo'q — eng ko'p baholanganlar (ratingCount)
  // mashhurlik o'rnida ishlatiladi; yangilari createdAt bo'yicha.
  const [featured, newest] = await Promise.all([
    getBooks({ sort: "ratingCount,desc", size: 6 }).catch(() => null),
    getBooks({ sort: "createdAt,desc", size: 4 }).catch(() => null),
  ]);
  const featuredBooks = featured?.content.length ? featured.content : fallbackBooks.slice(0, 6);
  const newBooks = newest?.content.length ? newest.content : [...fallbackBooks].sort((a, b) => b.publishedYear - a.publishedYear).slice(0, 4);
  const storeBooks = featuredBooks;

  return (
    <StoreShell>
        <HeroSection book={storeBooks[0]} />
        <TrustBenefits />
        <ProductSection title="Eng ko‘p sotilgan kitoblar" subtitle="Xaridorlarimiz eng ko‘p tanlagan nashrlar" books={featuredBooks} />
        <StatisticsBanner />
        <ProductSection id="yangi-kelganlar" title="Yangi kelganlar" subtitle="Kutubxonamizga yaqinda qo‘shilgan kitoblar" books={newBooks} />
        <SpecialCollections />
        <VideoReviews />
        <TestimonialsSection />
        <FAQAccordion />
        <TelegramCTA />
    </StoreShell>
  );
}
