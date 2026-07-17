import { BookOpenCheck } from "lucide-react";
import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2" aria-label="Kitob.go bosh sahifa">
      <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand/15">
        <BookOpenCheck size={25} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span>
        <span className="block text-xl font-extrabold leading-none tracking-[-0.04em] text-ink">Kitob<span className="text-brand">.go</span></span>
        {!compact && <span className="mt-1 hidden text-[10px] font-medium text-muted xl:block">Ilm bilan yuksalish sari</span>}
      </span>
    </Link>
  );
}
