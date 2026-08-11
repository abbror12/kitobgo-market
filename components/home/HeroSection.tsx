import { BadgeCheck, Check, CirclePlay, CreditCard, ShoppingBag, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice, isExternalImage } from "@/lib/format";
import type { Book } from "@/types/book";

const benefits = ["So‘zma-so‘z tarjima", "Rangli izohlar", "Oson tushunarli", "Din ishlari qo‘mitasi ruxsatiga ega"];

export function HeroSection({ book }: { book: Book }) {
  return (
    <section className="pt-3 md:pt-6">
      <div className="container-page">
        <div className="hero-panel relative grid min-h-[310px] grid-cols-[1.3fr_.7fr] overflow-hidden rounded-[24px] border border-line bg-sand sm:min-h-[390px] sm:grid-cols-[1.05fr_.95fr] md:min-h-[470px] lg:grid-cols-[1.08fr_.92fr]">
          <div className="relative z-10 flex flex-col justify-center p-3.5 sm:p-8 lg:p-12">
            <span className="mb-2 w-fit rounded-full bg-cream px-2.5 py-1 text-[10px] font-bold text-cocoaDark sm:mb-4 sm:px-3 sm:py-1.5 sm:text-[12px]">Bestseller</span>
            <h1 className="max-w-xl font-serif text-[30px] font-semibold leading-[1.06] tracking-[-0.015em] text-ink sm:text-4xl lg:text-[46px]">{book.title}</h1>
            <p className="mt-2 line-clamp-3 max-w-md text-[13px] font-medium leading-5 text-ink sm:mt-3 sm:text-lg sm:leading-6">{book.description}</p>
            <ul className="mt-5 hidden grid-cols-2 gap-x-4 gap-y-2 text-[14px] text-ink sm:grid lg:grid-cols-1">
              {benefits.map((benefit) => <li key={benefit} className="flex items-center gap-2"><Check size={17} className="text-cocoa" strokeWidth={2.5} aria-hidden="true" />{benefit}</li>)}
            </ul>
            <div className="mt-3 sm:mt-6">
              <p className="font-serif text-[20px] font-semibold text-cocoa sm:text-[26px]">{formatPrice(book.price)}</p>
              <div className="mt-2 hidden flex-wrap gap-4 text-[12px] text-bodyText lg:flex">
                <span className="inline-flex items-center gap-1.5"><Truck size={16} aria-hidden="true" /> Bepul yetkazib berish</span>
                <span className="inline-flex items-center gap-1.5"><CreditCard size={16} aria-hidden="true" /> To‘lov qabul qilgandan keyin</span>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2.5 sm:mt-5 sm:flex-row">
              <Link href={`/books/${book.slug}`} className="button-primary h-10 px-2 text-[12px] sm:h-12 sm:w-fit sm:px-6 sm:text-base"><ShoppingBag size={16} aria-hidden="true" /> Xarid qilish</Link>
              <Link href="#video-sharhlar" className="button-secondary hidden h-12 px-6 sm:inline-flex"><CirclePlay size={19} aria-hidden="true" /> Video sharh</Link>
            </div>
          </div>
          <div className="relative min-h-[180px] sm:min-h-full">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(176,138,62,.16),transparent_65%)]" />
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
