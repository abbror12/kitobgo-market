import { ArrowRight, BookHeart, CirclePlay, Gift, Layers3, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { testimonials } from "@/data/home";
import { TestimonialCard } from "./TestimonialCard";

const collections = [
  { title: "Oila kutubxonasi", text: "Har bir xonadon uchun saralangan 8 kitob", icon: BookHeart, color: "bg-[#E8F2EC]" },
  { title: "Ilm sari ilk qadam", text: "Yangi o‘quvchilar uchun sodda to‘plam", icon: Layers3, color: "bg-[#F4EDDC]" },
  { title: "Sovg‘a to‘plami", text: "Yaqinlaringiz uchun didli va mazmunli tanlov", icon: Gift, color: "bg-[#EEE8F0]" },
];

export function SpecialCollections() {
  return (
    <section className="section-space bg-white">
      <div className="container-page">
        <div className="section-heading"><div><h2>Maxsus to‘plamlar</h2><p>Bir-birini to‘ldiradigan kitoblar jamlanmasi</p></div><Link href="/catalog" className="section-link">Barchasi <ArrowRight size={17} /></Link></div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {collections.map(({ title, text, icon: Icon, color }) => (
            <Link key={title} href="/catalog" className={`group relative min-h-52 overflow-hidden rounded-2xl p-6 sm:p-7 ${color}`}>
              <span className="grid size-12 place-items-center rounded-xl bg-white text-brand shadow-sm"><Icon size={24} strokeWidth={1.7} aria-hidden="true" /></span>
              <h3 className="mt-7 text-xl font-extrabold text-ink">{title}</h3><p className="mt-2 max-w-[75%] text-[14px] leading-6 text-muted">{text}</p>
              <ArrowRight className="absolute bottom-7 right-7 text-brand transition group-hover:translate-x-1" size={22} aria-hidden="true" />
              <div className="absolute -right-12 -top-12 size-40 rounded-full border-[28px] border-white/40" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function VideoReviews() {
  return (
    <section id="video-sharhlar" className="section-space">
      <div className="container-page">
        <div className="section-heading"><div><h2>Video sharhlar</h2><p>Kitobni xariddan oldin yaqindan ko‘ring</p></div><Link href="#" className="section-link">Barchasi <ArrowRight size={17} /></Link></div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {["Qur’oni Karim — nashr sifati", "To‘rt buyuk sahobiy to‘plami", "Oilaviy kutubxona uchun 5 tavsiya"].map((title, index) => (
            <article key={title} className="group overflow-hidden rounded-2xl border border-line bg-white">
              <div className="relative aspect-video overflow-hidden bg-[#EEEAE1]">
                <Image src="/images/quran-premium.png" alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <button type="button" className="absolute inset-0 m-auto grid size-14 place-items-center rounded-full bg-white/95 text-brand shadow-card transition group-hover:scale-110" aria-label={`${title} videosini ko‘rish`}><Play size={22} className="ml-1 fill-brand" aria-hidden="true" /></button>
                <span className="absolute bottom-3 right-3 rounded-md bg-ink/80 px-2 py-1 text-[11px] font-bold text-white">{index + 3}:24</span>
              </div>
              <div className="p-5"><span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand"><CirclePlay size={15} aria-hidden="true" /> Video sharh</span><h3 className="mt-2 font-bold leading-6 text-ink">{title}</h3></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section id="about" className="section-space bg-[#F3F6F3]">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center"><span className="eyebrow">Ishonchli xizmat</span><h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Xaridorlarimiz fikri</h2><p className="mt-3 text-muted">Kitob.go orqali xarid qilgan insonlarning samimiy taassurotlari.</p></div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">{testimonials.map((testimonial) => <TestimonialCard key={testimonial.id} testimonial={testimonial} />)}</div>
      </div>
    </section>
  );
}
