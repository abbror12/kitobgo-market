"use client";

import { BookOpen, Heart, Home, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Savat bu yerda ataylab yo'q: mobil yuqori panelda (MobileHeader) savat ikonkasi
// hisoblagichi bilan turibdi, ikkalasi bir ekranda takrorlanib qolardi.
// "Profil" kirilmagan foydalanuvchini /profile → /login zanjiri orqali kirishga olib boradi.
const items = [
  { label: "Bosh sahifa", href: "/", icon: Home },
  { label: "Katalog", href: "/catalog", icon: BookOpen },
  { label: "Sevimlilar", href: "/favorites", icon: Heart },
  { label: "Profil", href: "/profile", icon: UserRound },
];

export function MobileBottomNavigation() {
  const pathname = usePathname();
  return (
    // Ilovadagi panel: navSurface yuza, tepasida bitta line chizig'i, soyasiz.
    <nav aria-label="Mobil pastki navigatsiya" className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-navSurface px-1 pb-[max(5px,env(safe-area-inset-bottom))] pt-1 md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl text-[9px] tracking-[0.4px] ${active ? "font-semibold text-ink" : "font-normal text-muted"}`}
            >
              <Icon size={19} strokeWidth={active ? 2.4 : 1.8} className={active ? "text-cocoa" : "text-muted"} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
