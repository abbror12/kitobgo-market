import { NextRequest, NextResponse } from "next/server";
import { ApiError, createOrder, type CreateOrderRequest } from "@/lib/store-api";

export async function POST(request: NextRequest) {
  try {
    const idempotencyKey = request.headers.get("Idempotency-Key")?.trim() ?? "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
      return NextResponse.json({ error: "Idempotency-Key UUID formatida bo‘lishi shart" }, { status: 400 });
    }

    const body = await request.json() as Partial<CreateOrderRequest>;
    const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
    const customerPhone = typeof body.customerPhone === "string" ? body.customerPhone.trim() : "";
    const region = typeof body.region === "string" ? body.region.trim() : "";
    const items = Array.isArray(body.items) ? body.items.map((item) => ({
      productId: typeof item?.productId === "number" ? item.productId : Number(item?.productId),
      quantity: Number(item?.quantity),
    })) : [];

    if (!customerName || !customerPhone || !region || !items.length || items.some((item) => !Number.isSafeInteger(item.productId) || item.productId <= 0 || !Number.isSafeInteger(item.quantity) || item.quantity <= 0)) {
      return NextResponse.json({ error: "Buyurtma ma’lumotlari to‘liq yoki to‘g‘ri emas" }, { status: 400 });
    }

    const result = await createOrder({ items, customerName, customerPhone, region }, idempotencyKey);
    return NextResponse.json(result.order, {
      status: result.status,
      headers: { "Idempotency-Replayed": String(result.replayed) },
    });
  } catch (error) {
    if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return NextResponse.json({ error: "So‘rov JSON formati noto‘g‘ri" }, { status: 400 });
    return NextResponse.json({ error: "Server bilan bog‘lanib bo‘lmadi. Qayta urinib ko‘ring." }, { status: 503 });
  }
}
