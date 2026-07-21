"use client";

import type { OrderResponseDto } from "@/lib/store-api";

const DB_NAME = "kitobgo-client";
const DB_VERSION = 1;
const STORE_NAME = "pending-orders";
const RETRY_DELAYS_MS = [2_000, 5_000, 10_000, 30_000, 60_000];
const REQUEST_TIMEOUT_MS = 15_000;

export const ORDER_QUEUE_EVENT = "kitobgo:order-queue";

export type PendingOrderState = "PENDING" | "SENDING" | "NEEDS_ACTION";

export interface OrderPayload {
  items: Array<{ productId: number; quantity: number }>;
  customerName: string;
  customerPhone: string;
  region: string;
}

export interface PendingOrder {
  clientRequestId: string;
  payload: OrderPayload;
  state: PendingOrderState;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  nextRetryAt: number;
  lastError?: string;
  lastHttpStatus?: number;
}

export type OrderQueueResult =
  | { kind: "success"; clientRequestId: string; order: OrderResponseDto; replayed: boolean }
  | { kind: "retry"; pending: PendingOrder }
  | { kind: "needs_action"; pending: PendingOrder };

let databasePromise: Promise<IDBDatabase> | null = null;
const activeRequests = new Set<string>();

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "clientRequestId" });
        store.createIndex("nextRetryAt", "nextRetryAt");
      }
    };
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => {
        database.close();
        databasePromise = null;
      };
      resolve(database);
    };
    request.onerror = () => {
      databasePromise = null;
      reject(request.error ?? new Error("IndexedDB ochilmadi"));
    };
    request.onblocked = () => {
      databasePromise = null;
      reject(new Error("IndexedDB yangilanishi boshqa oynada bloklangan"));
    };
  });
  return databasePromise;
}

function completeTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction xatosi"));
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction bekor qilindi"));
  });
}

export async function putPendingOrder(order: PendingOrder): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const completed = completeTransaction(transaction);
  transaction.objectStore(STORE_NAME).put(order);
  await completed;
}

export async function getPendingOrder(clientRequestId: string): Promise<PendingOrder | undefined> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readonly");
  const completed = completeTransaction(transaction);
  const request = transaction.objectStore(STORE_NAME).get(clientRequestId);
  const resultPromise = new Promise<PendingOrder | undefined>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as PendingOrder | undefined);
    request.onerror = () => reject(request.error ?? new Error("Pending order o‘qilmadi"));
  });
  const [result] = await Promise.all([resultPromise, completed]);
  return result;
}

export async function getPendingOrders(): Promise<PendingOrder[]> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readonly");
  const completed = completeTransaction(transaction);
  const request = transaction.objectStore(STORE_NAME).getAll();
  const resultPromise = new Promise<PendingOrder[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as PendingOrder[]);
    request.onerror = () => reject(request.error ?? new Error("Pending orderlar o‘qilmadi"));
  });
  const [result] = await Promise.all([resultPromise, completed]);
  return result;
}

export async function updatePendingOrder(clientRequestId: string, changes: Partial<Omit<PendingOrder, "clientRequestId" | "payload">>): Promise<PendingOrder | undefined> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const completed = completeTransaction(transaction);
  const store = transaction.objectStore(STORE_NAME);
  const request = store.get(clientRequestId);
  const resultPromise = new Promise<PendingOrder | undefined>((resolve, reject) => {
    request.onsuccess = () => {
      const current = request.result as PendingOrder | undefined;
      if (!current) {
        resolve(undefined);
        return;
      }
      const updated = { ...current, ...changes, clientRequestId: current.clientRequestId, payload: current.payload };
      store.put(updated);
      resolve(updated);
    };
    request.onerror = () => reject(request.error ?? new Error("Pending order yangilanmadi"));
  });
  const [result] = await Promise.all([resultPromise, completed]);
  return result;
}

export async function deletePendingOrder(clientRequestId: string): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  const completed = completeTransaction(transaction);
  transaction.objectStore(STORE_NAME).delete(clientRequestId);
  await completed;
}

export async function enqueueOrder(payload: OrderPayload): Promise<PendingOrder> {
  const now = new Date().toISOString();
  const snapshot = JSON.parse(JSON.stringify(payload)) as OrderPayload;
  const pending: PendingOrder = {
    clientRequestId: crypto.randomUUID(),
    payload: snapshot,
    state: "PENDING",
    attempts: 0,
    createdAt: now,
    updatedAt: now,
    nextRetryAt: Date.now(),
  };
  await putPendingOrder(pending);
  return pending;
}

export async function resetSendingOrders(): Promise<void> {
  const orders = await getPendingOrders();
  const now = new Date().toISOString();
  await Promise.all(orders
    .filter((order) => order.state === "SENDING")
    .map((order) => updatePendingOrder(order.clientRequestId, { state: "PENDING", updatedAt: now, nextRetryAt: Date.now() })));
}

export async function getDuePendingOrders(now = Date.now()): Promise<PendingOrder[]> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readonly");
  const completed = completeTransaction(transaction);
  const index = transaction.objectStore(STORE_NAME).index("nextRetryAt");
  const request = index.getAll(IDBKeyRange.upperBound(now));
  const ordersPromise = new Promise<PendingOrder[]>((resolve, reject) => {
    request.onsuccess = () => resolve((request.result as PendingOrder[]).filter((order) => order.state === "PENDING"));
    request.onerror = () => reject(request.error ?? new Error("Retry navbati o‘qilmadi"));
  });
  const [orders] = await Promise.all([ordersPromise, completed]);
  return orders;
}

