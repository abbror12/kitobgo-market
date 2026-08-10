"use client";

// Shaxsiy kabinet: GET /account profil, GET /orders ro'yxati (sahifalab),
// buyurtma tafsiloti kengaytirilganda yuklanadi, bekor qilish `cancellable` bayrog'idan.
import {
  Check, ChevronDown, ChevronRight, Heart, LoaderCircle, LogOut, Package, Pencil, UserRound, X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import { readFavorites } from "@/lib/client-store";
import { formatPrice } from "@/lib/format";
import type { OrderDetailDto, OrderStatus, OrderSummaryDto, PageResponse, ProfileDto } from "@/lib/store-api";

const STATUS_BADGES: Record<OrderStatus, { label: string; className: string }> = {
  PENDING_PAYMENT: { label: "To‘lov kutilmoqda", className: "bg-amber-100 text-amber-700" },
  PAID: { label: "To‘landi", className: "bg-brand/10 text-brand" },
  PROCESSING: { label: "Tayyorlanmoqda", className: "bg-sky-100 text-sky-700" },
  SHIPPED: { label: "Kuryerda", className: "bg-indigo-100 text-indigo-700" },
  DELIVERED: { label: "Yetkazildi", className: "bg-brand/10 text-brand" },
  CANCELLED: { label: "Bekor qilindi", className: "bg-black/5 text-muted" },
  REFUNDED: { label: "Qaytarildi", className: "bg-black/5 text-muted" },
};

const ACTIVE_STATUSES: OrderStatus[] = ["PENDING_PAYMENT", "PAID", "PROCESSING", "SHIPPED"];

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" });
}

