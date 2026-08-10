import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { StoreShell } from "@/components/layout/StoreShell";
import { PageIntro } from "@/components/shared/PageIntro";
import { getBookDetail, getRegions } from "@/lib/store-api";

export const metadata: Metadata = { title: "Buyurtmani rasmiylashtirish — Kitob.go" };

// items=slug:miqdor,slug:miqdor (savatdan) yoki book=slug&quantity=n (to'g'ridan-to'g'ri).
export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ book?: string; quantity?: string; items?: string }> }) {
  const params = await searchParams;
  const quantity = Math.max(1, Number(params.quantity) || 1);
  const directBook = params.book ? await getBookDetail(params.book).catch(() => null) : null;
  const requestedItems = params.items?.split(",").map((item) => {
    const [slug, rawQuantity] = item.split(":");
    return { slug: decodeURIComponent(slug), quantity: Math.max(1, Number(rawQuantity) || 1) };
  }).filter((item) => item.slug) ?? [];
  const cartBooks = directBook ? [] : await Promise.all(requestedItems.map(async (item) => ({ book: await getBookDetail(item.slug).catch(() => null), quantity: item.quantity })));
  const regions = await getRegions().catch(() => []);
  const items = directBook ? [{ book: directBook, quantity }] : cartBooks.filter((item): item is { book: NonNullable<typeof item.book>; quantity: number } => Boolean(item.book));
  if (!items.length) redirect("/catalog");

  return (
    <StoreShell>
      <PageIntro
        eyebrow="Yakuniy qadam"
        title="Buyurtmani rasmiylashtirish"
        description="Telefon raqamingiz bilan kiring, hududni tanlang — qolganini biz hal qilamiz."
        breadcrumbs={[{ label: directBook ? directBook.title : "Savatcha", href: directBook ? `/books/${directBook.slug}` : "/cart" }, { label: "Rasmiylashtirish" }]}
      />
      <CheckoutForm items={items} regions={regions} source={directBook ? "direct" : "cart"} />
    </StoreShell>
  );
}
