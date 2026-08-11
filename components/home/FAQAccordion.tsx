import { faqItems } from "@/data/home";

export function FAQAccordion() {
  return (
    <section id="faq" className="section-space border-y border-line bg-navSurface">
      <div className="container-page grid gap-5 sm:gap-8 lg:grid-cols-[.75fr_1.25fr] lg:gap-16">
        <div><span className="eyebrow">Savollarga javoblar</span><h2 className="font-serif mt-2 text-[22px] font-semibold tracking-tight text-ink sm:mt-3 sm:text-4xl">Ko‘p beriladigan savollar</h2><p className="mt-2 max-w-md text-[13px] leading-5 text-bodyText sm:mt-4 sm:text-base sm:leading-7">Javob topilmadimi? Maslahatchimizga qo‘ng‘iroq qiling yoki Telegram orqali yozing.</p></div>
        <div className="divide-y divide-line border-y border-line">
          {faqItems.map((item, index) => (
            <details key={item.id} className="faq-item group" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 text-[14px] font-bold text-ink sm:py-5 sm:text-[17px]">
                {item.question}<span className="faq-plus grid size-7 shrink-0 place-items-center rounded-full bg-sand text-lg font-normal text-cocoa sm:size-8 sm:text-xl">+</span>
              </summary>
              <p className="max-w-2xl pb-4 pr-8 text-[13px] leading-5 text-bodyText sm:pb-5 sm:pr-10 sm:text-[15px] sm:leading-7">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
