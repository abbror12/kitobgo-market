import { NextRequest, NextResponse } from "next/server";
import { ApiError, createOrder, type CreateOrderRequest } from "@/lib/store-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateOrderRequest;
    const order = await createOrder(body);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Server bilan bog‘lanib bo‘lmadi. Qayta urinib ko‘ring." }, { status: 503 });
  }
}
