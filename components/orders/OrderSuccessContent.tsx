"use client";

// Buyurtma yakuni: holatni ko'rsatadi, onlayn to'lovda buyurtmani PAID bo'lguncha pollaydi
// (API.md §7.1: provayder redirekti to'lov isboti emas — faqat webhook/holat).
import { AlertCircle, Banknote, Check, Clock3, CreditCard, LoaderCircle, PackageCheck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { formatPrice } from "@/lib/format";
import type { OrderDetailDto, OrderStatus } from "@/lib/store-api";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "To‘lov kutilmoqda",
  PAID: "To‘lov qabul qilindi",
  PROCESSING: "Tayyorlanmoqda",
  SHIPPED: "Kuryerda",
  DELIVERED: "Yetkazildi",
  CANCELLED: "Bekor qilindi",
  REFUNDED: "Qaytarildi",
};

const POLL_INTERVAL_MS = 3_000;
const POLL_LIMIT = 40; // ~2 daqiqa

interface StoredPayment {
  provider: string;
  checkoutUrl: string;
}

export function OrderSuccessContent({ orderNumber, payPending }: { orderNumber: string | null; payPending: boolean }) {
  const [order, setOrder] = useState<OrderDetailDto | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "unauthorized" | "error">(orderNumber ? "loading" : "error");
  const [codBusy, setCodBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [payInfo, setPayInfo] = useState<StoredPayment | null>(null);
  const pollCount = useRef(0);

  const load = useCallback(async () => {
    if (!orderNumber) return;
    try {
      const detail = await apiFetch<OrderDetailDto>(`/api/orders/${encodeURIComponent(orderNumber)}`);
      setOrder(detail);
      setLoadState("ready");
    } catch (error) {
      if (error instanceof ClientApiError && error.code === "UNAUTHENTICATED") setLoadState("unauthorized");
      else setLoadState("error");
    }
  }, [orderNumber]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!orderNumber) return;
    try {
      const raw = sessionStorage.getItem(`kg:pay:${orderNumber}`);
      if (raw) setPayInfo(JSON.parse(raw) as StoredPayment);
    } catch { /* sessionStorage o'qilmasa — tugmasiz davom etamiz */ }
  }, [orderNumber]);

  // Onlayn to'lovdan keyin holatni kuzatamiz.
  useEffect(() => {
    if (!payPending || order?.status !== "PENDING_PAYMENT") return;
    const id = window.setInterval(() => {
      pollCount.current += 1;
      if (pollCount.current > POLL_LIMIT) {
        window.clearInterval(id);
        return;
      }
      void load();
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [payPending, order?.status, load]);

  async function switchToCod() {
    if (!orderNumber || codBusy) return;
    setCodBusy(true);
    setActionError("");
    try {
      const detail = await apiFetch<OrderDetailDto>("/api/payments/cash-on-delivery", {
        method: "POST",
        body: JSON.stringify({ orderNumber }),
      });
      setOrder(detail);
    } catch (error) {
      if (error instanceof ClientApiError && (error.code === "ORDER_ALREADY_PAID" || error.code === "PAYMENT_ALREADY_COMPLETED")) {
        await load();
      } else {
        setActionError(error instanceof ClientApiError ? error.message : "Amal bajarilmadi. Qayta urining.");
      }
    } finally {
      setCodBusy(false);
    }
  }

  if (!orderNumber) {
    return (
      <SuccessShell icon={<Check size={36} strokeWidth={2.5} />} eyebrow="Buyurtma" title="Buyurtma raqami topilmadi">
        <p className="mx-auto mt-4 max-w-lg leading-7 text-bodyText">Buyurtmalaringiz holatini shaxsiy kabinetdan ko‘rishingiz mumkin.</p>
        <Actions />
      </SuccessShell>
    );
  }

  if (loadState === "loading") {
    return (
      <SuccessShell icon={<LoaderCircle size={36} className="animate-spin" />} eyebrow="Buyurtma" title="Ma’lumot yuklanmoqda…">
        <p className="mx-auto mt-4 max-w-lg leading-7 text-bodyText">Buyurtma raqami: <strong>{orderNumber}</strong></p>
      </SuccessShell>
    );
  }

  if (loadState !== "ready" || !order) {
    return (
      <SuccessShell icon={<Check size={36} strokeWidth={2.5} />} eyebrow="Buyurtma qabul qilindi" title="Buyurtmangiz rasmiylashtirildi">
        <p className="mx-auto mt-4 max-w-lg leading-7 text-bodyText">
          Buyurtma raqami: <strong>{orderNumber}</strong>. Tafsilotlar SMS orqali yuborildi{loadState === "unauthorized" ? " — holatini ko‘rish uchun qaytadan kiring" : ""}.
        </p>
        {loadState === "unauthorized" && <Link href={`/login?next=/order-success?order=${encodeURIComponent(orderNumber)}`} className="button-secondary mx-auto mt-5 inline-flex h-11 px-5">Kirish</Link>}
        <Actions />
      </SuccessShell>
    );
  }

  const pendingPayment = order.status === "PENDING_PAYMENT";
  const codDone = order.cashOnDelivery && order.status === "PROCESSING";
  const title = pendingPayment
    ? "Buyurtma joylandi — to‘lov kutilmoqda"
    : codDone
      ? "Rahmat! Buyurtmangiz tayyorlanmoqda"
      : order.status === "PAID"
        ? "To‘lov qabul qilindi!"
        : "Rahmat, buyurtmangiz qabul qilindi";

  return (
    <SuccessShell
      icon={pendingPayment ? <Clock3 size={36} strokeWidth={2.5} /> : <Check size={36} strokeWidth={2.5} />}
      eyebrow={STATUS_LABELS[order.status]}
      title={title}
    >
      <p className="mx-auto mt-4 max-w-lg leading-7 text-bodyText">
        {pendingPayment
          ? "Buyurtma 30 daqiqa davomida siz uchun band qilib turiladi. To‘lov tasdiqlangach tayyorlashni boshlaymiz."
          : codDone
            ? "Kuryer kitob(lar)ni yetkazganda naqd yoki karta orqali to‘laysiz. Operatorimiz aniq vaqtni kelishish uchun bog‘lanadi."
            : "Buyurtma holatini shaxsiy kabinetdan kuzatib borishingiz mumkin."}
      </p>

      <div className="mx-auto mt-7 max-w-md space-y-2 text-left">
        <div className="flex items-center gap-3 rounded-2xl bg-successSoft/40 p-4">
          <PackageCheck className="shrink-0 text-brand" />
          <span>
            <strong className="block text-sm">Buyurtma raqami: {order.orderNumber}</strong>
            <small className="text-bodyText">{order.items.reduce((sum, item) => sum + item.quantity, 0)} ta kitob · Jami {formatPrice(order.grandTotal)}{order.deliveryFee > 0 ? ` (yetkazish ${formatPrice(order.deliveryFee)})` : ""}</small>
          </span>
        </div>
        {pendingPayment && (
          <div className="rounded-2xl border border-warning/30 bg-warningSoft p-4 text-sm text-warning">
            <strong className="flex items-center gap-1.5"><AlertCircle size={16} /> 30 daqiqa ichida to‘lanmasa, buyurtma avtomatik bekor qilinadi.</strong>
            <div className="mt-3 grid gap-2">
              {payPending && <p className="flex items-center gap-2 text-xs"><LoaderCircle size={14} className="animate-spin" /> To‘lov holati tekshirilmoqda…</p>}
              {payInfo && (
                <a href={payInfo.checkoutUrl} className="button-primary h-11 w-full px-4 text-sm">
                  <CreditCard size={17} /> To‘lovni davom ettirish ({payInfo.provider === "CLICK" ? "Click" : "Payme"})
                </a>
              )}
              <button type="button" onClick={() => void switchToCod()} disabled={codBusy} className="button-secondary inline-flex h-11 w-full px-4 text-sm disabled:opacity-60">
                {codBusy ? <LoaderCircle size={17} className="animate-spin" /> : <Banknote size={17} />} Qabul qilganda to‘lashga o‘tish
              </button>
              {actionError && <p className="text-xs font-medium text-danger" role="alert">{actionError}</p>}
            </div>
          </div>
        )}
      </div>
      <Actions />
    </SuccessShell>
  );
}

function SuccessShell({ icon, eyebrow, title, children }: { icon: React.ReactNode; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-2xl rounded-[28px] border border-line bg-cream p-7 text-center shadow-soft sm:p-12">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-brand text-cream">{icon}</span>
        <span className="eyebrow mt-6 inline-block">{eyebrow}</span>
        <h1 className="font-serif mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {children}
      </div>
    </section>
  );
}

function Actions() {
  return (
    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
      <Link href="/profile" className="button-primary h-12 px-6">Buyurtmalarim</Link>
      <Link href="/catalog" className="button-secondary inline-flex h-12 px-6">Xaridni davom ettirish</Link>
    </div>
  );
}
