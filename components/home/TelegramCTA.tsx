import { ArrowRight, Bell, Send } from "lucide-react";
import Link from "next/link";

export function TelegramCTA() {
  return (
    <section id="telegram" className="container-page py-10 sm:py-16">
      <div className="relative overflow-hidden rounded-[28px] bg-brand-dark px-6 py-9 text-white sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14 lg:py-12">
        <div className="absolute -right-16 -top-24 size-72 rounded-full border-[48px] border-white/5" />
        <div className="relative flex items-start gap-4"><span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-brand-gold"><Bell size={27} aria-hidden="true" /></span><div><h2 className="text-2xl font-extrabold sm:text-3xl">Yangi kitoblardan birinchi bo‘lib xabardor bo‘ling</h2><p className="mt-2 max-w-2xl text-[14px] leading-6 text-white/70 sm:text-base">Telegram kanalimizda yangi nashrlar, foydali sharhlar va maxsus takliflar.</p></div></div>
        <Link href="https://t.me/kitobgo" className="relative mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 font-bold text-brand-dark transition hover:bg-brand-gold lg:mt-0"><Send size={18} aria-hidden="true" /> Obuna bo‘lish <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
