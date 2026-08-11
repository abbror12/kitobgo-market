import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { StoreShell } from "@/components/layout/StoreShell";
import { PageIntro } from "@/components/shared/PageIntro";

// Huquqiy sahifalar (foydalanish shartlari, maxfiylik siyosati) uchun umumiy qobiq.
// Matn /var/www/kitobgo dagi statik HTML'dan o'zgartirilmasdan ko'chirildi.

// Hali to'ldirilmagan joy: statik nusxadagi <span class="ph">[…]</span>.
// Ataylab ko'zga tashlanadigan qilib qoldirilgan — to'ldirilmagani bilinib tursin.
export function Ph({ children }: { children: ReactNode }) {
  return <span className="rounded bg-warningSoft px-1.5 py-0.5 font-semibold text-warning">{children}</span>;
}

// Statik nusxadagi "QORALAMA BANNERI". Hujjat yurist tomonidan tasdiqlanib,
// yuqoridagi [ ] joylar to'ldirilgach, bu blok o'chiriladi.
export function DraftNotice({ children }: { children: ReactNode }) {
  return (
    <div className="mb-8 flex gap-3 rounded-2xl border-2 border-warning/40 bg-warningSoft p-4 sm:p-5">
      <AlertTriangle className="mt-0.5 shrink-0 text-warning" size={20} aria-hidden="true" />
      <div className="space-y-2 text-sm leading-6 text-warning">{children}</div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-serif text-xl font-semibold text-ink sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function LegalSubheading({ children }: { children: ReactNode }) {
  return <h3 className="mt-6 text-base font-bold text-ink sm:text-lg">{children}</h3>;
}

// Keng jadvallar mobil ekranda sahifani gorizontal siljitmasin.
export function LegalTable({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[520px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function LegalPage({
  title,
  eyebrow,
  updated,
  children,
}: {
  title: string;
  eyebrow: string;
  updated: ReactNode;
  children: ReactNode;
}) {
  return (
    <StoreShell>
      <PageIntro eyebrow={eyebrow} title={title} breadcrumbs={[{ label: title }]} />
      <section className="container-page py-8 sm:py-12">
        <article className="mx-auto max-w-3xl rounded-2xl border border-line bg-cream p-5 leading-7 text-bodyText sm:p-8 lg:p-10">
          <p className="text-sm text-bodyText">{updated}</p>
          {children}
        </article>
      </section>
    </StoreShell>
  );
}
