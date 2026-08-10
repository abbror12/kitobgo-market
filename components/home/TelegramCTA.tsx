import { ArrowRight, Bell, Send } from "lucide-react";
import Link from "next/link";

export function TelegramCTA() {
  return (
    <section id="telegram" className="container-page py-7 sm:py-16">
      <div className="relative overflow-hidden rounded-[20px] bg-brand-dark px-4 py-5 text-white sm:rounded-[28px] sm:px-10 sm:py-9 lg:flex lg:items-center lg:justify-between lg:px-14 lg:py-12">
        <div className="absolute -right-16 -top-24 size-72 rounded-full border-[48px] border-white/5" />
        <div className="relative flex items-start gap-3 sm:gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-brand-gold sm:size-14 sm:rounded-2xl"><Bell size={23} aria-hidden="true" /></span><div><h2 className="text-lg font-extrabold sm:text-3xl">Yangi kitoblardan birinchi bo‘lib xabardor bo‘ling</h2><p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-white/70 sm:mt-2 sm:text-base sm:leading-6">Telegram kanalimizda yangi nashrlar, foydali sharhlar va maxsus takliflar.</p></div></div>
        <Link href="https://t.me/kitobgo" className="relative mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-brand-dark transition hover:bg-brand-gold sm:mt-6 sm:h-12 sm:px-6 sm:text-base lg:mt-0"><Send size={18} aria-hidden="true" /> Obuna bo‘lish <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
