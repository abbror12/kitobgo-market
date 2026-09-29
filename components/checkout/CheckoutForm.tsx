"use client";

// Checkout oqimi (API.md §6–§7):
//   hudud + yetkazish kotirovkasi → qabul qiluvchi → to'lov usuli → "Tasdiqlash" →
//   (kirmagan bo'lsa) SMS kod qadami → POST /api/checkout.
//
// Kirish ataylab OXIRGI qadamda: mijoz avval ishini bitiradi, telefon tasdiqlash esa
// buyurtmani tasdiqlash paytida bo'ladi. SMS forma to'liq tekshirilgandan KEYIN yuboriladi —
// kod so'rovi soatiga 5 marta cheklangan (API.md §9), uni bekorga sarflab bo'lmaydi.
//
// Xatolar `code` bo'yicha boshqariladi: CART_ADJUSTED (sayt-ichki), ORDER_PRICE_CHANGED,
// INSUFFICIENT_STOCK, REGION_NOT_SERVICED, VALIDATION_FAILED, UNAUTHENTICATED.
import {
  AlertCircle, Banknote, CheckCircle2, CreditCard, LoaderCircle, LockKeyhole,
  MapPin, Store, Truck,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckoutCodeStep } from "@/components/checkout/CheckoutCodeStep";
import { apiFetch, ClientApiError } from "@/lib/client-api";
import type { CodeSent } from "@/lib/otp";
import { clearCart, notifyAuthChanged, readCart, writeCart } from "@/lib/client-store";
import { formatPrice, isExternalImage } from "@/lib/format";
import type {
  DeliveryMethod, DeliveryQuoteDto, OrderDetailDto, PaymentInitiationDto,
  PaymentProvider, ProfileDto, RegionDto,
} from "@/lib/store-api";
import type { Book } from "@/types/book";

interface CheckoutItem {
  book: Book;
  quantity: number;
}

type Session =
  | { state: "loading" }
  | { state: "anon" }
  | { state: "authed"; profile: ProfileDto };

interface PriceChange {
  bookId: number;
  title: string;
  cartPrice: number;
  currentPrice: number;
}

interface Adjustment {
  bookId: number;
  title?: string;
  requested: number;
  inCart: number;
  removed: boolean;
}

interface CheckoutSuccess {
  order: OrderDetailDto;
  payment?: PaymentInitiationDto;
  paymentProblem?: { code: string; detail?: string };
}

const METHOD_LABELS: Record<DeliveryMethod, { title: string; icon: typeof Truck }> = {
  COURIER: { title: "Kuryer orqali", icon: Truck },
  PICKUP: { title: "Do‘kondan olib ketish", icon: Store },
};

// `GET /payments/providers` token talab qiladi (API.md §7.1), kirish esa endi oxirgi qadamda —
// shuning uchun kirmagan mijozga do'kon e'lon qilgan usullar ko'rsatiladi. Kirgandan keyin
// haqiqiy ro'yxat yuklanadi va tanlangan usul unda bo'lmasa, naqdga qaytariladi.
const ADVERTISED_PROVIDERS: PaymentProvider[] = ["CLICK", "PAYME"];

// Kirish raqami erkin, lekin recipientPhone qat'iy +998XXXXXXXXX bo'lishi shart (API.md §5).
function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 9) digits = `998${digits}`;
  return digits.length === 12 && digits.startsWith("998") ? `+${digits}` : null;
}

