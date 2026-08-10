import type { Metadata } from "next";
import { CartContent } from "@/components/cart/CartContent";
import { StoreShell } from "@/components/layout/StoreShell";
import { PageIntro } from "@/components/shared/PageIntro";

export const metadata: Metadata = { title: "Savatcha — Kitob.go" };

export default function CartPage() {
  return <StoreShell><PageIntro eyebrow="Xaridlaringiz" title="Savatcha" description="Tanlangan kitoblar miqdorini tekshiring va buyurtmani davom ettiring." breadcrumbs={[{ label: "Savatcha" }]} /><section className="container-page py-5 sm:py-12"><CartContent /></section></StoreShell>;
}
