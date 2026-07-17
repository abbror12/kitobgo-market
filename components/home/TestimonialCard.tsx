import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/types/book";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-6">
      <div className="flex items-center justify-between"><div className="flex gap-0.5" aria-label={`${testimonial.rating} yulduz`}>{Array.from({ length: testimonial.rating }, (_, index) => <Star key={index} size={16} className="fill-amber-400 text-amber-400" aria-hidden="true" />)}</div><Quote className="text-brand/15" size={30} aria-hidden="true" /></div>
      <p className="mt-4 text-[15px] leading-7 text-ink">“{testimonial.text}”</p>
      <div className="mt-5 border-t border-line pt-4"><strong className="block text-[14px] text-ink">{testimonial.name}</strong><span className="text-[12px] text-muted">{testimonial.location}</span></div>
    </article>
  );
}
