import { BadgeCheck, Check, CirclePlay, CreditCard, ShoppingBag, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice, isExternalImage } from "@/lib/format";
import type { Book } from "@/types/book";

const benefits = ["So‘zma-so‘z tarjima", "Rangli izohlar", "Oson tushunarli", "Din ishlari qo‘mitasi ruxsatiga ega"];

export function HeroSection({ book }: { book: Book }) {
  return (
    <section className="pt-4 md:pt-6">
      <div className="container-page">
        <div className="hero-panel relative grid min-h-[390px] grid-cols-[1.22fr_.78fr] overflow-hidden rounded-[24px] bg-[#F4F0E8] sm:grid-cols-[1.05fr_.95fr] md:min-h-[470px] lg:grid-cols-[1.08fr_.92fr]">
          <div className="relative z-10 flex flex-col justify-center p-4 sm:p-8 lg:p-12">
            <span className="mb-4 w-fit rounded-full bg-brand-gold/25 px-3 py-1.5 text-[12px] font-bold text-[#69530F]">Bestseller</span>
            <h1 className="max-w-xl text-[30px] font-extrabold leading-[1.02] tracking-[-0.045em] text-ink sm:text-4xl lg:text-[48px]">{book.title}</h1>
            <p className="mt-3 max-w-md text-[15px] font-medium leading-6 text-ink sm:text-lg">{book.description}</p>
            <ul className="mt-5 hidden grid-cols-2 gap-x-4 gap-y-2 text-[14px] text-ink sm:grid lg:grid-cols-1">
              {benefits.map((benefit) => <li key={benefit} className="flex items-center gap-2"><Check size={17} className="text-brand" strokeWidth={2.5} aria-hidden="true" />{benefit}</li>)}
            </ul>
            <div className="mt-6">
              <p className="text-[22px] font-extrabold text-brand sm:text-[26px]">{formatPrice(book.price)}</p>
              <div className="mt-2 hidden flex-wrap gap-4 text-[12px] text-muted lg:flex">
                <span className="inline-flex items-center gap-1.5"><Truck size={16} aria-hidden="true" /> Bepul yetkazib berish</span>
                <span className="inline-flex items-center gap-1.5"><CreditCard size={16} aria-hidden="true" /> To‘lov qabul qilgandan keyin</span>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <Link href={`/books/${book.slug}`} className="button-primary h-12 px-3 text-[13px] sm:w-fit sm:px-6 sm:text-base"><ShoppingBag size={18} aria-hidden="true" /> Xarid qilish</Link>
              <Link href="#video-sharhlar" className="button-secondary hidden h-12 px-6 sm:inline-flex"><CirclePlay size={19} aria-hidden="true" /> Video sharh</Link>
            </div>
          </div>
          <div className="relative min-h-[220px] sm:min-h-full">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(199,168,74,.13),transparent_65%)]" />
            <Image src={book.image} alt={`${book.title} kitobi`} fill priority unoptimized={isExternalImage(book.image)} sizes="(max-width: 640px) 45vw, 50vw" className="object-contain p-3 sm:p-8 lg:p-10" />
            <div className="absolute bottom-5 right-5 hidden w-52 space-y-2.5 xl:block">
              <div className="hero-fact"><BadgeCheck size={21} aria-hidden="true" /><span><strong>Rasmiy ruxsat</strong>Din ishlari qo‘mitasi</span></div>
              <div className="hero-fact"><Truck size={21} aria-hidden="true" /><span><strong>Bepul yetkazish</strong>Butun O‘zbekiston bo‘ylab</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