function retryDelay(attempts: number): number {
  const base = RETRY_DELAYS_MS[Math.min(attempts, RETRY_DELAYS_MS.length - 1)];
  return base + Math.floor(Math.random() * 1_000);
}

function retryAfterDelay(response: Response): number | undefined {
  const value = response.headers.get("Retry-After");
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1_000;
  const date = Date.parse(value);
  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}

async function safeReadError(response: Response): Promise<string> {
  const body = await response.json().catch(() => null) as Record<string, unknown> | null;
  if (typeof body?.error === "string") return body.error;
  const firstMessage = Object.values(body ?? {}).find((value) => typeof value === "string");
  return typeof firstMessage === "string" ? firstMessage : `Server HTTP ${response.status} xatosini qaytardi`;
}

async function scheduleRetry(order: PendingOrder, error: string, httpStatus?: number, delay?: number): Promise<PendingOrder> {
  const updated = await updatePendingOrder(order.clientRequestId, {
    state: "PENDING",
    attempts: order.attempts + 1,
    updatedAt: new Date().toISOString(),
    nextRetryAt: Date.now() + (delay ?? retryDelay(order.attempts)),
    lastError: error,
    lastHttpStatus: httpStatus,
  });
  if (!updated) throw new Error("Retry uchun pending order topilmadi");
  return updated;
}

async function markNeedsAction(order: PendingOrder, error: string, httpStatus: number): Promise<PendingOrder> {
  const updated = await updatePendingOrder(order.clientRequestId, {
    state: "NEEDS_ACTION",
    attempts: order.attempts + 1,
    updatedAt: new Date().toISOString(),
    nextRetryAt: Number.MAX_SAFE_INTEGER,
    lastError: error,
    lastHttpStatus: httpStatus,
  });
  if (!updated) throw new Error("Pending order topilmadi");
  return updated;
}

async function sendPendingOrder(clientRequestId: string): Promise<OrderQueueResult | null> {
  const order = await getPendingOrder(clientRequestId);
  if (!order || order.state === "NEEDS_ACTION") return null;

  await updatePendingOrder(clientRequestId, { state: "SENDING", updatedAt: new Date().toISOString() });
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch("/api/store/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": order.clientRequestId,
      },
      body: JSON.stringify(order.payload),
      signal: controller.signal,
    });

    if (response.status === 200 || response.status === 201) {
      const createdOrder = await response.json() as OrderResponseDto;
      await deletePendingOrder(order.clientRequestId);
      return {
        kind: "success",
        clientRequestId: order.clientRequestId,
        order: createdOrder,
        replayed: response.headers.get("Idempotency-Replayed") === "true",
      };
    }

    const error = await safeReadError(response);
    if ([400, 404, 409].includes(response.status)) {
      if (response.status === 409 && /idempotenc/i.test(error)) {
        console.error("Idempotency-Key boshqa payload bilan ishlatildi. Bu frontend xatosi.", { clientRequestId, error });
      }
      return { kind: "needs_action", pending: await markNeedsAction(order, error, response.status) };
    }

    if (response.status === 429 || response.status >= 500) {
      return { kind: "retry", pending: await scheduleRetry(order, error, response.status, retryAfterDelay(response)) };
    }

    return { kind: "needs_action", pending: await markNeedsAction(order, error, response.status) };
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "AbortError";
    const message = timedOut
      ? "Javob kutilmoqda, buyurtmani xavfsiz qayta tekshiryapmiz."
      : "Internet bilan aloqa yo‘q. Buyurtmani avtomatik qayta yuboramiz.";
    return { kind: "retry", pending: await scheduleRetry(order, message) };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function withInMemoryGuard(clientRequestId: string): Promise<OrderQueueResult | null> {
  if (activeRequests.has(clientRequestId)) return null;
  activeRequests.add(clientRequestId);
  try {
    return await sendPendingOrder(clientRequestId);
  } finally {
    activeRequests.delete(clientRequestId);
  }
}

export async function processPendingOrder(clientRequestId: string): Promise<OrderQueueResult | null> {
  if (navigator.locks) {
    return navigator.locks.request(
      `kitobgo-pending-order:${clientRequestId}`,
      { ifAvailable: true },
      (lock) => lock ? withInMemoryGuard(clientRequestId) : null,
    );
  }
  return withInMemoryGuard(clientRequestId);
}

export async function retryPendingOrderNow(clientRequestId: string): Promise<OrderQueueResult | null> {
  const updated = await updatePendingOrder(clientRequestId, {
    state: "PENDING",
    updatedAt: new Date().toISOString(),
    nextRetryAt: Date.now(),
    lastError: undefined,
    lastHttpStatus: undefined,
  });
  return updated ? processPendingOrder(clientRequestId) : null;
}

export function dispatchOrderQueueResult(result: OrderQueueResult): void {
  window.dispatchEvent(new CustomEvent<OrderQueueResult>(ORDER_QUEUE_EVENT, { detail: result }));
}
