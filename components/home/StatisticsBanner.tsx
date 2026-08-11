import { BookCopy, Headphones, Smile, Truck } from "lucide-react";

const stats = [
  { value: "10 000+", label: "Mamnun mijozlar", icon: Smile },
  { value: "500+", label: "Original kitoblar", icon: BookCopy },
  { value: "1 kun ichida", label: "Yetkazib berish", icon: Truck },
  { value: "24/7", label: "Mijozlarni qo‘llab-quvvatlash", icon: Headphones },
];

export function StatisticsBanner() {
  return (
    <section className="container-page py-3 sm:py-8" aria-label="Kitob.go raqamlarda">
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl bg-gradient-to-r from-inkButton to-cocoa text-cream lg:grid-cols-4">
        {stats.map(({ value, label, icon: Icon }) => (
          <div key={label} className="flex items-center gap-2 border-cream/15 p-3 even:border-l lg:border-l lg:first:border-l-0 lg:p-7">
            <Icon size={22} strokeWidth={1.6} className="shrink-0 text-gold sm:size-[27px]" aria-hidden="true" />
            <span><strong className="block text-[15px] font-extrabold sm:text-xl">{value}</strong><span className="block text-[10px] leading-3.5 text-cream/75 sm:text-[13px]">{label}</span></span>
          </div>
        ))}
      </div>
    </section>
  );
}
