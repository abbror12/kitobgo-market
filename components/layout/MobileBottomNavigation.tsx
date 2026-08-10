"use client";

import { BookOpen, Heart, Home, ShoppingCart, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartBadge } from "../cart/CartBadge";

// "Profil" kirilmagan foydalanuvchini /profile → /login zanjiri orqali kirishga olib boradi.
const items = [
  { label: "Bosh sahifa", href: "/", icon: Home },
  { label: "Katalog", href: "/catalog", icon: BookOpen },
  { label: "Sevimlilar", href: "/favorites", icon: Heart },
  { label: "Profil", href: "/profile", icon: UserRound },
  { label: "Savatcha", href: "/cart", icon: ShoppingCart },
];

export function MobileBottomNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Mobil pastki navigatsiya" className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 px-1 pb-[max(5px,env(safe-area-inset-bottom))] pt-1 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={label} href={href} className={`relative flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl text-[9px] font-semibold ${active ? "text-brand" : "text-muted"}`}>
              <Icon size={19} strokeWidth={active ? 2.4 : 1.8} aria-hidden="true" />
              <span>{label}</span>
              {label === "Savatcha" && <CartBadge className="absolute right-[22%] top-0 grid min-h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[9px] text-white" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
