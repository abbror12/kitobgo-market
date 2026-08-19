import { ArrowRight, BookHeart, Gift, Layers3 } from "lucide-react";
import Link from "next/link";
import { testimonials } from "@/data/home";
import { TestimonialCard } from "./TestimonialCard";

const collections = [
  { title: "Oila kutubxonasi", text: "Har bir xonadon uchun saralangan 8 kitob", icon: BookHeart, color: "bg-[#E8EEFA]" },
  { title: "Ilm sari ilk qadam", text: "Yangi o‘quvchilar uchun sodda to‘plam", icon: Layers3, color: "bg-[#EEF2F7]" },
  { title: "Sovg‘a to‘plami", text: "Yaqinlaringiz uchun didli va mazmunli tanlov", icon: Gift, color: "bg-[#E7F2EE]" },
];

export function SpecialCollections() {
  return (
    <section className="section-space border-y border-line bg-navSurface">
      <div className="container-page">
        <div className="section-heading"><div><h2>Maxsus to‘plamlar</h2><p>Bir-birini to‘ldiradigan kitoblar jamlanmasi</p></div><Link href="/catalog" className="section-link">Barchasi <ArrowRight size={17} /></Link></div>
        <div className="mobile-rail mt-4 sm:mt-6 md:grid md:grid-cols-3 md:gap-4">
          {collections.map(({ title, text, icon: Icon, color }) => (
            <Link key={title} href="/catalog" className={`group relative min-h-40 overflow-hidden rounded-2xl p-4 sm:min-h-52 sm:p-7 ${color}`}>
              <span className="grid size-10 place-items-center rounded-xl bg-cream text-brand shadow-sm sm:size-12"><Icon size={21} strokeWidth={1.7} aria-hidden="true" /></span>
              <h3 className="mt-4 text-lg font-extrabold text-ink sm:mt-7 sm:text-xl">{title}</h3><p className="mt-1.5 max-w-[82%] text-[13px] leading-5 text-bodyText sm:mt-2 sm:max-w-[75%] sm:text-[14px] sm:leading-6">{text}</p>
              <ArrowRight className="absolute bottom-7 right-7 text-brand transition group-hover:translate-x-1" size={22} aria-hidden="true" />
              <div className="absolute -right-12 -top-12 size-40 rounded-full border-[28px] border-line" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section id="about" className="section-space bg-sand/40">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center"><span className="eyebrow">Ishonchli xizmat</span><h2 className="font-serif mt-2 text-[22px] font-semibold tracking-tight text-ink sm:mt-3 sm:text-4xl">Xaridorlarimiz fikri</h2><p className="mt-2 text-[13px] text-bodyText sm:mt-3 sm:text-base">Kitob.go orqali xarid qilgan insonlarning samimiy taassurotlari.</p></div>
        <div className="mobile-rail mt-5 sm:mt-8 md:grid md:grid-cols-3 md:gap-4">{testimonials.map((testimonial) => <TestimonialCard key={testimonial.id} testimonial={testimonial} />)}</div>
      </div>
    </section>
  );
}
