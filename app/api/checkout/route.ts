import { NextRequest, NextResponse } from "next/server";
import {
  readProblem,
  type ApiProblem,
  type CartDto,
  type OrderDetailDto,
  type PaymentInitiationDto,
} from "@/lib/store-api";
import { guard, kgAuthedFetch, problemResponse } from "@/lib/server/session";

// Kompozit checkout (API.md §6):
//   1) server savati saytdagi savat bilan to'liq almashtiriladi (narx snapshoti — mijoz
//      ekranda ko'rgan joriy narx bo'lishi uchun),
//   2) miqdor kesilgan/o'chgan pozitsiyalar bo'lsa buyurtma BERILMAY, sayt-ichki
//      `CART_ADJUSTED` kodi bilan qaytadi — mijoz lokal savatni moslab qayta yuboradi,
//   3) POST /orders (idempotencyKey bilan — timeout retry'da nusxa buyurtma tug'ilmaydi),
//   4) to'lov: COD → /payments/cash-on-delivery (buyurtma darhol PROCESSING),
//      CLICK/PAYME → /payments → checkoutUrl.
// Backend xatolari (ORDER_PRICE_CHANGED, INSUFFICIENT_STOCK, REGION_NOT_SERVICED …)
// problem+json ko'rinishida o'zgarishsiz uzatiladi; mijoz `code` bo'yicha shoxlanadi.

interface CheckoutItem {
  bookId: number;
  quantity: number;
}

interface CheckoutBody {
  items: CheckoutItem[];
  deliveryMethod: "COURIER" | "PICKUP";
  regionId?: number;
  district?: string;
  addressLine?: string;
  landmark?: string;
  recipientName: string;
  recipientPhone: string;
  customerNote?: string;
  idempotencyKey: string;
  acceptPrices?: boolean;
  paymentMethod: "COD" | "CLICK" | "PAYME";
}

interface Adjustment {
  bookId: number;
  title?: string;
  requested: number;
  inCart: number;
  removed: boolean;
}

// Kitobning o'ziga bog'liq add-xatolari pozitsiyani "olib tashlangan" deb belgilaydi;
// qolgan har qanday xato butun jarayonni to'xtatadi.
const BOOK_LEVEL_CODES = new Set(["BOOK_NOT_FOUND", "BOOK_NOT_PURCHASABLE", "RESOURCE_NOT_FOUND"]);

function text(value: unknown, max = 500): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

function parseBody(raw: unknown): CheckoutBody | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as Record<string, unknown>;

  const items = Array.isArray(body.items)
    ? body.items
        .map((item) => ({
          bookId: Number((item as Record<string, unknown>)?.bookId),
          quantity: Number((item as Record<string, unknown>)?.quantity),
        }))
        .filter((item) => Number.isSafeInteger(item.bookId) && item.bookId > 0 && Number.isSafeInteger(item.quantity) && item.quantity > 0)
    : [];
  if (!items.length || items.length > 50) return null;

  const deliveryMethod = body.deliveryMethod === "COURIER" || body.deliveryMethod === "PICKUP" ? body.deliveryMethod : null;
  const paymentMethod = body.paymentMethod === "COD" || body.paymentMethod === "CLICK" || body.paymentMethod === "PAYME" ? body.paymentMethod : null;
  const idempotencyKey = text(body.idempotencyKey, 64);
  const recipientName = text(body.recipientName, 150);
  const recipientPhone = text(body.recipientPhone, 20);
  if (!deliveryMethod || !paymentMethod || !idempotencyKey || !recipientName || !recipientPhone) return null;

  const regionId = Number(body.regionId);
  return {
    items,
    deliveryMethod,
    paymentMethod,
    idempotencyKey,
    recipientName,
    recipientPhone,
    regionId: Number.isSafeInteger(regionId) && regionId > 0 ? regionId : undefined,
    district: text(body.district),
    addressLine: text(body.addressLine),
    landmark: text(body.landmark),
    customerNote: text(body.customerNote, 1000),
    acceptPrices: body.acceptPrices === true,
  };
}

