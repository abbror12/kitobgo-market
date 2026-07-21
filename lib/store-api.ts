import type { Book } from "@/types/book";

export const API_BASE_URL = (process.env.KITOBGO_API_URL ?? "https://api.kitobgo.com").replace(/\/$/, "");

export interface ProductImageDto {
  id: string | number;
  url: string;
  sortOrder: number;
}

export interface CategoryResponseDto {
  id: string | number;
  name: string;
}

export interface ProductResponseDto {
  id: string | number;
  title: string;
  description: string | null;
  author: string | null;
  isbn: string | null;
  publisher: string | null;
  language: string | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  price: number;
  discountPrice: number | null;
  hasDiscount: boolean;
  rating: number | null;
  pageCount: number | null;
  publishedYear: number | null;
  stockQuantity: number;
  inStock: boolean;
  categories: CategoryResponseDto[];
  images: ProductImageDto[];
  createdAt: string;
  updatedAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export type DeliveryMethod = "COURIER" | "EMU";

export interface RegionDto {
  code: string;
  label: string;
  deliveryMethods: DeliveryMethod[];
  autoRoute: DeliveryMethod | null;
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

async function apiRequest(path: string, init?: RequestInit): Promise<Response> {
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

  return response;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiRequest(path, init);

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

const colors = ["#EAF3ED", "#F3EBDD", "#F4E9DD", "#F5E9EE", "#E8EEE7", "#E9F0F3"];

export function productToBook(product: ProductResponseDto): Book {
  // Lokal saqlashda url nisbiy (/uploads/...) — /api/media orqali proksilanadi;
  // S3/CDN saqlashda to‘liq URL keladi — borligicha ishlatiladi.
  const productImages = [...(product.images ?? [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => (image.url.startsWith("/") ? `/api/media?path=${encodeURIComponent(image.url)}` : image.url));
  const primaryImage = productImages[0];
  const effectivePrice = product.hasDiscount && product.discountPrice ? product.discountPrice : product.price;
  const id = String(product.id);
  const productCategories = (product.categories ?? []).map((category) => ({ id: String(category.id), name: category.name }));
  const primaryCategory = productCategories[0];
  const languageNames: Record<string, string> = { uz: "O‘zbek", ru: "Rus", en: "Ingliz" };
  const language = product.language
    ? languageNames[product.language.toLowerCase()] ?? product.language.toUpperCase()
    : "Til ma’lumoti kiritilmagan";

  return {
    id,
    slug: id,
    title: product.title,
    description: product.description?.trim() || "Kitob haqida ma’lumot kiritilmagan",
    price: effectivePrice,
    oldPrice: effectivePrice < product.price ? product.price : undefined,
    rating: product.rating ?? 0,
    reviews: 0,
    image: primaryImage ?? "/images/quran-premium.png",
    images: productImages.length ? productImages : ["/images/quran-premium.png"],
    badge: product.hasDiscount ? "Chegirma" : undefined,
    color: colors[Math.abs(Number(product.id) || product.title.length) % colors.length],
    category: primaryCategory?.id ?? "",
    categoryName: primaryCategory?.name,
    categories: productCategories,
    author: product.author?.trim() || "Muallif ko‘rsatilmagan",
    publisher: product.publisher?.trim() || "Nashriyot ma’lumoti kiritilmagan",
    publishedYear: product.publishedYear ?? 0,
    pages: product.pageCount ?? 0,
    language,
    cover: "Muqova ma’lumoti kiritilmagan",
    isbn: product.isbn?.trim() || "—",
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

export interface ProductSearchParams {
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  hasDiscount?: boolean;
  categoryId?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export async function searchProducts(params: ProductSearchParams): Promise<PagedResponse<Book>> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
  if (params.inStock !== undefined) query.set("inStock", String(params.inStock));
  if (params.hasDiscount !== undefined) query.set("hasDiscount", String(params.hasDiscount));
  if (params.categoryId) query.set("categoryId", params.categoryId);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 24));
  query.set("sort", params.sort ?? "title");
  const result = await apiFetch<PagedResponse<ProductResponseDto>>(`/api/products/search?${query}`, { cache: "no-store" });
  return { ...result, content: result.content.map(productToBook) };
}

export function getCategories(): Promise<CategoryResponseDto[]> {
  return apiFetch<CategoryResponseDto[]>("/api/categories", { next: { revalidate: 3600 } });
}

export function getRegions(): Promise<RegionDto[]> {
  return apiFetch<RegionDto[]>("/api/orders/regions", { next: { revalidate: 3600 } });
}

export interface CreateOrderResult {
  order: OrderResponseDto;
  status: 200 | 201;
  replayed: boolean;
}

export async function createOrder(order: CreateOrderRequest, idempotencyKey: string): Promise<CreateOrderResult> {
  const response = await apiRequest("/api/orders", {
    method: "POST",
    body: JSON.stringify(order),
    cache: "no-store",
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return {
    order: await response.json() as OrderResponseDto,
    status: response.status === 200 ? 200 : 201,
    replayed: response.headers.get("Idempotency-Replayed") === "true",
  };
}
