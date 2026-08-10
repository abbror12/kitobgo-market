import type { Metadata } from "next";
import { OrderSuccessContent } from "@/components/orders/OrderSuccessContent";
import { StoreShell } from "@/components/layout/StoreShell";

export const metadata: Metadata = { title: "Buyurtma qabul qilindi — Kitob.go", robots: { index: false } };

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string; pay?: string }> }) {
  const params = await searchParams;
  return (
    <StoreShell>
      <OrderSuccessContent orderNumber={params.order?.trim() || null} payPending={params.pay === "1"} />
    </StoreShell>
  );
}
