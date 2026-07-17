import { faqItems } from "@/data/home";

export function FAQAccordion() {
  return (
    <section id="faq" className="section-space bg-white">
      <div className="container-page grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:gap-16">
        <div><span className="eyebrow">Savollarga javoblar</span><h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Ko‘p beriladigan savollar</h2><p className="mt-4 max-w-md leading-7 text-muted">Javob topilmadimi? Maslahatchimizga qo‘ng‘iroq qiling yoki Telegram orqali yozing.</p></div>
        <div className="divide-y divide-line border-y border-line">
          {faqItems.map((item, index) => (
            <details key={item.id} className="faq-item group" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[16px] font-bold text-ink sm:text-[17px]">
                {item.question}<span className="faq-plus grid size-8 shrink-0 place-items-center rounded-full bg-brand/10 text-xl font-normal text-brand">+</span>
              </summary>
              <p className="max-w-2xl pb-5 pr-10 text-[14px] leading-7 text-muted sm:text-[15px]">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
