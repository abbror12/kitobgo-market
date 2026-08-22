"use client";

// Shaxsiy kabinet: GET /account profil, GET /orders ro'yxati (sahifalab),
// buyurtma tafsiloti kengaytirilganda yuklanadi, bekor qilish `cancellable` bayrog'idan.
import { ChevronDown, Heart, LoaderCircle, Package, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { readFavorites } from "@/lib/client-store";
import { formatDate, formatPrice } from "@/lib/format";
import type { OrderDetailDto, OrderStatus, OrderSummaryDto, PageResponse } from "@/lib/store-api";
import { ProfileSidebar } from "./ProfileSidebar";
import { useProfileSession } from "./useProfileSession";

// Badge ohanglari ilovadagi status_colors.dart bilan bir xil: uchta ohang —
// hal bo'lgan (yashil), yo'ldagi (terrakota), to'xtagan (qizil) va neytral (sand).
const STATUS_BADGES: Record<OrderStatus, { label: string; className: string }> = {
  PENDING_PAYMENT: { label: "To‘lov kutilmoqda", className: "bg-warningSoft text-warning" },
  PAID: { label: "To‘landi", className: "bg-successSoft text-success" },
  PROCESSING: { label: "Tayyorlanmoqda", className: "bg-warningSoft text-brandDark" },
  SHIPPED: { label: "Yo‘lda", className: "bg-warningSoft text-brandDark" },
  DELIVERED: { label: "Yetkazildi", className: "bg-successSoft text-success" },
  CANCELLED: { label: "Bekor qilindi", className: "bg-dangerSoft text-danger" },
  REFUNDED: { label: "Pul qaytarildi", className: "bg-sand text-bodyText" },
};

const ACTIVE_STATUSES: OrderStatus[] = ["PENDING_PAYMENT", "PAID", "PROCESSING", "SHIPPED"];

export function ProfileContent() {
  // Sessiya, profil va chiqish — /profile/details bilan umumiy.
  const { profile, checking, logout } = useProfileSession("/profile");
  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);
  const [ordersPage, setOrdersPage] = useState<PageResponse<OrderSummaryDto> | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, OrderDetailDto | "loading">>({});
  const [cancelBusy, setCancelBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { setFavoritesCount(readFavorites().length); }, []);

  useEffect(() => {
    if (checking) return;
    void loadOrders(0);
  }, [checking]);

  async function loadOrders(page: number) {
    setOrdersLoading(true);
    setError("");
    try {
      const result = await apiFetch<PageResponse<OrderSummaryDto>>(`/api/orders?page=${page}&size=10`);
      setOrdersPage(result);
      setOrders((current) => (page === 0 ? result.content : [...current, ...result.content]));
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "Buyurtmalarni yuklab bo‘lmadi.");
    } finally {
      setOrdersLoading(false);
    }
  }

  async function toggleOrder(orderNumber: string) {
    if (expanded === orderNumber) { setExpanded(null); return; }
    setExpanded(orderNumber);
    if (details[orderNumber]) return;
    setDetails((current) => ({ ...current, [orderNumber]: "loading" }));
    try {
      const detail = await apiFetch<OrderDetailDto>(`/api/orders/${encodeURIComponent(orderNumber)}`);
      setDetails((current) => ({ ...current, [orderNumber]: detail }));
    } catch {
      setDetails((current) => {
        const next = { ...current };
        delete next[orderNumber];
        return next;
      });
      setExpanded(null);
    }
  }

  async function cancelOrder(orderNumber: string) {
    if (cancelBusy) return;
    if (!window.confirm(`${orderNumber} buyurtmasini bekor qilasizmi?`)) return;
    setCancelBusy(orderNumber);
    try {
      const detail = await apiFetch<OrderDetailDto>(`/api/orders/${encodeURIComponent(orderNumber)}/cancel`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      setDetails((current) => ({ ...current, [orderNumber]: detail }));
      setOrders((current) => current.map((order) => (order.orderNumber === orderNumber ? { ...order, status: detail.status } : order)));
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "Bekor qilib bo‘lmadi.");
    } finally {
      setCancelBusy(null);
    }
  }

  if (checking) {
    return <div className="grid gap-3"><div className="h-24 animate-pulse rounded-2xl bg-sand/60" /><div className="h-64 animate-pulse rounded-2xl bg-sand/60" /></div>;
  }

  const activeCount = orders.filter((order) => ACTIVE_STATUSES.includes(order.status)).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <ProfileSidebar profile={profile} onLogout={() => void logout()} />

      <div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Jami buyurtmalar", value: ordersPage?.totalElements ?? 0, icon: Package },
            { label: "Jarayonda", value: activeCount, icon: LoaderCircle },
            { label: "Sevimlilar", value: favoritesCount, icon: Heart },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-line bg-cream p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-sand text-brand"><Icon size={19} /></span>
              <strong className="mt-4 block text-2xl">{value}</strong>
              <span className="text-sm text-bodyText">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-cream p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <div><h2 className="font-serif text-xl font-semibold">Buyurtmalarim</h2><p className="mt-1 text-sm text-bodyText">Holatini kuzating, kerak bo‘lsa bekor qiling</p></div>
            <Link href="/catalog" className="text-sm font-bold text-brand">Yangi xarid</Link>
          </div>
          {error && <p className="mt-4 rounded-xl bg-dangerSoft p-3 text-sm font-medium text-danger" role="alert">{error}</p>}

          {orders.length === 0 && !ordersLoading ? (
            <p className="mt-6 rounded-xl border border-dashed border-line p-6 text-center text-sm text-bodyText">Hozircha buyurtma yo‘q. <Link href="/catalog" className="font-bold text-brand">Katalogga o‘tish</Link></p>
          ) : (
            <div className="mt-5 divide-y divide-line">
              {orders.map((order) => {
                const badge = STATUS_BADGES[order.status];
                const detail = details[order.orderNumber];
                const isOpen = expanded === order.orderNumber;
                return (
                  <div key={order.orderNumber} className="py-3">
                    <button type="button" onClick={() => void toggleOrder(order.orderNumber)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 rounded-lg px-1 py-2 text-left hover:bg-sand">
                      <strong className="text-sm">{order.orderNumber}</strong>
                      <span className="text-xs text-bodyText">{formatDate(order.placedAt)}</span>
                      <span className="text-sm font-semibold">{formatPrice(order.grandTotal)}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}>{badge.label}</span>
                      <ChevronDown size={16} className={`ml-auto text-bodyText transition ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="mt-2 rounded-xl bg-navSurface p-4 text-sm">
                        {detail === "loading" || !detail ? (
                          <p className="flex items-center gap-2 text-bodyText"><LoaderCircle size={15} className="animate-spin" /> Yuklanmoqda…</p>
                        ) : (
                          <>
                            <ul className="space-y-1.5">
                              {detail.items.map((item) => (
                                <li key={item.bookId} className="flex justify-between gap-3">
                                  <Link href={`/books/${item.slug}`} className="min-w-0 truncate font-medium hover:text-brand">{item.title}</Link>
                                  <span className="shrink-0 text-bodyText">{item.quantity} × {formatPrice(item.unitPrice)}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                              <span className="text-bodyText">
                                {detail.deliveryMethod === "PICKUP" ? "Olib ketish" : `Yetkazish: ${detail.destination?.regionName ?? ""}`}
                                {detail.deliveryFee > 0 ? ` · ${formatPrice(detail.deliveryFee)}` : " · Bepul"}
                                {detail.cashOnDelivery ? " · Qabul qilganda to‘lov" : ""}
                              </span>
                              <strong>Jami: {formatPrice(detail.grandTotal)}</strong>
                            </div>
                            {detail.status === "PENDING_PAYMENT" && (
                              <Link href={`/order-success?order=${encodeURIComponent(detail.orderNumber)}`} className="mt-3 inline-flex text-sm font-bold text-brand">To‘lovni yakunlash →</Link>
                            )}
                            {detail.cancellable && (
                              <button type="button" onClick={() => void cancelOrder(order.orderNumber)} disabled={cancelBusy === order.orderNumber} className="mt-3 ml-4 inline-flex items-center gap-1.5 text-sm font-bold text-danger disabled:opacity-60">
                                {cancelBusy === order.orderNumber ? <LoaderCircle size={15} className="animate-spin" /> : <X size={15} />} Bekor qilish
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {ordersLoading && <p className="mt-4 flex items-center gap-2 text-sm text-bodyText"><LoaderCircle size={16} className="animate-spin" /> Yuklanmoqda…</p>}
          {ordersPage && !ordersPage.last && !ordersLoading && (
            <button type="button" onClick={() => void loadOrders(ordersPage.page + 1)} className="button-secondary mt-5 inline-flex h-11 px-5 text-sm">Yana yuklash</button>
          )}
        </div>

      </div>
    </div>
  );
}
