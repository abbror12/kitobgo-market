import { Clock3, Instagram, Phone, Send } from "lucide-react";
import Link from "next/link";
import { categories as fallbackCategories } from "@/data/home";
import { getCategoryTree } from "@/lib/store-api";
import { Logo } from "./Logo";

export async function Footer() {
  const tree = await getCategoryTree().catch(() => []);
  const categoryLinks = (tree.length
    ? tree.map((node) => ({ id: String(node.id), name: node.name }))
    : fallbackCategories.map((category) => ({ id: category.id, name: category.name })))
    .slice(0, 4)
    .map((category) => ({ label: category.name, href: `/catalog?category=${category.id}` }));
  const columns = [
    { title: "Xaridorlarga", links: [{ label: "Yetkazib berish", href: "/about#delivery" }, { label: "To‘lov", href: "/about#payment" }, { label: "Qaytarish", href: "/about#returns" }, { label: "Ko‘p beriladigan savollar", href: "/#faq" }] },
    { title: "Kategoriyalar", links: categoryLinks },
    { title: "Kitob.go haqida", links: [{ label: "Biz haqimizda", href: "/about" }, { label: "Blog", href: "/blog" }, { label: "Hamkorlik", href: "/contact" }, { label: "Mualliflar", href: "/authors" }] },
  ];

  return (
    <footer id="contact" className="border-t border-line bg-cream pb-20 pt-8 sm:pt-14 md:pb-8">
      <div className="container-page grid grid-cols-2 gap-6 sm:gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1.2fr]">
        <div className="col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-3 max-w-xs text-[13px] leading-5 text-bodyText sm:mt-5 sm:text-[15px] sm:leading-7">Original va saralangan kitoblarni xotirjam xarid qilishingiz uchun yaratilgan ishonchli onlayn do‘kon.</p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="font-bold text-ink">{column.title}</h3>
            <ul className="mt-3 space-y-2 text-[13px] text-bodyText sm:mt-4 sm:space-y-3 sm:text-[14px]">
              {column.links.map((link) => <li key={link.label}><Link href={link.href} className="hover:text-brand">{link.label}</Link></li>)}
            </ul>
          </div>
        ))}
        <div className="col-span-2 sm:col-span-1">
          <h3 className="font-bold text-ink">Aloqa va ijtimoiy tarmoqlar</h3>
          <div className="mt-4 space-y-3 text-[14px] text-bodyText">
            <a href="tel:+998774488080" className="flex items-center gap-2 hover:text-brand"><Phone size={17} aria-hidden="true" /> +998 77 448 80 80</a>
            <a href="https://t.me/kitobgouz" className="flex items-center gap-2 hover:text-brand"><Send size={17} aria-hidden="true" /> @kitobgouz</a>
            <span className="flex items-center gap-2"><Clock3 size={17} aria-hidden="true" /> Har kuni, 09:00–21:00</span>
            <div className="flex gap-2 pt-2">
              <a href="https://t.me/kitobgouz" className="social-button" aria-label="Telegram"><Send size={18} /></a>
              <a href="https://www.instagram.com/kitob.go" className="social-button" aria-label="Instagram"><Instagram size={18} /></a>
            </div>
          </div>
        </div>
      </div>
      <div className="container-page mt-7 flex flex-col gap-2 border-t border-line pt-4 text-[11px] text-bodyText sm:mt-12 sm:gap-3 sm:pt-6 sm:text-[13px] sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Kitob.go. Barcha huquqlar himoyalangan.</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2"><Link href="/privacy">Maxfiylik siyosati</Link><Link href="/terms">Foydalanish shartlari</Link></div>
      </div>
    </footer>
  );
}
