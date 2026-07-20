import type { Book } from "@/types/book";

export const API_BASE_URL = (process.env.KITOBGO_API_URL ?? "https://api.kitobgo.com").replace(/\/$/, "");

export interface ProductImageDto {
  id: string | number;
  url: string;
  sortOrder: number;
}

export interface ProductResponseDto {
  id: string | number;
  title: string;
  description: string;
  author: string;
  price: number;
  discountPrice: number | null;
  hasDiscount: boolean;
  rating: number;
  pageCount: number;
  publishedYear: number;
  stockQuantity: number;
  inStock: boolean;
  images: ProductImageDto[];
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface RegionDto {
  code: string;
  label: string;
  deliveryMethods: Array<"COURIER" | "EMU">;
  autoRoute: "COURIER" | "EMU" | null;
}

export interface CreateOrderRequest {
  items: Array<{ productId: string | number; quantity: number }>;
  customerName: string;
  customerPhone: string;
  region: string;
}

export interface OrderResponseDto {
  id: string | number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as Record<string, string> | null;
    const message = body?.error ?? Object.values(body ?? {})[0] ?? "API so‘rovida xatolik yuz berdi";
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

const colors = ["#EAF3ED", "#F3EBDD", "#F4E9DD", "#F5E9EE", "#E8EEE7", "#E9F0F3"];

export function productToBook(product: ProductResponseDto): Book {
  // Lokal saqlashda url nisbiy (/uploads/...) — /api/media orqali proksilanadi;
  // s3/CDN saqlashda to'liq URL keladi — borligicha ishlatiladi.
  const productImages = [...(product.images ?? [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => (image.url.startsWith("/") ? `/api/media?path=${encodeURIComponent(image.url)}` : image.url));
  const primaryImage = productImages[0];
  const effectivePrice = product.hasDiscount && product.discountPrice ? product.discountPrice : product.price;
  const id = String(product.id);

  return {
    id,
    slug: id,
    title: product.title,
    description: product.description,
    price: effectivePrice,
    oldPrice: effectivePrice < product.price ? product.price : undefined,
    rating: product.rating ?? 0,
    reviews: 0,
    image: primaryImage ?? "/images/quran-premium.png",
    images: productImages.length ? productImages : ["/images/quran-premium.png"],
    badge: product.hasDiscount ? "Chegirma" : undefined,
    color: colors[Math.abs(Number(product.id) || product.title.length) % colors.length],
    category: "kitoblar",
    author: product.author,
    publisher: "Nashriyot ma’lumoti kiritilmagan",
    publishedYear: product.publishedYear,
    pages: product.pageCount,
    language: "O‘zbek",
    cover: "Muqova ma’lumoti kiritilmagan",
    isbn: "—",
    inStock: product.inStock,
  };
}

export async function getProducts(): Promise<Book[]> {
  const result = await apiFetch<PagedResponse<ProductResponseDto>>("/api/products?size=200", { next: { revalidate: 30 } });
  return result.content.map(productToBook);
}

export async function getProduct(id: string): Promise<Book> {
  return productToBook(await apiFetch<ProductResponseDto>(`/api/products/${encodeURIComponent(id)}`, { next: { revalidate: 30 } }));
}

export async function searchProducts(params: { q?: string; maxPrice?: number; sort?: string; page?: number; size?: number }): Promise<PagedResponse<Book>> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.maxPrice) query.set("maxPrice", String(params.maxPrice));
  query.set("inStock", "true");
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 24));
  query.set("sort", params.sort ?? "title");
  const result = await apiFetch<PagedResponse<ProductResponseDto>>(`/api/products/search?${query}`, { cache: "no-store" });
  return { ...result, content: result.content.map(productToBook) };
}

export function getRegions(): Promise<RegionDto[]> {
  return apiFetch<RegionDto[]>("/api/orders/regions", { next: { revalidate: 3600 } });
}

export function createOrder(order: CreateOrderRequest): Promise<OrderResponseDto> {
  return apiFetch<OrderResponseDto>("/api/orders", { method: "POST", body: JSON.stringify(order), cache: "no-store" });
}