export function ProfileContent() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [checking, setChecking] = useState(true);
  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);
  const [ordersPage, setOrdersPage] = useState<PageResponse<OrderSummaryDto> | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [nameDraft, setNameDraft] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameBusy, setNameBusy] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, OrderDetailDto | "loading">>({});
  const [cancelBusy, setCancelBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch<{ authenticated: boolean; profile?: ProfileDto }>("/api/auth/session")
      .then((session) => {
        if (!active) return;
        if (!session.authenticated || !session.profile) {
          router.replace("/login?next=/profile");
          return;
        }
        setProfile(session.profile);
        setNameDraft(session.profile.fullName ?? "");
        setChecking(false);
      })
      .catch(() => { if (active) router.replace("/login?next=/profile"); });
    setFavoritesCount(readFavorites().length);
    return () => { active = false; };
  }, [router]);

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

  async function saveName() {
    const fullName = nameDraft.trim();
    if (!fullName || nameBusy) return;
    setNameBusy(true);
    try {
      const updated = await apiFetch<ProfileDto>("/api/account", { method: "PUT", body: JSON.stringify({ fullName }) });
      setProfile(updated);
      setEditingName(false);
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "Ismni saqlab bo‘lmadi.");
    } finally {
      setNameBusy(false);
    }
  }

  async function logout() {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  if (checking) {
    return <div className="grid gap-3"><div className="h-24 animate-pulse rounded-2xl bg-black/5" /><div className="h-64 animate-pulse rounded-2xl bg-black/5" /></div>;
  }

  const displayName = profile?.fullName ?? "Mijoz";
  const initials = displayName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "K";
  const activeCount = orders.filter((order) => ACTIVE_STATUSES.includes(order.status)).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-2xl border border-line bg-white p-3">
        <div className="flex items-center gap-3 border-b border-line p-3 pb-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-sm font-extrabold text-white">{initials}</span>
          <span className="min-w-0">
            <strong className="block truncate text-sm">{displayName}</strong>
            <small className="text-muted">{profile?.phone ?? profile?.email ?? ""}</small>
          </span>
        </div>
        <nav className="mt-2">
          <span className="flex items-center gap-3 rounded-xl bg-brand/10 px-3 py-3 text-sm font-semibold text-brand"><Package size={18} /> Buyurtmalarim<ChevronRight size={15} className="ml-auto" /></span>
          <Link href="/favorites" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-ink transition hover:bg-canvas"><Heart size={18} /> Sevimlilar<ChevronRight size={15} className="ml-auto" /></Link>
          <button type="button" onClick={() => void logout()} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"><LogOut size={18} /> Chiqish</button>
        </nav>
      </aside>

      <div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Jami buyurtmalar", value: ordersPage?.totalElements ?? 0, icon: Package },
            { label: "Jarayonda", value: activeCount, icon: LoaderCircle },
            { label: "Sevimlilar", value: favoritesCount, icon: Heart },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-line bg-white p-5">
              <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand"><Icon size={19} /></span>
              <strong className="mt-4 block text-2xl">{value}</strong>
              <span className="text-sm text-muted">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <div><h2 className="text-xl font-extrabold">Buyurtmalarim</h2><p className="mt-1 text-sm text-muted">Holatini kuzating, kerak bo‘lsa bekor qiling</p></div>
            <Link href="/catalog" className="text-sm font-bold text-brand">Yangi xarid</Link>
          </div>
          {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">{error}</p>}

          {orders.length === 0 && !ordersLoading ? (
            <p className="mt-6 rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">Hozircha buyurtma yo‘q. <Link href="/catalog" className="font-bold text-brand">Katalogga o‘tish</Link></p>
          ) : (
            <div className="mt-5 divide-y divide-line">
              {orders.map((order) => {
                const badge = STATUS_BADGES[order.status];
                const detail = details[order.orderNumber];
                const isOpen = expanded === order.orderNumber;
                return (
                  <div key={order.orderNumber} className="py-3">
                    <button type="button" onClick={() => void toggleOrder(order.orderNumber)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 rounded-lg px-1 py-2 text-left hover:bg-canvas">
                      <strong className="text-sm">{order.orderNumber}</strong>
                      <span className="text-xs text-muted">{formatDate(order.placedAt)}</span>
                      <span className="text-sm font-semibold">{formatPrice(order.grandTotal)}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${badge.className}`}>{badge.label}</span>
                      <ChevronDown size={16} className={`ml-auto text-muted transition ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="mt-2 rounded-xl bg-canvas p-4 text-sm">
                        {detail === "loading" || !detail ? (
                          <p className="flex items-center gap-2 text-muted"><LoaderCircle size={15} className="animate-spin" /> Yuklanmoqda…</p>
                        ) : (
                          <>
                            <ul className="space-y-1.5">
                              {detail.items.map((item) => (
                                <li key={item.bookId} className="flex justify-between gap-3">
                                  <Link href={`/books/${item.slug}`} className="min-w-0 truncate font-medium hover:text-brand">{item.title}</Link>
                                  <span className="shrink-0 text-muted">{item.quantity} × {formatPrice(item.unitPrice)}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                              <span className="text-muted">
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
                              <button type="button" onClick={() => void cancelOrder(order.orderNumber)} disabled={cancelBusy === order.orderNumber} className="mt-3 ml-4 inline-flex items-center gap-1.5 text-sm font-bold text-red-600 disabled:opacity-60">
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
          {ordersLoading && <p className="mt-4 flex items-center gap-2 text-sm text-muted"><LoaderCircle size={16} className="animate-spin" /> Yuklanmoqda…</p>}
          {ordersPage && !ordersPage.last && !ordersLoading && (
            <button type="button" onClick={() => void loadOrders(ordersPage.page + 1)} className="button-secondary mt-5 inline-flex h-11 px-5 text-sm">Yana yuklash</button>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand"><UserRound size={19} /></span>
            <div className="min-w-0 flex-1">
              <h2 className="font-extrabold">Shaxsiy ma’lumotlar</h2>
              {editingName ? (
                <form className="mt-2 flex gap-2" onSubmit={(event) => { event.preventDefault(); void saveName(); }}>
                  <input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} placeholder="Ism-familiya" className="h-10 w-full max-w-xs rounded-xl border border-line px-3 text-sm outline-none focus:border-brand" />
                  <button type="submit" disabled={nameBusy} className="button-primary h-10 px-4 text-sm disabled:opacity-60">{nameBusy ? <LoaderCircle size={15} className="animate-spin" /> : <Check size={15} />}</button>
                  <button type="button" onClick={() => { setEditingName(false); setNameDraft(profile?.fullName ?? ""); }} className="button-secondary inline-flex h-10 px-3 text-sm"><X size={15} /></button>
                </form>
              ) : (
                <p className="text-sm text-muted">{displayName}{profile?.phone ? ` · ${profile.phone}` : ""}{profile?.email ? ` · ${profile.email}` : ""}</p>
              )}
            </div>
            {!editingName && (
              <button type="button" onClick={() => setEditingName(true)} className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold text-brand"><Pencil size={15} /> Tahrirlash</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
