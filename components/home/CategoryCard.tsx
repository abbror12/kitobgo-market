import { Baby, BookMarked, BookOpen, Flower2, HeartHandshake, Landmark, LibraryBig, ScrollText, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";
import type { Category, CategoryIcon } from "@/types/book";

type IconComponent = ComponentType<{ size?: number; strokeWidth?: number; className?: string; "aria-hidden"?: boolean }>;

const icons: Record<CategoryIcon, IconComponent> = {
  "book-open": BookOpen,
  library: LibraryBig,
  "heart-handshake": HeartHandshake,
  flower: Flower2,
  landmark: Landmark,
  scroll: ScrollText,
  sparkles: Sparkles,
  baby: Baby,
  "person-standing": UserRound,
  "book-marked": BookMarked,
};

export function CategoryCard({ category }: { category: Category }) {
  const Icon = icons[category.icon ?? "book-open"];
  return (
    <Link href={`/catalog?category=${category.id}`} className="group flex w-[112px] shrink-0 flex-col items-center justify-center rounded-2xl border border-line bg-cream px-2 py-4 text-center transition hover:-translate-y-1 hover:border-cocoa/25 hover:shadow-card sm:w-auto">
      <span className="grid size-12 place-items-center rounded-2xl bg-sand text-cocoa transition group-hover:bg-cocoa group-hover:text-cream"><Icon size={25} strokeWidth={1.6} aria-hidden={true} /></span>
      <span className="mt-3 min-h-9 text-[12px] font-semibold leading-4 text-ink sm:text-[13px]">{category.name}</span>
    </Link>
  );
}
