"use client";

import { AlertCircle, CheckCircle2, Clock3, CreditCard, LoaderCircle, LockKeyhole, RefreshCw, Truck, WifiOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { formatPrice, isExternalImage } from "@/lib/format";
import {
  deletePendingOrder,
  dispatchOrderQueueResult,
  enqueueOrder,
  ORDER_QUEUE_EVENT,
  processPendingOrder,
  retryPendingOrderNow,
  type OrderPayload,
  type OrderQueueResult,
} from "@/lib/order-queue";
import type { RegionDto } from "@/lib/store-api";
import type { Book } from "@/types/book";

interface CheckoutItem {
  book: Book;
  quantity: number;
}

type SubmitState = "IDLE" | "PENDING" | "SENDING" | "RETRY" | "NEEDS_ACTION";

export function CheckoutForm({ items, regions }: { items: CheckoutItem[]; regions: RegionDto[] }) {
  const router = useRouter();
  const [submitState, setSubmitState] = useState<SubmitState>("IDLE");
  const [message, setMessage] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const pendingIdRef = useRef<string | null>(null);
  const submitGuard = useRef(false);
  const total = items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const formLocked = submitState === "PENDING" || submitState === "SENDING" || submitState === "RETRY";

  function rememberPending(clientRequestId: string | null) {
    pendingIdRef.current = clientRequestId;
    setPendingId(clientRequestId);
  }

  function applyQueueResult(result: OrderQueueResult) {
    const resultId = result.kind === "success" ? result.clientRequestId : result.pending.clientRequestId;
    if (pendingIdRef.current !== resultId) return;

    if (result.kind === "success") {
      rememberPending(null);
      setSubmitState("IDLE");
      setMessage("");
      router.push(`/order-success?id=${encodeURIComponent(String(result.order.id))}`);
      return;
    }

    if (result.kind === "retry") {
      setSubmitState("RETRY");
      setMessage(result.pending.lastError ?? "Buyurtma navbatda. Avtomatik qayta yuboramiz.");
      return;
    }

    setSubmitState("NEEDS_ACTION");
    setMessage(result.pending.lastError ?? "Buyurtma ma’lumotlarini tekshirib qayta yuboring.");
  }

  useEffect(() => {
    const onQueueResult = (event: Event) => applyQueueResult((event as CustomEvent<OrderQueueResult>).detail);
    window.addEventListener(ORDER_QUEUE_EVENT, onQueueResult);
    return () => window.removeEventListener(ORDER_QUEUE_EVENT, onQueueResult);
  });

  async function attemptPending(clientRequestId: string, manualRetry = false) {
    if (submitGuard.current) return;
    submitGuard.current = true;
    setSubmitState("SENDING");
    setMessage(manualRetry ? "Buyurtma xavfsiz qayta tekshirilmoqda…" : "Buyurtma yuborilmoqda…");
    try {
      const result = manualRetry
        ? await retryPendingOrderNow(clientRequestId)
        : await processPendingOrder(clientRequestId);
      if (result) {
        dispatchOrderQueueResult(result);
        applyQueueResult(result);
      } else {
        setSubmitState("PENDING");
        setMessage("Buyurtma yuborish navbatida.");
      }
    } catch (error) {
      setSubmitState("RETRY");
      setMessage(error instanceof Error ? error.message : "Buyurtma navbatini tekshirib bo‘lmadi.");
    } finally {
      submitGuard.current = false;
    }
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitGuard.current) return;
    if (submitState === "RETRY" && pendingIdRef.current) {
      await attemptPending(pendingIdRef.current, true);
      return;
    }

    submitGuard.current = true;
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload: OrderPayload = {
      items: items.map(({ book, quantity }) => ({ productId: Number(book.id), quantity })),
      customerName: String(form.get("customerName") ?? "").trim(),
      customerPhone: String(form.get("customerPhone") ?? "").trim(),
      region: String(form.get("region") ?? "").trim(),
    };

    if (!payload.customerName || !payload.customerPhone || !payload.region || payload.items.some((item) => !Number.isSafeInteger(item.productId) || item.productId <= 0 || !Number.isSafeInteger(item.quantity) || item.quantity <= 0)) {
      setSubmitState("NEEDS_ACTION");
      setMessage("Buyurtma ma’lumotlarini to‘liq va to‘g‘ri kiriting.");
      submitGuard.current = false;
      return;
    }

    try {
      if (submitState === "NEEDS_ACTION" && pendingIdRef.current) {
        await deletePendingOrder(pendingIdRef.current);
        rememberPending(null);
      }

      setSubmitState("PENDING");
      setMessage("Buyurtma yuborish navbatiga saqlanmoqda…");
      const pending = await enqueueOrder(payload);
      rememberPending(pending.clientRequestId);
      submitGuard.current = false;
      await attemptPending(pending.clientRequestId);
    } catch (error) {
      submitGuard.current = false;
      setSubmitState("IDLE");
      setMessage(error instanceof Error
        ? `Buyurtmani qurilmada xavfsiz saqlab bo‘lmadi: ${error.message}`
        : "Buyurtmani qurilmada xavfsiz saqlab bo‘lmadi.");
    }
  }

  async function retryNow() {
    if (pendingId) await attemptPending(pendingId, true);
  }

  return (
    <section className="container-page py-8 sm:py-12">
      <form onSubmit={submitOrder} className="grid gap-6 lg:grid-cols-[1fr_380px] xl:gap-8">
        <div className="space-y-5">
          <fieldset disabled={formLocked} className="rounded-2xl border border-line bg-white p-5 disabled:opacity-70 sm:p-7">
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
          <div className="mt-4 space-y-4">{items.map(({ book, quantity }) => <div key={book.id} className="flex gap-3"><div className="relative size-16 shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: book.color }}><Image src={book.image} alt="" fill unoptimized={isExternalImage(book.image)} sizes="64px" className="object-cover" /></div><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-bold">{book.title}</p><p className="mt-1 text-xs text-muted">{quantity} dona</p></div><strong className="shrink-0 text-sm">{formatPrice(book.price * quantity)}</strong></div>)}</div>
          <dl className="mt-5 space-y-3 border-t border-line pt-5 text-sm"><div className="flex justify-between"><dt className="text-muted">Mahsulotlar</dt><dd>{formatPrice(total)}</dd></div><div className="flex justify-between"><dt className="text-muted">Yetkazish</dt><dd className="font-bold text-brand">Bepul</dd></div><div className="flex items-end justify-between border-t border-line pt-4"><dt className="font-bold">Jami</dt><dd className="text-2xl font-extrabold text-brand">{formatPrice(total)}</dd></div></dl>
          {message && <QueueMessage state={submitState} message={message} />}
          {submitState === "RETRY" ? (
            <button type="button" onClick={() => void retryNow()} disabled={!pendingId} className="button-primary mt-6 h-12 w-full px-5 disabled:cursor-not-allowed disabled:opacity-60"><RefreshCw size={18} /> Qayta urinish</button>
          ) : (
            <button type="submit" disabled={formLocked || !regions.length} className="button-primary mt-6 h-12 w-full px-5 disabled:cursor-not-allowed disabled:opacity-60">{submitState === "SENDING" || submitState === "PENDING" ? <><LoaderCircle size={18} className="animate-spin" /> Yuborilmoqda...</> : submitState === "NEEDS_ACTION" && pendingId ? "Tuzatib qayta yuborish" : "Buyurtmani tasdiqlash"}</button>
          )}
          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted"><LockKeyhole size={15} className="mt-0.5 shrink-0 text-brand" /> Ma’lumotlaringiz xavfsiz saqlanadi va faqat buyurtmani bajarish uchun ishlatiladi.</p>
          <div className="mt-5 grid grid-cols-2 gap-2"><span className="flex items-center gap-1.5 text-[11px] text-muted"><Truck size={15} className="text-brand" /> Bepul yetkazish</span><span className="flex items-center gap-1.5 text-[11px] text-muted"><CheckCircle2 size={15} className="text-brand" /> Sifat kafolati</span></div>
        </aside>
      </form>
    </section>
  );
}

function QueueMessage({ state, message }: { state: SubmitState; message: string }) {
  const retrying = state === "RETRY";
  const needsAction = state === "NEEDS_ACTION";
  const Icon = retrying ? WifiOff : needsAction ? AlertCircle : Clock3;
  return <div className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-sm font-medium ${needsAction ? "bg-red-50 text-red-700" : retrying ? "bg-amber-50 text-amber-800" : "bg-brand/5 text-brand"}`} role="status" aria-live="polite"><Icon size={17} className={`mt-0.5 shrink-0 ${state === "SENDING" ? "animate-pulse" : ""}`} /><span>{message}</span></div>;
}

function Field({ label, name, placeholder, type = "text" }: { label: string; name: string; placeholder: string; type?: string }) {
  return <div><label className="text-sm font-bold" htmlFor={name}>{label}</label><input id={name} name={name} type={type} required placeholder={placeholder} className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" /></div>;
}
