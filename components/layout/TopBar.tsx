import { BadgeCheck, CircleDollarSign, Truck } from "lucide-react";
import Link from "next/link";

export function TopBar() {
  return (
    <div className="hidden border-b border-white/10 bg-brand-dark text-white lg:block">
      <div className="container-page flex h-9 items-center justify-between text-[13px]">
        <div className="flex items-center gap-5">
          <span className="inline-flex items-center gap-1.5"><Truck size={15} aria-hidden="true" /> Butun O‘zbekiston bo‘ylab bepul yetkazib berish</span>
          <span className="inline-flex items-center gap-1.5"><CircleDollarSign size={15} aria-hidden="true" /> To‘lov mahsulot qabul qilingandan keyin</span>
          <span className="hidden items-center gap-1.5 xl:inline-flex"><BadgeCheck size={15} aria-hidden="true" /> Din ishlari qo‘mitasi ruxsatiga ega kitoblar</span>
        </div>
        <nav aria-label="Yordamchi navigatsiya" className="flex items-center gap-5 text-white/85">
          <Link href="https://t.me/kitobgouz">Telegram</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/about">Biz haqimizda</Link>
          <Link href="/contact">Aloqa</Link>
        </nav>
      </div>
    </div>
  );
}
