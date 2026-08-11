import { BadgeCheck, CalendarCheck, CreditCard, PackageCheck, Truck } from "lucide-react";

const benefits = [
  { title: "Bepul yetkazib berish", subtitle: "Butun O‘zbekiston bo‘ylab", icon: Truck },
  { title: "Qabul qilganda to‘lov", subtitle: "Avval tekshiring, keyin to‘lang", icon: CreditCard },
  { title: "Original nashrlar", subtitle: "Faqat rasmiy hamkorlardan", icon: PackageCheck },
  { title: "Ruxsatga ega", subtitle: "Tekshirilgan diniy adabiyotlar", icon: BadgeCheck },
  { title: "14 kun ichida qaytarish", subtitle: "Xotirjam xarid kafolati", icon: CalendarCheck },
];

export function TrustBenefits() {
  return (
    <section aria-label="Kitob.go afzalliklari" className="border-b border-line bg-cream">
      <div className="scrollbar-hide flex snap-x gap-1.5 overflow-x-auto px-3 py-3 sm:container-page sm:grid sm:grid-cols-3 sm:gap-px sm:py-5 lg:grid-cols-5 lg:py-7">
        {benefits.map(({ title, subtitle, icon: Icon }, index) => (
          <div key={title} className={`flex w-[180px] shrink-0 snap-start items-center gap-2 rounded-xl bg-navSurface px-2.5 py-2 sm:w-auto sm:items-start sm:gap-3 sm:bg-transparent sm:px-4 sm:py-3 ${index === benefits.length - 1 ? "sm:col-span-1" : ""}`}>
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sand text-cocoa sm:size-10"><Icon size={19} strokeWidth={1.8} aria-hidden="true" /></span>
            <span><strong className="block text-[12px] leading-4 text-ink sm:text-[14px] sm:leading-5">{title}</strong><span className="hidden text-[11px] leading-4 text-bodyText xl:block">{subtitle}</span></span>
          </div>
        ))}
      </div>
    </section>
  );
}
