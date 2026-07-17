"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Bosh sahifa", href: "/" },
  { label: "Katalog", href: "/catalog" },
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
    <nav className="hidden border-t border-line bg-white md:block" aria-label="Asosiy navigatsiya">
      <div className="container-page scrollbar-hide flex h-12 items-center gap-6 overflow-x-auto whitespace-nowrap text-[13px] font-medium lg:gap-10 lg:text-[14px]">
        {links.map((link) => {
          const isCatalogShortcut = link.href.startsWith("/catalog?") || link.href.startsWith("/catalog#");
          const active = link.href === "/" ? pathname === "/" : !isCatalogShortcut && pathname.startsWith(link.href);
          return (
            <Link key={link.label} href={link.href} className={`relative flex h-full items-center transition hover:text-brand ${active ? "text-brand after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-brand" : "text-ink"}`}>
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