async function replaceServerCart(body: CheckoutBody): Promise<{ cart: CartDto | null; adjustments: Adjustment[] } | { abort: ApiProblem }> {
  const wipe = await kgAuthedFetch("/cart", { method: "DELETE" });
  if (!wipe.ok) return { abort: await readProblem(wipe) };

  const adjustments: Adjustment[] = [];
  let cart: CartDto | null = null;

  for (const item of body.items) {
    const response = await kgAuthedFetch("/cart/items", {
      method: "POST",
      body: JSON.stringify({ bookId: item.bookId, quantity: item.quantity }),
    });
    if (response.ok) {
      cart = await response.json() as CartDto;
      continue;
    }
    const problem = await readProblem(response);
    if (BOOK_LEVEL_CODES.has(problem.code)) {
      adjustments.push({ bookId: item.bookId, requested: item.quantity, inCart: 0, removed: true });
      continue;
    }
    return { abort: problem };
  }

  // Sotuvdan chiqqan (purchasable=false) pozitsiyalarni tozalaymiz — aks holda
  // POST /orders BOOK_NOT_PURCHASABLE bilan yiqiladi.
  if (cart) {
    for (const line of cart.items.filter((line) => !line.purchasable)) {
      adjustments.push({ bookId: line.bookId, title: line.title, requested: line.quantity, inCart: 0, removed: true });
      const removal = await kgAuthedFetch(`/cart/items/${line.bookId}`, { method: "DELETE" });
      if (removal.ok) cart = await removal.json() as CartDto;
    }
    // Miqdori kesilganlar (ombordagidan ko'p so'ralgan — server 50 taga yoki mavjudiga kesadi).
    for (const item of body.items) {
      const line = cart.items.find((line) => line.bookId === item.bookId);
      if (!line) {
        if (!adjustments.some((adjustment) => adjustment.bookId === item.bookId)) {
          adjustments.push({ bookId: item.bookId, requested: item.quantity, inCart: 0, removed: true });
        }
        continue;
      }
      const effective = Math.min(line.quantity, line.availableQuantity);
      if (effective < item.quantity) {
        adjustments.push({ bookId: item.bookId, title: line.title, requested: item.quantity, inCart: effective, removed: effective === 0 });
        if (effective !== line.quantity) {
          // available < savatdagi miqdor — buyurtmadan oldin serverda ham moslab qo'yamiz.
          const update = await kgAuthedFetch(`/cart/items/${line.bookId}`, {
            method: "PUT",
            body: JSON.stringify({ quantity: effective }),
          });
          if (update.ok) cart = await update.json() as CartDto;
        }
      }
    }
  }

  return { cart, adjustments };
}

export function POST(request: NextRequest) {
  return guard(async () => {
    const body = parseBody(await request.json().catch(() => null));
    if (!body) {
      return problemResponse({ status: 400, code: "VALIDATION_FAILED", detail: "Buyurtma ma’lumotlari to‘liq emas" });
    }
    if (body.deliveryMethod === "COURIER" && !body.regionId) {
      return problemResponse({ status: 400, code: "ADDRESS_REQUIRED", detail: "Yetkazish hududini tanlang" });
    }

    const sync = await replaceServerCart(body);
    if ("abort" in sync) return problemResponse(sync.abort);
    const { cart, adjustments } = sync;

    if (!cart || cart.items.length === 0) {
      return problemResponse({ status: 409, code: "CART_EMPTY", detail: "Savatdagi kitoblar hozirda sotuvda yo‘q" });
    }
    if (adjustments.length > 0) {
      return NextResponse.json({
        status: 409,
        code: "CART_ADJUSTED",
        detail: "Ba’zi kitoblar miqdori ombordagi qoldiqqa moslashtirildi",
        adjustments,
        cart: { itemsTotal: cart.itemsTotal, totalQuantity: cart.totalQuantity },
      }, { status: 409 });
    }

    if (body.acceptPrices) {
      const accept = await kgAuthedFetch("/cart/accept-prices", { method: "POST" });
      if (!accept.ok) return problemResponse(await readProblem(accept));
    }

    const orderResponse = await kgAuthedFetch("/orders", {
      method: "POST",
      body: JSON.stringify({
        deliveryMethod: body.deliveryMethod,
        ...(body.deliveryMethod === "COURIER" ? { regionId: body.regionId } : {}),
        ...(body.district ? { district: body.district } : {}),
        ...(body.addressLine ? { addressLine: body.addressLine } : {}),
        ...(body.landmark ? { landmark: body.landmark } : {}),
        recipientName: body.recipientName,
        recipientPhone: body.recipientPhone,
        ...(body.customerNote ? { customerNote: body.customerNote } : {}),
        idempotencyKey: body.idempotencyKey,
      }),
    });
    if (!orderResponse.ok) return problemResponse(await readProblem(orderResponse));
    let order = await orderResponse.json() as OrderDetailDto;

    // Idempotent replay'da savat serverda to'la qoladi — tozalab qo'yamiz (xato e'tiborsiz).
    await kgAuthedFetch("/cart", { method: "DELETE" }).catch(() => null);

    let payment: PaymentInitiationDto | undefined;
    let paymentProblem: ApiProblem | undefined;

    if (body.paymentMethod === "COD") {
      const codResponse = await kgAuthedFetch("/payments/cash-on-delivery", {
        method: "POST",
        body: JSON.stringify({ orderNumber: order.orderNumber }),
      });
      if (codResponse.ok) {
        order = await codResponse.json() as OrderDetailDto;
      } else {
        const problem = await readProblem(codResponse);
        // Checklist: to'lov amalidagi ORDER_ALREADY_PAID — muvaffaqiyat; real holatni qayta o'qiymiz.
        if (problem.code === "ORDER_ALREADY_PAID" || problem.code === "PAYMENT_ALREADY_COMPLETED") {
          const refetch = await kgAuthedFetch(`/orders/${encodeURIComponent(order.orderNumber)}`);
          if (refetch.ok) order = await refetch.json() as OrderDetailDto;
        } else {
          paymentProblem = problem;
        }
      }
    } else {
      const paymentResponse = await kgAuthedFetch("/payments", {
        method: "POST",
        body: JSON.stringify({ orderNumber: order.orderNumber, provider: body.paymentMethod }),
      });
      if (paymentResponse.ok) {
        payment = await paymentResponse.json() as PaymentInitiationDto;
      } else {
        paymentProblem = await readProblem(paymentResponse);
      }
    }

    return NextResponse.json({ order, payment, paymentProblem }, { status: 201 });
  });
}
