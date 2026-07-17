import type { ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";

export function PageIntro({ eyebrow, title, description, breadcrumbs, aside }: { eyebrow?: string; title: string; description?: string; breadcrumbs: BreadcrumbItem[]; aside?: ReactNode }) {
  return (
    <section className="border-b border-line bg-white">
      <div className="container-page py-6 sm:py-9">
        <Breadcrumbs items={breadcrumbs} />
        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.035em] text-ink sm:text-[42px]">{title}</h1>
            {description && <p className="mt-2 max-w-2xl text-[14px] leading-6 text-muted sm:text-base">{description}</p>}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}
