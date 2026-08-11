"use client";

import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { isExternalImage } from "@/lib/format";

export function ProductGallery({ title, images, color, badge }: { title: string; images: string[]; color: string; badge?: string }) {
  const gallery = images.length ? images : ["/images/quran-premium.png"];
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  function previous() { setActiveIndex((index) => (index - 1 + gallery.length) % gallery.length); }
  function next() { setActiveIndex((index) => (index + 1) % gallery.length); }

  return (
    <div>
      <div className="relative aspect-[16/11] overflow-hidden rounded-xl sm:aspect-[4/4.4] sm:rounded-2xl" style={{ backgroundColor: color }}>
        {badge && <span className="absolute left-4 top-4 z-10 rounded-full bg-gold px-3 py-1.5 text-xs font-extrabold text-ink">{badge}</span>}
        <button type="button" onClick={() => setZoomed(true)} className="absolute inset-0 z-[5] cursor-zoom-in" aria-label="Rasmni kattalashtirish">
          <Image src={gallery[activeIndex]} alt={`${title} kitobi — ${activeIndex + 1}-rasm`} fill priority unoptimized={isExternalImage(gallery[activeIndex])} sizes="(max-width: 1024px) 100vw, 45vw" className="object-contain sm:object-cover" />
          <span className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full border border-line bg-cream/90 text-ink shadow-sm sm:bottom-4 sm:right-4 sm:size-10"><Expand size={17} /></span>
        </button>
        {gallery.length > 1 && <><button type="button" onClick={previous} className="absolute left-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-cream/90 shadow-card transition hover:bg-cream" aria-label="Oldingi rasm"><ChevronLeft size={21} /></button><button type="button" onClick={next} className="absolute right-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-cream/90 shadow-card transition hover:bg-cream" aria-label="Keyingi rasm"><ChevronRight size={21} /></button><span className="absolute bottom-4 left-4 z-10 rounded-full bg-ink/75 px-3 py-1 text-xs font-bold text-cream">{activeIndex + 1} / {gallery.length}</span></>}
      </div>

      {gallery.length > 1 && <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto pb-1">{gallery.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setActiveIndex(index)} className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${activeIndex === index ? "border-cocoa shadow-sm" : "border-transparent opacity-65 hover:opacity-100"}`} style={{ backgroundColor: color }} aria-label={`${index + 1}-rasmni ko‘rish`}><Image src={image} alt="" fill unoptimized={isExternalImage(image)} sizes="80px" className="object-cover" /></button>)}</div>}

      {zoomed && <div className="fixed inset-0 z-[100] grid place-items-center bg-sand0 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${title} rasmlari`} onClick={() => setZoomed(false)}><button type="button" onClick={() => setZoomed(false)} className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-cream text-2xl text-ink" aria-label="Yopish">×</button><div className="relative h-[85vh] w-full max-w-5xl" onClick={(event) => event.stopPropagation()}><Image src={gallery[activeIndex]} alt={`${title} kitobi kattalashtirilgan rasm`} fill unoptimized={isExternalImage(gallery[activeIndex])} sizes="100vw" className="object-contain" />{gallery.length > 1 && <><button type="button" onClick={previous} className="absolute left-0 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-cream/95 text-ink" aria-label="Oldingi rasm"><ChevronLeft /></button><button type="button" onClick={next} className="absolute right-0 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-cream/95 text-ink" aria-label="Keyingi rasm"><ChevronRight /></button></>}</div></div>}
    </div>
  );
}
