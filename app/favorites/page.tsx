import type { Metadata } from "next";
import { FavoritesContent } from "@/components/favorites/FavoritesContent";
import { StoreShell } from "@/components/layout/StoreShell";
import { PageIntro } from "@/components/shared/PageIntro";

export const metadata: Metadata = { title: "Sevimli kitoblar — Kitob.go" };

export default function FavoritesPage() {
  return <StoreShell><PageIntro eyebrow="Sizning tanlovingiz" title="Sevimli kitoblar" description="Keyinroq xarid qilish uchun saqlagan barcha kitoblaringiz bir joyda." breadcrumbs={[{ label: "Sevimlilar" }]} /><section className="container-page py-5 sm:py-12"><FavoritesContent /></section></StoreShell>;
}
