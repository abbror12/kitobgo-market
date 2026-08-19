import type { Metadata } from "next";
import { Clock3, Mail, MapPin, Phone, Send } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { StoreShell } from "@/components/layout/StoreShell";
import { PageIntro } from "@/components/shared/PageIntro";

export const metadata: Metadata = {
  title: "Aloqa — Kitob.go",
  description: "Kitob.go bilan telefon, Telegram yoki murojaat formasi orqali bog‘laning.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <StoreShell>
      <PageIntro
        eyebrow="Doim aloqadamiz"
        title="Sizga qanday yordam bera olamiz?"
        description="Buyurtma, kitob tanlash yoki hamkorlik bo‘yicha savolingiz bo‘lsa, biz bilan bog‘laning."
        breadcrumbs={[{ label: "Aloqa" }]}
      />

      <section className="container-page py-5 sm:py-12">
        <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr] xl:gap-8">
          <div className="mobile-rail sm:grid sm:grid-cols-2 sm:gap-4 lg:block lg:space-y-4">
            <ContactCard
              icon={Phone}
              label="Telefon"
              value="+998 77 448 80 80"
              href="tel:+998774488080"
              note="Har kuni 09:00–21:00"
            />
            <ContactCard
              icon={Send}
              label="Telegram"
              value="@kitobgouz"
              href="https://t.me/kitobgouz"
              note="Odatda 10 daqiqada javob beramiz"
            />
            <ContactCard
              icon={Mail}
              label="Elektron pochta"
              value="salom@kitob.go"
              href="mailto:salom@kitob.go"
              note="Hamkorlik va takliflar uchun"
            />

            <div className="rounded-2xl bg-inkButton p-4 text-cream sm:p-6">
              <MapPin className="text-gold" />
              <h2 className="font-serif mt-5 font-semibold">Ofisimiz</h2>
              <p className="mt-2 text-sm leading-6 text-cream/70">
                Toshkent shahri, Shayxontohur tumani, Navoiy ko‘chasi, 18-uy
              </p>
              <p className="mt-4 flex items-center gap-2 text-xs text-cream/65">
                <Clock3 size={15} /> Dushanba–Shanba, 09:00–19:00
              </p>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

      <section className="border-y border-line bg-navSurface py-6 sm:py-10">
        <div className="container-page">
          <div className="relative grid min-h-44 place-items-center overflow-hidden rounded-2xl bg-sand text-center sm:min-h-64">
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(#a34a24_1px,transparent_1px),linear-gradient(90deg,#a34a24_1px,transparent_1px)] [background-size:32px_32px]" />
            <div className="relative rounded-2xl bg-cream/95 p-6 shadow-card">
              <span className="mx-auto grid size-11 place-items-center rounded-full bg-brand text-cream">
                <MapPin size={20} />
              </span>
              <strong className="mt-3 block">Kitob.go markaziy ofisi</strong>
              <small className="text-bodyText">Toshkent shahri</small>
            </div>
          </div>
        </div>
      </section>
    </StoreShell>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
  note,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  href: string;
  note: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-line bg-cream p-4 transition hover:border-brand/25 hover:shadow-card sm:gap-4 sm:p-5"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-sand text-brand transition group-hover:bg-brand group-hover:text-cream">
        <Icon size={22} />
      </span>
      <span>
        <small className="text-bodyText">{label}</small>
        <strong className="block">{value}</strong>
        <small className="text-bodyText">{note}</small>
      </span>
    </a>
  );
}
