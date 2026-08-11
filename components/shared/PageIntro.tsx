import type { ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";

export function PageIntro({ eyebrow, title, description, breadcrumbs, aside }: { eyebrow?: string; title: string; description?: string; breadcrumbs: BreadcrumbItem[]; aside?: ReactNode }) {
  return (
    <section className="border-b border-line bg-cream">
      <div className="container-page py-4 sm:py-9">
        <Breadcrumbs items={breadcrumbs} />
        <div className="mt-3 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h1 className="mt-1.5 font-serif text-[26px] font-semibold leading-tight tracking-[-0.01em] text-ink sm:mt-2 sm:text-[40px]">{title}</h1>
            {description && <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-bodyText sm:mt-2 sm:text-base sm:leading-6">{description}</p>}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}
