import { Heart, Menu, X } from "lucide-react";
import Link from "next/link";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";

// Menyu — "qolgan hammasi" ro'yxati. Bosh sahifa / Katalog / Savatcha / Profil bu yerda yo'q:
// ular pastki panelda turibdi va menyu ochilganda ham ko'rinib turadi — takror bo'lardi.
const mobileLinks = [
  { label: "Kategoriyalar", href: "/catalog#kategoriyalar" },
  { label: "Mualliflar", href: "/authors" },
  { label: "Yangi kelganlar", href: "/catalog?sort=newest" },
  { label: "Blog", href: "/blog" },
  { label: "Biz haqimizda", href: "/about" },
  { label: "Aloqa", href: "/contact" },
];

export function MobileHeader() {
  return (
    <div className="px-3 pb-2 md:hidden">
      <div className="flex h-12 items-center justify-between">
        <details className="mobile-menu relative">
          <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-line" aria-label="Menyuni ochish">
            <Menu className="menu-open" size={20} aria-hidden="true" />
            <X className="menu-close hidden" size={20} aria-hidden="true" />
          </summary>
          <nav aria-label="Mobil navigatsiya" className="absolute left-0 top-[46px] z-50 w-[min(82vw,320px)] rounded-2xl border border-line bg-cream p-2 shadow-card">
            {mobileLinks.map(({ label, href }) => (
              <Link key={label} href={href} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-sand hover:text-brand">
                {label}
              </Link>
            ))}
          </nav>
        </details>
        <Logo compact />
        {/* Savat bu yerda ataylab yo'q: mobil pastki panelda (MobileBottomNavigation) savat
            hisoblagichi bilan turibdi — ikkalasi bir ekranda takrorlanib qolardi. */}
        <Link href="/favorites" className="grid size-10 place-items-center rounded-xl" aria-label="Sevimlilar"><Heart size={19} aria-hidden="true" /></Link>
      </div>
      <SearchBar mobile />
    </div>
  );
}
