"use client";

import { AlertCircle, LoaderCircle, RefreshCw, WifiOff, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  dispatchOrderQueueResult,
  getDuePendingOrders,
  getPendingOrders,
  processPendingOrder,
  resetSendingOrders,
  retryPendingOrderNow,
  type OrderQueueResult,
} from "@/lib/order-queue";

type Notice = {
  kind: "sending" | "retry" | "needs_action";
  message: string;
  clientRequestId: string;
};

export function PendingOrderProcessor() {
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);

  const handleResult = useCallback((result: OrderQueueResult) => {
    dispatchOrderQueueResult(result);
    if (result.kind === "success") {
      setNotice(null);
      router.push(`/order-success?id=${encodeURIComponent(String(result.order.id))}`);
      return;
    }
    if (result.kind === "retry") {
      setNotice({
        kind: "retry",
        message: result.pending.lastError ?? "Buyurtma navbatda. Avtomatik qayta yuboramiz.",
        clientRequestId: result.pending.clientRequestId,
      });
      return;
    }
    setNotice({
      kind: "needs_action",
      message: result.pending.lastError ?? "Buyurtma ma’lumotlarini tekshirish kerak.",
      clientRequestId: result.pending.clientRequestId,
    });
  }, [router]);

  const processQueue = useCallback(async () => {
    try {
      const orders = await getDuePendingOrders();
      for (const order of orders) {
        setNotice({ kind: "sending", message: "Buyurtma yuborilmoqda…", clientRequestId: order.clientRequestId });
        const result = await processPendingOrder(order.clientRequestId);
        if (result) handleResult(result);
      }
    } catch (error) {
      console.error("Pending order queue ishlamadi", error);
    }
  }, [handleResult]);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        await resetSendingOrders();
        const orders = await getPendingOrders();
        const needsAction = [...orders]
          .filter((order) => order.state === "NEEDS_ACTION")
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
        if (active && needsAction) {
          setNotice({
            kind: "needs_action",
            message: needsAction.lastError ?? "Buyurtma ma’lumotlarini tekshirish kerak.",
            clientRequestId: needsAction.clientRequestId,
          });
        }
        if (active) await processQueue();
      } catch (error) {
        console.error("Pending order queue ochilmadi", error);
      }
    }

    void bootstrap();
    const onOnline = () => void processQueue();
    window.addEventListener("online", onOnline);
    const timerId = window.setInterval(() => void processQueue(), 20_000);
    return () => {
      active = false;
      window.removeEventListener("online", onOnline);
      window.clearInterval(timerId);
    };
  }, [processQueue]);

  async function retryNow() {
    if (!notice) return;
    setNotice({ ...notice, kind: "sending", message: "Buyurtma qayta yuborilmoqda…" });
    const result = await retryPendingOrderNow(notice.clientRequestId);
    if (result) handleResult(result);
  }

  if (!notice) return null;
  const Icon = notice.kind === "sending" ? LoaderCircle : notice.kind === "retry" ? WifiOff : AlertCircle;

  return (
    <aside className="fixed bottom-24 left-4 right-4 z-[70] mx-auto max-w-xl rounded-2xl border border-line bg-white p-4 shadow-card md:bottom-6" role="status" aria-live="polite">
      <div className="flex items-start gap-3">
        <Icon size={21} className={`mt-0.5 shrink-0 ${notice.kind === "sending" ? "animate-spin text-brand" : notice.kind === "retry" ? "text-amber-600" : "text-red-600"}`} />
        <div className="min-w-0 flex-1">
          <strong className="block text-sm">{notice.kind === "sending" ? "Yuborilmoqda" : notice.kind === "retry" ? "Buyurtma xavfsiz navbatda" : "Ma’lumotni tekshirish kerak"}</strong>
          <p className="mt-1 text-sm leading-5 text-muted">{notice.message}</p>
          {notice.kind === "retry" && <button type="button" onClick={() => void retryNow()} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand"><RefreshCw size={15} /> Qayta urinish</button>}
          {notice.kind === "needs_action" && <Link href="/cart" className="mt-3 inline-flex text-sm font-bold text-brand">Savatchaga qaytish</Link>}
        </div>
        <button type="button" onClick={() => setNotice(null)} className="grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-canvas hover:text-ink" aria-label="Xabarni yopish"><X size={17} /></button>
      </div>
    </aside>
  );
}
