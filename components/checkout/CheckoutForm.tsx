"use client";

import { CheckCircle2, CreditCard, LoaderCircle, LockKeyhole, Truck } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { RegionDto } from "@/lib/store-api";
import type { Book } from "@/types/book";

interface CheckoutItem {
  book: Book;
  quantity: number;
}

export function CheckoutForm({ items, regions }: { items: CheckoutItem[]; regions: RegionDto[] }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const total = items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ book, quantity }) => ({ productId: /^\d+$/.test(book.id) ? Number(book.id) : book.id, quantity })),
          customerName: String(form.get("customerName") ?? "").trim(),
          customerPhone: String(form.get("customerPhone") ?? "").trim(),
          region: String(form.get("region") ?? ""),
        }),
      });
      const body = await response.json() as { id?: string | number; error?: string };
      if (!response.ok) throw new Error(body.error ?? "Buyurtmani yuborib bo‘lmadi");
      router.push(`/order-success?id=${encodeURIComponent(String(body.id))}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Noma’lum xatolik yuz berdi");
      setSubmitting(false);
    }
  }

  return (
    <section className="container-page py-8 sm:py-12">
      <form onSubmit={submitOrder} className="grid gap-6 lg:grid-cols-[1fr_380px] xl:gap-8">
        <div className="space-y-5">
          <fieldset className="rounded-2xl border border-line bg-white p-5 sm:p-7">
            <legend className="px-2 text-lg font-extrabold">Qabul qiluvchi ma’lumotlari</legend>
            <p className="mb-5 mt-1 text-sm leading-6 text-muted">Yetkazishning aniq manzilini operator telefon orqali siz bilan kelishadi.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ism" name="customerName" placeholder="Ismingiz" />
              <Field label="Telefon raqam" name="customerPhone" type="tel" placeholder="+998 90 123 45 67" />
              <div className="sm:col-span-2">
                <label className="text-sm font-bold" htmlFor="region">Viloyat yoki shahar</label>
                <select id="region" name="region" required defaultValue="" className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10">
                  <option value="" disabled>Hududingizni tanlang</option>
                  {regions.map((region) => <option key={region.code} value={region.code}>{region.label}</option>)}
                </select>
                {!regions.length && <p className="mt-2 text-xs font-medium text-red-600">Viloyatlar API’dan yuklanmadi. Sahifani yangilang.</p>}
              </div>
            </div>
          </fieldset>
          <div className="rounded-2xl border border-line bg-white p-5 sm:p-7">
            <h2 className="text-lg font-extrabold">To‘lov usuli</h2>
            <div className="mt-4 flex gap-3 rounded-xl border-2 border-brand bg-brand/5 p-4"><CreditCard className="shrink-0 text-brand" size={22} /><span><strong className="block">Qabul qilganda to‘lash</strong><small className="mt-1 block text-muted">Kitobni tekshirgandan keyin naqd yoki karta orqali</small></span></div>
          </div>
        </div>
        <aside className="h-fit rounded-2xl border border-line bg-white p-5 shadow-soft lg:sticky lg:top-40 sm:p-6">
          <h2 className="text-lg font-extrabold">Buyurtmangiz</h2>
          <div className="mt-4 space-y-4">{items.map(({ book, quantity }) => <div key={book.id} className="flex gap-3"><div className="relative size-16 shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: book.color }}><Image src={book.image} alt="" fill sizes="64px" className="object-cover" /></div><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-bold">{book.title}</p><p className="mt-1 text-xs text-muted">{quantity} dona</p></div><strong className="shrink-0 text-sm">{formatPrice(book.price * quantity)}</strong></div>)}</div>
          <dl className="mt-5 space-y-3 border-t border-line pt-5 text-sm"><div className="flex justify-between"><dt className="text-muted">Mahsulotlar</dt><dd>{formatPrice(total)}</dd></div><div className="flex justify-between"><dt className="text-muted">Yetkazish</dt><dd className="font-bold text-brand">Bepul</dd></div><div className="flex items-end justify-between border-t border-line pt-4"><dt className="font-bold">Jami</dt><dd className="text-2xl font-extrabold text-brand">{formatPrice(total)}</dd></div></dl>
          {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">{error}</div>}
          <button type="submit" disabled={submitting || !regions.length} className="button-primary mt-6 h-12 w-full px-5 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <><LoaderCircle size={18} className="animate-spin" /> Yuborilmoqda...</> : "Buyurtmani tasdiqlash"}</button>
          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted"><LockKeyhole size={15} className="mt-0.5 shrink-0 text-brand" /> Ma’lumotlaringiz xavfsiz saqlanadi va faqat buyurtmani bajarish uchun ishlatiladi.</p>
          <div className="mt-5 grid grid-cols-2 gap-2"><span className="flex items-center gap-1.5 text-[11px] text-muted"><Truck size={15} className="text-brand" /> Bepul yetkazish</span><span className="flex items-center gap-1.5 text-[11px] text-muted"><CheckCircle2 size={15} className="text-brand" /> Sifat kafolati</span></div>
        </aside>
      </form>
    </section>
  );
}

function Field({ label, name, placeholder, type = "text" }: { label: string; name: string; placeholder: string; type?: string }) {
  return <div><label className="text-sm font-bold" htmlFor={name}>{label}</label><input id={name} name={name} type={type} required placeholder={placeholder} className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" /></div>;
}
