import { Check, PackageCheck } from "lucide-react";
import Link from "next/link";
import { StoreShell } from "@/components/layout/StoreShell";

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return <StoreShell><section className="container-page py-16 sm:py-24"><div className="mx-auto max-w-2xl rounded-[28px] border border-line bg-white p-7 text-center shadow-soft sm:p-12"><span className="mx-auto grid size-20 place-items-center rounded-full bg-brand text-white"><Check size={36} strokeWidth={2.5} /></span><span className="eyebrow mt-6">Buyurtma qabul qilindi</span><h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Rahmat, buyurtmangiz tayyorlanmoqda</h1><p className="mx-auto mt-4 max-w-lg leading-7 text-muted">Operatorimiz tez orada telefon orqali bog‘lanib, aniq manzil va yetkazib berish vaqtini kelishadi.</p><div className="mx-auto mt-7 flex max-w-md items-center gap-3 rounded-2xl bg-[#F3F6F3] p-4 text-left"><PackageCheck className="shrink-0 text-brand" /><span><strong className="block text-sm">Buyurtma raqami: #{id ?? "—"}</strong><small className="text-muted">Holati: tasdiqlanishi kutilmoqda</small></span></div><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/catalog" className="button-primary h-12 px-6">Xaridni davom ettirish</Link><Link href="/contact" className="button-secondary inline-flex h-12 px-6">Savol berish</Link></div></div></section></StoreShell>;
}
