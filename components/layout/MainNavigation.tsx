"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// "Katalog" bu yerda ataylab yo'q: tepada, logotip yonida katta "Katalog" tugmasi turibdi —
// ikkovi bir ekranda, bir-biridan 50px narida takrorlanib turardi.
const links = [
  { label: "Bosh sahifa", href: "/" },
  { label: "Kategoriyalar", href: "/catalog#kategoriyalar" },
  { label: "Mualliflar", href: "/authors" },
  { label: "Yangi kelganlar", href: "/catalog?sort=newest" },
  { label: "Blog", href: "/blog" },
  { label: "Biz haqimizda", href: "/about" },
  { label: "Aloqa", href: "/contact" },
];

export function MainNavigation() {
  const pathname = usePathname();
  return (
    <nav className="hidden border-t border-line bg-cream md:block" aria-label="Asosiy navigatsiya">
      <div className="container-page scrollbar-hide flex h-12 items-center gap-6 overflow-x-auto whitespace-nowrap text-[13px] font-medium lg:gap-10 lg:text-[14px]">
        {links.map((link) => {
          const isCatalogShortcut = link.href.startsWith("/catalog?") || link.href.startsWith("/catalog#");
          const active = link.href === "/" ? pathname === "/" : !isCatalogShortcut && pathname.startsWith(link.href);
          return (
            <Link key={link.label} href={link.href} className={`relative flex h-full items-center transition hover:text-cocoa ${active ? "text-cocoa after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-cocoa" : "text-ink"}`}>
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
