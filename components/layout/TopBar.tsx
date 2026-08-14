import { BadgeCheck, CircleDollarSign, Truck } from "lucide-react";
import Link from "next/link";

export function TopBar() {
  return (
    <div className="hidden border-b border-cream/15 bg-inkButton text-cream lg:block">
      <div className="container-page flex h-9 items-center justify-between text-[13px]">
        <div className="flex items-center gap-5">
          <span className="inline-flex items-center gap-1.5"><Truck size={15} aria-hidden="true" /> Butun O‘zbekiston bo‘ylab bepul yetkazib berish</span>
          <span className="inline-flex items-center gap-1.5"><CircleDollarSign size={15} aria-hidden="true" /> To‘lov mahsulot qabul qilingandan keyin</span>
          <span className="hidden items-center gap-1.5 xl:inline-flex"><BadgeCheck size={15} aria-hidden="true" /> Din ishlari qo‘mitasi ruxsatiga ega kitoblar</span>
        </div>
        {/* Blog / Biz haqimizda / Aloqa bu yerda ataylab yo'q — ular xuddi shu ekranda,
            pastdagi asosiy navigatsiyada turibdi. Bu qatorda faqat ijtimoiy tarmoqlar. */}
        <nav aria-label="Ijtimoiy tarmoqlar" className="flex items-center gap-5 text-cream/85">
          <Link href="https://t.me/kitobgouz">Telegram</Link>
          <Link href="https://www.instagram.com/kitob.go">Instagram</Link>
        </nav>
      </div>
    </div>
  );
}
