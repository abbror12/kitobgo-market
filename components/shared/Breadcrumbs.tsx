import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Sahifa yo‘li" className="flex min-w-0 items-center gap-1.5 overflow-hidden text-[12px] text-bodyText sm:text-[13px]">
      <Link href="/" className="shrink-0 transition hover:text-brand" aria-label="Bosh sahifa"><Home size={15} /></Link>
      {items.map((item) => (
        <span key={item.label} className="flex min-w-0 items-center gap-1.5">
          <ChevronRight size={14} className="shrink-0 text-chevron" />
          {item.href ? <Link href={item.href} className="truncate transition hover:text-brand">{item.label}</Link> : <span className="truncate font-medium text-ink">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}
