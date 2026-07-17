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
    <section aria-label="Kitob.go afzalliklari" className="border-b border-line bg-white">
      <div className="container-page grid grid-cols-2 gap-px py-5 sm:grid-cols-3 lg:grid-cols-5 lg:py-7">
        {benefits.map(({ title, subtitle, icon: Icon }, index) => (
          <div key={title} className={`flex items-start gap-3 px-2 py-3 sm:px-4 ${index === benefits.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand"><Icon size={21} strokeWidth={1.8} aria-hidden="true" /></span>
            <span><strong className="block text-[13px] leading-5 text-ink sm:text-[14px]">{title}</strong><span className="hidden text-[11px] leading-4 text-muted xl:block">{subtitle}</span></span>
          </div>
        ))}
      </div>
    </section>
  );
}
