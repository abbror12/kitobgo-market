import { Clock3, Instagram, Phone, Send } from "lucide-react";
import Link from "next/link";
import { Logo } from "./Logo";

const columns = [
  { title: "Xaridorlarga", links: [{ label: "Yetkazib berish", href: "/about#delivery" }, { label: "To‘lov", href: "/about#payment" }, { label: "Qaytarish", href: "/about#returns" }, { label: "Ko‘p beriladigan savollar", href: "/#faq" }] },
  { title: "Kategoriyalar", links: [{ label: "Qur’oni Karim", href: "/catalog?category=quran" }, { label: "Hadis", href: "/catalog?category=hadis" }, { label: "Tafsir", href: "/catalog?category=tafsir" }, { label: "Tarix", href: "/catalog?category=tarix" }] },
  { title: "Kitob.go haqida", links: [{ label: "Biz haqimizda", href: "/about" }, { label: "Blog", href: "/blog" }, { label: "Hamkorlik", href: "/contact" }, { label: "Mualliflar", href: "/authors" }] },
];

export function Footer() {
  return (
    <footer id="contact" className="border-t border-line bg-white pb-24 pt-14 md:pb-8">
      <div className="container-page grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1.2fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-[15px] leading-7 text-muted">Original va saralangan kitoblarni xotirjam xarid qilishingiz uchun yaratilgan ishonchli onlayn do‘kon.</p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="font-bold text-ink">{column.title}</h3>
            <ul className="mt-4 space-y-3 text-[14px] text-muted">
              {column.links.map((link) => <li key={link.label}><Link href={link.href} className="hover:text-brand">{link.label}</Link></li>)}
            </ul>
          </div>
        ))}
        <div>
          <h3 className="font-bold text-ink">Aloqa va ijtimoiy tarmoqlar</h3>
          <div className="mt-4 space-y-3 text-[14px] text-muted">
            <a href="tel:+998712000000" className="flex items-center gap-2 hover:text-brand"><Phone size={17} aria-hidden="true" /> +998 71 200 00 00</a>
            <a href="https://t.me/kitobgo" className="flex items-center gap-2 hover:text-brand"><Send size={17} aria-hidden="true" /> @kitobgo</a>
            <span className="flex items-center gap-2"><Clock3 size={17} aria-hidden="true" /> Har kuni, 09:00–21:00</span>
            <div className="flex gap-2 pt-2">
              <a href="https://t.me/kitobgo" className="social-button" aria-label="Telegram"><Send size={18} /></a>
              <a href="https://instagram.com/kitobgo" className="social-button" aria-label="Instagram"><Instagram size={18} /></a>
            </div>
          </div>
        </div>
      </div>
      <div className="container-page mt-12 flex flex-col gap-3 border-t border-line pt-6 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Kitob.go. Barcha huquqlar himoyalangan.</p>
        <div className="flex gap-5"><Link href="/about">Maxfiylik siyosati</Link><Link href="/about">Foydalanish shartlari</Link></div>
      </div>
    </footer>
  );
}
