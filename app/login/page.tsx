import type { Metadata } from "next";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { LoginPanel } from "@/components/auth/LoginPanel";
import { StoreShell } from "@/components/layout/StoreShell";

export const metadata: Metadata = { title: "Kirish — Kitob.go" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  // Ochiq redirectdan saqlanish: faqat sayt ichidagi yo'llarga qaytamiz.
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/profile";

  return (
    <StoreShell>
      <section className="container-page py-10 sm:py-16">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[28px] border border-line bg-white shadow-soft lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative overflow-hidden bg-brand-dark p-7 text-white sm:p-10 lg:p-12">
            <div className="absolute -bottom-24 -right-24 size-72 rounded-full border-[48px] border-white/5" />
            <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-brand-gold"><ShieldCheck size={24} /></span>
            <h1 className="mt-8 text-3xl font-extrabold tracking-tight sm:text-4xl">Shaxsiy kabinetingizga xush kelibsiz</h1>
            <p className="mt-4 max-w-md leading-7 text-white/70">Buyurtmalarni kuzating, sevimli kitoblaringizni saqlang va keyingi xaridni yanada tez amalga oshiring.</p>
            <ul className="mt-8 space-y-4 text-sm text-white/85">
              <li className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-full bg-white/10">✓</span> Buyurtmalar tarixi va holati</li>
              <li className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-full bg-white/10">✓</span> SMS orqali tezkor kirish</li>
              <li className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-full bg-white/10">✓</span> Xavfsiz to‘lov va yetkazish</li>
            </ul>
          </div>
          <div className="p-7 sm:p-10 lg:p-12">
            <span className="eyebrow">Akkaunt</span>
            <h2 className="mb-6 mt-3 text-2xl font-extrabold sm:text-3xl">Kirish</h2>
            <LoginPanel next={next} />
            <div className="mt-6 flex items-start gap-2 rounded-xl bg-canvas p-4 text-xs leading-5 text-muted">
              <LockKeyhole size={16} className="mt-0.5 shrink-0 text-brand" /> Davom etish orqali maxfiylik siyosati va foydalanish shartlariga rozilik bildirasiz.
            </div>
            <p className="mt-7 text-center text-sm text-muted">Yordam kerakmi? <Link href="/contact" className="font-bold text-brand">Biz bilan bog‘laning</Link></p>
          </div>
        </div>
      </section>
    </StoreShell>
  );
}
