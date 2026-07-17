import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { StoreShell } from "@/components/layout/StoreShell";
import { PageIntro } from "@/components/shared/PageIntro";
import { getProduct, getRegions } from "@/lib/store-api";

export const metadata: Metadata = { title: "Buyurtmani rasmiylashtirish — Kitob.go" };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ book?: string; quantity?: string; items?: string }> }) {
  const params = await searchParams;
  const quantity = Math.max(1, Number(params.quantity) || 1);
  const directBook = params.book ? await getProduct(params.book).catch(() => null) : null;
  const requestedItems = params.items?.split(",").map((item) => {
    const [id, rawQuantity] = item.split(":");
    return { id: decodeURIComponent(id), quantity: Math.max(1, Number(rawQuantity) || 1) };
  }).filter((item) => item.id) ?? [];
  const cartBooks = directBook ? [] : await Promise.all(requestedItems.map(async (item) => ({ book: await getProduct(item.id).catch(() => null), quantity: item.quantity })));
  const regions = await getRegions().catch(() => []);
  const items = directBook ? [{ book: directBook, quantity }] : cartBooks.filter((item): item is { book: NonNullable<typeof item.book>; quantity: number } => Boolean(item.book));
  if (!items.length) redirect("/catalog");

  return (
    <StoreShell>
      <PageIntro
        eyebrow="Yakuniy qadam"
        title="Buyurtmani rasmiylashtirish"
        description="Ism, telefon va viloyatni kiriting — operatorimiz manzilni aniqlash uchun bog‘lanadi."
        breadcrumbs={[{ label: directBook ? directBook.title : "Savatcha", href: directBook ? `/books/${directBook.slug}` : "/cart" }, { label: "Rasmiylashtirish" }]}
      />
      <CheckoutForm items={items} regions={regions} />
    </StoreShell>
  );
}