function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `kg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function CheckoutForm({ items, regions, source }: { items: CheckoutItem[]; regions: RegionDto[]; source: "cart" | "direct" }) {
  const router = useRouter();
  const [lines, setLines] = useState<CheckoutItem[]>(items);
  const [session, setSession] = useState<Session>({ state: "loading" });
  const [regionId, setRegionId] = useState<number | "">("");
  const [quotes, setQuotes] = useState<DeliveryQuoteDto[] | null>(null);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [method, setMethod] = useState<DeliveryMethod | null>(null);
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | PaymentProvider>("COD");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("+998 ");
  const [district, setDistrict] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [note, setNote] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [formNotice, setFormNotice] = useState("");
  const [priceChanges, setPriceChanges] = useState<PriceChange[] | null>(null);
  const [busy, setBusy] = useState(false);
  // Yakuniy qadam: kirmagan mijoz uchun "form" → "code".
  const [step, setStep] = useState<"form" | "code">("form");
  const [otp, setOtp] = useState<{ phone: string; meta: CodeSent } | null>(null);
  const [placing, setPlacing] = useState(false);
  const idempotencyKey = useRef(newIdempotencyKey());

  const itemsTotal = useMemo(() => lines.reduce((sum, item) => sum + item.book.price * item.quantity, 0), [lines]);
  const selectedQuote = quotes?.find((quote) => quote.method === method) ?? null;
  const deliveryFee = selectedQuote ? (selectedQuote.free ? 0 : selectedQuote.fee) : null;
  const grandTotal = itemsTotal + (deliveryFee ?? 0);
  const authed = session.state === "authed";

  // Sessiya holati va profil (ism/telefon oldindan to'ldiriladi).
  useEffect(() => {
    let active = true;
    apiFetch<{ authenticated: boolean; profile?: ProfileDto }>("/api/auth/session")
      .then((result) => {
        if (!active) return;
        if (result.authenticated && result.profile) {
          setSession({ state: "authed", profile: result.profile });
          if (result.profile.fullName) setRecipientName((current) => current || result.profile!.fullName!);
          if (result.profile.phone) setRecipientPhone((current) => (current.trim() === "+998" ? result.profile!.phone! : current));
        } else {
          setSession({ state: "anon" });
        }
      })
      .catch(() => { if (active) setSession({ state: "anon" }); });
    return () => { active = false; };
  }, []);

  // To'lov provayderlari — token talab qiladi, ya'ni faqat kirgandan keyin.
  // Tanlangan usul haqiqiy ro'yxatda bo'lmasa, naqdga qaytariladi.
  useEffect(() => {
    if (!authed) return;
    let active = true;
    apiFetch<PaymentProvider[]>("/api/payments/providers")
      .then((list) => {
        if (!active || !Array.isArray(list)) return;
        setProviders(list);
        setPaymentMethod((current) => (current === "COD" || list.includes(current) ? current : "COD"));
      })
      .catch(() => { if (active) setProviders([]); });
    return () => { active = false; };
  }, [authed]);

  // Hudud tanlanganda yetkazish kotirovkasi (itemsTotal majburiy — bepul chegara unga bog'liq).
  useEffect(() => {
    if (!regionId) { setQuotes(null); setMethod(null); return; }
    let active = true;
    setQuotesLoading(true);
    apiFetch<DeliveryQuoteDto[]>(`/api/delivery-options?regionId=${regionId}&itemsTotal=${itemsTotal}`)
      .then((list) => {
        if (!active) return;
        setQuotes(list);
        setMethod((current) => (current && list.some((quote) => quote.method === current) ? current : list[0]?.method ?? null));
      })
      .catch(() => { if (active) { setQuotes([]); setMethod(null); } })
      .finally(() => { if (active) setQuotesLoading(false); });
    return () => { active = false; };
  }, [regionId, itemsTotal]);

  function syncLocalCart(next: CheckoutItem[]) {
    if (source !== "cart") return;
    const byId = new Map(next.map((item) => [item.book.id, item.quantity]));
    writeCart(readCart()
      .filter((item) => byId.has(item.book.id))
      .map((item) => ({ ...item, quantity: byId.get(item.book.id) ?? item.quantity })));
  }

  function applyAdjustments(adjustments: Adjustment[]) {
    const next = lines
      .map((line) => {
        const adjustment = adjustments.find((item) => String(item.bookId) === line.book.id);
        if (!adjustment) return line;
        if (adjustment.removed || adjustment.inCart <= 0) return null;
        return { ...line, quantity: adjustment.inCart };
      })
      .filter((line): line is CheckoutItem => line !== null);
    setLines(next);
    syncLocalCart(next);
    const removedTitles = adjustments.filter((item) => item.removed).map((item) => item.title).filter(Boolean);
    setFormNotice(removedTitles.length
      ? `Ba’zi kitoblar sotuvda qolmadi (${removedTitles.join(", ")}); qolganlari ombordagi qoldiqqa moslandi. Tekshirib, qayta tasdiqlang.`
      : "Kitoblar miqdori ombordagi qoldiqqa moslandi. Tekshirib, qayta tasdiqlang.");
  }

  function applyPriceChanges(books: PriceChange[]) {
    setPriceChanges(books);
    const next = lines.map((line) => {
      const change = books.find((book) => String(book.bookId) === line.book.id);
      return change ? { ...line, book: { ...line.book, price: change.currentPrice } } : line;
    });
    setLines(next);
    syncLocalCart(next);
  }

  // Butun formani tekshiradi. SMS shundan keyin yuboriladi, aks holda mijoz
  // kod cheklovini to'ldirilmagan maydon uchun sarflab qo'yardi.
  function validate(): string | null {
    if (!lines.length) { setFormError("Savat bo‘sh — katalogdan kitob tanlang."); return null; }
    if (!regionId) { setFieldErrors({ regionId: "Hududingizni tanlang" }); return null; }
    if (!method) { setFormError("Bu hudud uchun yetkazish usuli topilmadi."); return null; }
    const phone = normalizePhone(recipientPhone);
    if (!phone) { setFieldErrors({ recipientPhone: "Telefon raqam +998 XX XXX XX XX ko‘rinishida bo‘lishi kerak" }); return null; }
    if (!recipientName.trim()) { setFieldErrors({ recipientName: "Qabul qiluvchi ismini kiriting" }); return null; }
    return phone;
  }

  async function handleSubmit(acceptPrices = false) {
    if (busy) return;
    setFormError("");
    setFormNotice("");
    setFieldErrors({});
    if (!acceptPrices) setPriceChanges(null);

    const phone = validate();
    if (!phone) return;

    // Kirgan mijoz uchun kod qadami umuman chiqmaydi.
    if (authed) { await placeOrder(phone, acceptPrices); return; }
    await requestCode(phone);
  }

  async function requestCode(phone: string) {
    setBusy(true);
    try {
      const sent = await apiFetch<CodeSent>("/api/auth/otp/request", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      setOtp({ phone, meta: sent });
      setStep("code");
    } catch (error) {
      if (error instanceof ClientApiError) {
        if (error.code === "VALIDATION_FAILED") setFieldErrors({ recipientPhone: error.message });
        else if (error.code === "SMS_DELIVERY_FAILED") setFormError("SMS yuborilmadi — aloqada uzilish. Qayta urinib ko‘ring.");
        else setFormError(error.message);
      } else {
        setFormError("Kod yuborilmadi. Internetni tekshirib qayta urining.");
      }
    } finally {
      setBusy(false);
    }
  }

  // Kod tasdiqlandi: mijoz endi tizimda. Profilni yangilaymiz va buyurtmani joylaymiz.
  async function handleVerified({ newAccount }: { newAccount: boolean }) {
    notifyAuthChanged();
    const fullName = recipientName.trim();
    // Yangi hisobda profil bo'sh bo'ladi — formadagi ismni saqlab qo'yamiz (API.md §5).
    // Bu buyurtmaga ta'sir qilmaydi, shuning uchun xatosi jimgina yutiladi.
    if (newAccount && fullName) {
      await apiFetch("/api/account", { method: "PUT", body: JSON.stringify({ fullName }) }).catch(() => null);
    }
    const session = await apiFetch<{ authenticated: boolean; profile?: ProfileDto }>("/api/auth/session").catch(() => null);
    if (session?.authenticated && session.profile) setSession({ state: "authed", profile: session.profile });

    const phone = otp?.phone ?? normalizePhone(recipientPhone);
    if (!phone) { setStep("form"); setFormError("Telefon raqamni tekshirib, qayta urining."); return; }
    await placeOrder(phone, false);
  }

  async function placeOrder(phone: string, acceptPrices: boolean) {
    setBusy(true);
    setPlacing(true);
    try {
      const result = await apiFetch<CheckoutSuccess>("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          items: lines.map(({ book, quantity }) => ({ bookId: Number(book.id), quantity })),
          deliveryMethod: method,
          ...(method === "COURIER" ? {
            regionId,
            district: district.trim() || undefined,
            addressLine: addressLine.trim() || undefined,
          } : {}),
          recipientName: recipientName.trim(),
          recipientPhone: phone,
          customerNote: note.trim() || undefined,
          idempotencyKey: idempotencyKey.current,
          acceptPrices,
          paymentMethod,
        }),
      });

      if (source === "cart") clearCart();
      const { order, payment } = result;
      if (payment?.checkoutUrl) {
        try {
          sessionStorage.setItem(`kg:pay:${order.orderNumber}`, JSON.stringify({ provider: payment.provider, checkoutUrl: payment.checkoutUrl }));
        } catch { /* sessionStorage yopiq bo'lsa ham davom etamiz */ }
        router.push(`/order-success?order=${encodeURIComponent(order.orderNumber)}&pay=1`);
      } else {
        router.push(`/order-success?order=${encodeURIComponent(order.orderNumber)}`);
      }
    } catch (error) {
      // Buyurtma o'tmadi — mijozni formaga qaytaramiz, tuzatadigan narsa o'sha yerda.
      // Kod allaqachon tasdiqlangan bo'lsa, u endi tizimda: keyingi urinishda kod so'ralmaydi.
      setStep("form");
      if (error instanceof ClientApiError) {
        const problem = error.problem;
        switch (error.code) {
          case "UNAUTHENTICATED":
            setSession({ state: "anon" });
            setOtp(null);
            setFormError("Sessiya muddati tugadi — buyurtmani qayta tasdiqlang.");
            break;
          case "CART_ADJUSTED":
            applyAdjustments(Array.isArray(problem.adjustments) ? problem.adjustments as Adjustment[] : []);
            break;
          case "ORDER_PRICE_CHANGED":
            applyPriceChanges(Array.isArray(problem.books) ? problem.books as PriceChange[] : []);
            break;
          case "INSUFFICIENT_STOCK": {
            const bookId = typeof problem.bookId === "number" ? problem.bookId : null;
            const available = typeof problem.available === "number" ? problem.available : 0;
            if (bookId !== null) {
              applyAdjustments([{ bookId, requested: 0, inCart: available, removed: available <= 0 }]);
            }
            setFormNotice("Omborda yetarli nusxa qolmadi — miqdor moslandi. Qayta tasdiqlang.");
            break;
          }
          case "BOOK_NOT_PURCHASABLE": {
            const books = Array.isArray(problem.books) ? problem.books as Array<{ bookId: number; title?: string }> : [];
            applyAdjustments(books.map((book) => ({ bookId: book.bookId, title: book.title, requested: 0, inCart: 0, removed: true })));
            break;
          }
          case "CART_EMPTY":
            setFormError("Savatdagi kitoblar hozirda sotuvda yo‘q.");
            break;
          case "REGION_NOT_SERVICED":
            setFieldErrors({ regionId: error.message });
            break;
          case "VALIDATION_FAILED": {
            const mapped: Record<string, string> = {};
            for (const item of problem.errors ?? []) mapped[item.field] = item.message;
            setFieldErrors(mapped);
            if (!Object.keys(mapped).length) setFormError(error.message);
            break;
          }
          default:
            setFormError(error.message);
        }
      } else {
        setFormError("Buyurtma yuborilmadi. Internetni tekshirib qayta urining.");
      }
    } finally {
      setBusy(false);
      setPlacing(false);
    }
  }

  if (step === "code" && otp) {
    return (
      <CheckoutCodeStep
        phone={otp.phone}
        meta={otp.meta}
        total={formatPrice(grandTotal)}
        placing={placing}
        onVerified={(info) => void handleVerified(info)}
        onBack={() => setStep("form")}
      />
    );
  }

  return (
    <section className="container-page py-5 sm:py-12">
      <form onSubmit={(event) => { event.preventDefault(); void handleSubmit(); }} className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_380px] xl:gap-8">
        <div className="space-y-4 sm:space-y-5">
          <fieldset disabled={busy} className="rounded-2xl border border-line bg-cream p-4 disabled:opacity-70 sm:p-7">
            <legend className="px-2 text-lg font-extrabold">Yetkazib berish</legend>
            <div>
              <label className="text-sm font-bold" htmlFor="region">Viloyat yoki shahar</label>
              <select
                id="region"
                value={regionId}
                onChange={(event) => setRegionId(event.target.value ? Number(event.target.value) : "")}
                required
                className="mt-2 h-12 w-full rounded-xl border border-line bg-cream px-4 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
              >
                <option value="" disabled>Hududingizni tanlang</option>
                {regions.map((region) => <option key={region.id} value={region.id}>{region.nameUz}</option>)}
              </select>
              {!regions.length && <p className="mt-2 text-xs font-medium text-danger">Hududlar ro‘yxati yuklanmadi. Sahifani yangilang.</p>}
              {fieldErrors.regionId && <p className="mt-2 text-xs font-medium text-danger">{fieldErrors.regionId}</p>}
            </div>

            {regionId !== "" && (
              <div className="mt-4">
                {quotesLoading && <div className="h-16 animate-pulse rounded-xl bg-sand/60" />}
                {!quotesLoading && quotes && quotes.length === 0 && (
                  <p className="rounded-xl bg-warningSoft p-3.5 text-sm font-medium text-warning">Bu hududga yetkazish hozircha mavjud emas. Boshqa hudud tanlang.</p>
                )}
                {!quotesLoading && quotes && quotes.length > 0 && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {quotes.map((quote) => {
                      const { title, icon: Icon } = METHOD_LABELS[quote.method];
                      const active = method === quote.method;
                      return (
                        <label key={quote.method} className={`flex cursor-pointer gap-3 rounded-xl border-2 p-3.5 transition ${active ? "border-brand bg-sand/50" : "border-line bg-cream hover:border-brand/40"}`}>
                          <input type="radio" name="deliveryMethod" className="sr-only" checked={active} onChange={() => setMethod(quote.method)} />
                          <Icon size={21} className={`mt-0.5 shrink-0 ${active ? "text-brand" : "text-bodyText"}`} />
                          <span className="min-w-0 text-sm">
                            <strong className="block">{title}</strong>
                            <span className="mt-0.5 block text-bodyText">
                              {quote.free ? "Bepul" : formatPrice(quote.fee)} · {quote.minDays === quote.maxDays ? `${quote.minDays} kun` : `${quote.minDays}–${quote.maxDays} kun`}
                            </span>
                            {!quote.free && quote.amountUntilFree !== undefined && (
                              <span className="mt-1 block text-xs font-medium text-brand">Yana {formatPrice(quote.amountUntilFree)} xarid qilsangiz — bepul</span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-bold" htmlFor="recipientName">Qabul qiluvchi ismi</label>
                <input id="recipientName" value={recipientName} onChange={(event) => setRecipientName(event.target.value)} required placeholder="Ismingiz" className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" />
                {fieldErrors.recipientName && <p className="mt-1.5 text-xs font-medium text-danger">{fieldErrors.recipientName}</p>}
              </div>
              <div>
                <label className="text-sm font-bold" htmlFor="recipientPhone">Telefon raqam</label>
                <input id="recipientPhone" type="tel" value={recipientPhone} onChange={(event) => setRecipientPhone(event.target.value)} required placeholder="+998 90 123 45 67" className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" />
                {fieldErrors.recipientPhone && <p className="mt-1.5 text-xs font-medium text-danger">{fieldErrors.recipientPhone}</p>}
              </div>
              {method !== "PICKUP" && (
                <>
                  <div>
                    <label className="text-sm font-bold" htmlFor="district">Tuman <span className="font-normal text-bodyText">(ixtiyoriy)</span></label>
                    <input id="district" value={district} onChange={(event) => setDistrict(event.target.value)} placeholder="Chilonzor tumani" className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" />
                  </div>
                  <div>
                    <label className="text-sm font-bold" htmlFor="addressLine">Manzil <span className="font-normal text-bodyText">(ixtiyoriy)</span></label>
                    <input id="addressLine" value={addressLine} onChange={(event) => setAddressLine(event.target.value)} placeholder="Ko‘cha, uy, xonadon" className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" />
                  </div>
                </>
              )}
              <div className="sm:col-span-2">
                <label className="text-sm font-bold" htmlFor="note">Izoh <span className="font-normal text-bodyText">(ixtiyoriy)</span></label>
                <input id="note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Masalan: ertalab yetkazing" className="mt-2 h-12 w-full rounded-xl border border-line px-4 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-brand/10" />
              </div>
            </div>
            {method === "COURIER" && (
              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-bodyText"><MapPin size={15} className="mt-0.5 shrink-0 text-brand" /> Manzilni yozmasangiz ham bo‘ladi — kuryer aniq manzilni telefon orqali kelishib oladi.</p>
            )}
          </fieldset>

          <fieldset disabled={busy} className="rounded-2xl border border-line bg-cream p-4 disabled:opacity-70 sm:p-7">
            <legend className="px-2 text-lg font-extrabold">To‘lov usuli</legend>
            <div className="grid gap-2">
              <label className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition ${paymentMethod === "COD" ? "border-brand bg-sand/50" : "border-line bg-cream hover:border-brand/40"}`}>
                <input type="radio" name="paymentMethod" className="sr-only" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                <Banknote size={22} className={`shrink-0 ${paymentMethod === "COD" ? "text-brand" : "text-bodyText"}`} />
                <span className="text-sm"><strong className="block">Qabul qilganda to‘lash</strong><span className="mt-0.5 block text-bodyText">Kitobni tekshirgandan keyin naqd yoki karta orqali</span></span>
              </label>
              {(authed ? providers : ADVERTISED_PROVIDERS).map((provider) => (
                <label key={provider} className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition ${paymentMethod === provider ? "border-brand bg-sand/50" : "border-line bg-cream hover:border-brand/40"}`}>
                  <input type="radio" name="paymentMethod" className="sr-only" checked={paymentMethod === provider} onChange={() => setPaymentMethod(provider)} />
                  <CreditCard size={22} className={`shrink-0 ${paymentMethod === provider ? "text-brand" : "text-bodyText"}`} />
                  <span className="text-sm"><strong className="block">{provider === "CLICK" ? "Click" : "Payme"} orqali onlayn to‘lash</strong><span className="mt-0.5 block text-bodyText">To‘lov sahifasiga yo‘naltiramiz; buyurtma to‘lovdan so‘ng tasdiqlanadi</span></span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-cream p-5 shadow-soft lg:sticky lg:top-40 sm:p-6">
          <h2 className="font-serif text-lg font-semibold">Buyurtmangiz</h2>
          <div className="mt-4 space-y-4">
            {lines.map(({ book, quantity }) => (
              <div key={book.id} className="flex gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: book.color }}>
                  <Image src={book.image} alt="" fill unoptimized={isExternalImage(book.image)} sizes="64px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-bold">{book.title}</p>
                  <p className="mt-1 text-xs text-bodyText">{quantity} dona</p>
                </div>
                <strong className="shrink-0 text-sm">{formatPrice(book.price * quantity)}</strong>
              </div>
            ))}
          </div>
          <dl className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
            <div className="flex justify-between"><dt className="text-bodyText">Mahsulotlar</dt><dd>{formatPrice(itemsTotal)}</dd></div>
            <div className="flex justify-between">
              <dt className="text-bodyText">Yetkazish</dt>
              <dd className={deliveryFee === 0 ? "font-bold text-brand" : "font-semibold"}>
                {deliveryFee === null ? "Hudud tanlang" : deliveryFee === 0 ? "Bepul" : formatPrice(deliveryFee)}
              </dd>
            </div>
            <div className="flex items-end justify-between border-t border-line pt-4"><dt className="font-bold">Jami</dt><dd className="font-serif text-2xl font-semibold text-brand">{formatPrice(grandTotal)}</dd></div>
          </dl>

          {priceChanges && priceChanges.length > 0 && (
            <div className="mt-4 rounded-xl bg-warningSoft p-3.5 text-sm text-warning" role="alert">
              <strong className="flex items-center gap-1.5"><AlertCircle size={16} /> Narxlar yangilandi</strong>
              <ul className="mt-2 space-y-1">
                {priceChanges.map((change) => (
                  <li key={change.bookId}>{change.title}: <s>{formatPrice(change.cartPrice)}</s> → <strong>{formatPrice(change.currentPrice)}</strong></li>
                ))}
              </ul>
              <button type="button" onClick={() => void handleSubmit(true)} disabled={busy} className="button-primary mt-3 h-10 w-full px-4 text-sm">Yangi narxlarga roziman — davom etish</button>
            </div>
          )}
          {formNotice && <p className="mt-4 flex items-start gap-2 rounded-xl bg-warningSoft p-3 text-sm font-medium text-warning" role="status"><AlertCircle size={17} className="mt-0.5 shrink-0" />{formNotice}</p>}
          {formError && <p className="mt-4 flex items-start gap-2 rounded-xl bg-dangerSoft p-3 text-sm font-medium text-danger" role="alert"><AlertCircle size={17} className="mt-0.5 shrink-0" />{formError}</p>}

          <button
            type="submit"
            disabled={busy || session.state === "loading" || !lines.length}
            className="button-primary mt-6 h-12 w-full px-5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy
              ? <><LoaderCircle size={18} className="animate-spin" /> Yuborilmoqda…</>
              : paymentMethod === "COD" ? "Buyurtmani tasdiqlash" : "To‘lovga o‘tish"}
          </button>
          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-bodyText"><LockKeyhole size={15} className="mt-0.5 shrink-0 text-brand" /> Ma’lumotlaringiz xavfsiz saqlanadi va faqat buyurtmani bajarish uchun ishlatiladi.</p>
          <div className="mt-5 grid grid-cols-2 gap-2"><span className="flex items-center gap-1.5 text-[11px] text-bodyText"><Truck size={15} className="text-brand" /> Tez yetkazish</span><span className="flex items-center gap-1.5 text-[11px] text-bodyText"><CheckCircle2 size={15} className="text-brand" /> Sifat kafolati</span></div>
        </aside>
      </form>
    </section>
  );
}
