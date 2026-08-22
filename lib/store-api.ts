// KitobGo backend (/api/v1) bilan server tomondan ishlaydigan ochiq (tokensiz) klient.
// Shartnoma: D:\Project\kitob-app-backend\docs\API.md
// Bu modul faqat server komponentlar va route handler'larda chaqiriladi —
// brauzerdan to'g'ridan-to'g'ri api.kitobgo.com ga murojaat qilinmaydi.
import { AUTHOR_UNKNOWN, type Book } from "@/types/book";

export const API_ORIGIN = (process.env.KITOBGO_API_URL ?? "https://api.kitobgo.com").replace(/\/$/, "");
export const API_BASE_URL = `${API_ORIGIN}/api/v1`;

// ---------- Shartnoma tiplari (API.md §1–§3) ----------

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export type BookLanguage = "UZ" | "UZ_CYRL" | "RU" | "EN" | "OTHER";
export type CoverType = "HARDCOVER" | "PAPERBACK";

export interface BookSummaryDto {
  id: number;
  slug: string;
  title: string;
  authors: string[];
  categoryName?: string;
  price: number;
  oldPrice?: number;
  discounted: boolean;
  coverUrl?: string;
  ratingAvg?: number;
  ratingCount?: number;
  inStock: boolean;
}

export interface BookImageDto {
  id: number;
  url: string;
  sortOrder: number;
  primary: boolean;
}

export interface BookDetailDto {
  id: number;
  slug: string;
  title: string;
  description?: string;
  isbn13?: string;
  authors: Array<{ id: number; fullName: string; slug: string; bio?: string; photoUrl?: string }>;
  category?: { id: number; parentId?: number; name: string; slug: string; sortOrder: number; active: boolean };
  publisher?: { id: number; name: string; slug: string };
  language?: BookLanguage;
  coverType?: CoverType;
  pageCount?: number;
  publicationYear?: number;
  weightGrams?: number;
  price: number;
  oldPrice?: number;
  discounted: boolean;
  currency: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  images?: BookImageDto[];
  ratingAvg?: number;
  ratingCount?: number;
  availableQuantity?: number;
  inStock: boolean;
}

export interface CategoryTreeDto {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  children?: CategoryTreeDto[];
}

export interface RegionDto {
  id: number;
  code: string;
  nameUz: string;
  nameRu: string;
  sortOrder: number;
}

export type DeliveryMethod = "COURIER" | "PICKUP";

export interface DeliveryQuoteDto {
  method: DeliveryMethod;
  fee: number;
  minDays: number;
  maxDays: number;
  free: boolean;
  amountUntilFree?: number;
}

export interface BannerDto {
  id: number;
  imageUrl: string;
  title?: string;
  targetType: "BOOK" | "CATEGORY" | "URL" | "NONE";
  targetValue?: string;
  sortOrder: number;
}

// ---------- Customer qamrovidagi tiplar (API.md §5–§7) ----------

export interface ProfileDto {
  id: number;
  phone?: string;
  email?: string;
  // Ko'rsatish uchun HAR DOIM fullName (u to'liq ism, qismlar ma'lum bo'lsa ham, bo'lmasa ham).
  // firstName/lastName faqat forma kataklari uchun; ism ikkiga bo'linishidan oldin
  // yaratilgan hisoblarda ular YO'Q — mijoz tomonida fullName'ni bo'lib olishga urinmang
  // (API.md §5, "The name is two fields now").
  fullName?: string;
  firstName?: string;
  lastName?: string;
  status: "PENDING_VERIFICATION" | "ACTIVE" | "BLOCKED";
  emailVerified: boolean;
  phoneVerified: boolean;
  roles: string[];
  createdAt: string;
}

// API.md §5: GET /account/addresses — saqlangan yetkazish manzili, asosiysi ro'yxatda birinchi.
export interface AddressDto {
  id: number;
  regionId: number;
  regionName: string;
  district?: string;
  addressLine?: string;
  landmark?: string;
  recipientName: string;
  recipientPhone: string;
  isDefault: boolean;
}

export interface CartLineDto {
  bookId: number;
  slug: string;
  title: string;
  coverUrl?: string;
  quantity: number;
  unitPrice: number;
  currentPrice: number;
  lineTotal: number;
  priceChanged: boolean;
  availableQuantity: number;
  available: boolean;
  purchasable: boolean;
}

export interface CartDto {
  items: CartLineDto[];
  totalQuantity: number;
  itemsTotal: number;
  currency: string;
  hasPriceChanges: boolean;
  hasStockIssues: boolean;
}

export type OrderStatus =
  | "PENDING_PAYMENT" | "PAID" | "PROCESSING" | "SHIPPED"
  | "DELIVERED" | "CANCELLED" | "REFUNDED";

export interface OrderItemDto {
  bookId: number;
  slug: string;
  title: string;
  coverUrl?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDestinationDto {
  regionId: number;
  regionName: string;
  district?: string;
  addressLine?: string;
  landmark?: string;
  recipientName: string;
  recipientPhone: string;
}

export interface OrderSummaryDto {
  orderNumber: string;
  status: OrderStatus;
  itemCount: number;
  grandTotal: number;
  currency: string;
  deliveryMethod: DeliveryMethod;
  placedAt: string;
}

export interface OrderDetailDto {
  orderNumber: string;
  status: OrderStatus;
  items: OrderItemDto[];
  itemsTotal: number;
  deliveryFee: number;
  discountTotal: number;
  grandTotal: number;
  currency: string;
  deliveryMethod: DeliveryMethod;
  cashOnDelivery: boolean;
  destination?: OrderDestinationDto;
  customerNote?: string;
  placedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  cancellable: boolean;
  history?: Array<{ fromStatus?: OrderStatus; toStatus: OrderStatus; reason?: string; at: string }>;
}

export type PaymentProvider = "CLICK" | "PAYME";

export interface PaymentInitiationDto {
  paymentId: number;
  provider: PaymentProvider;
  orderNumber: string;
  amount: number;
  currency: string;
  checkoutUrl: string;
}

// ---------- Xato modeli (API.md §1 Errors — RFC 9457) ----------

export interface ApiProblem {
  status: number;
  code: string;
  detail?: string;
  title?: string;
  errors?: Array<{ field: string; message: string }>;
  [extra: string]: unknown;
}

export class ApiError extends Error {
  readonly problem: ApiProblem;
  constructor(problem: ApiProblem) {
    super(problem.detail ?? problem.code);
    this.name = "ApiError";
    this.problem = problem;
  }
  get status() { return this.problem.status; }
  get code() { return this.problem.code; }
}

export async function readProblem(response: Response): Promise<ApiProblem> {
  const body = await response.json().catch(() => null) as Record<string, unknown> | null;
  if (body && typeof body.code === "string") {
    return { ...body, code: body.code, status: response.status } as ApiProblem;
  }
  return {
    status: response.status,
    code: response.status >= 500 ? "INTERNAL_ERROR" : "MALFORMED_REQUEST",
    detail: typeof body?.detail === "string" ? body.detail : "Server bilan bog‘lanishda xatolik yuz berdi",
  };
}

async function kgPublicFetch<T>(path: string, init?: RequestInit & { next?: { revalidate?: number } }): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Accept-Language": "uz",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) throw new ApiError(await readProblem(response));
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

// ---------- DTO → Book moslash ----------

// Muqova ortidagi pastel fonlar — iliq palitradan (sand #EAF0F9 atrofida).
// Kitobning o'z rasmi yuklanmaguncha ko'rinadi; palitra sovuq bo'lgani uchun ular ham sovuq.
const colors = ["#E8EEFA", "#EDF2F9", "#E6EEF9", "#EBF1FA", "#F1F5FB", "#EAF0F9"];
const FALLBACK_COVER = "/images/quran-premium.png";

const LANGUAGE_LABELS: Record<BookLanguage, string> = {
  UZ: "O‘zbek",
  UZ_CYRL: "O‘zbek (kirill)",
  RU: "Rus",
  EN: "Ingliz",
  OTHER: "Boshqa",
};

const COVER_LABELS: Record<CoverType, string> = {
  HARDCOVER: "Qattiq muqova",
  PAPERBACK: "Yumshoq muqova",
};

function pickColor(id: number, title: string): string {
  return colors[Math.abs(id || title.length) % colors.length];
}

export function summaryToBook(dto: BookSummaryDto): Book {
  return {
    id: String(dto.id),
    slug: dto.slug,
    title: dto.title,
    description: "",
    price: dto.price,
    oldPrice: dto.oldPrice,
    rating: dto.ratingAvg ?? 0,
    reviews: dto.ratingCount ?? 0,
    image: dto.coverUrl ?? FALLBACK_COVER,
    images: dto.coverUrl ? [dto.coverUrl] : [FALLBACK_COVER],
    badge: dto.discounted ? "Chegirma" : undefined,
    color: pickColor(dto.id, dto.title),
    category: "",
    categoryName: dto.categoryName,
    author: dto.authors.join(", ") || AUTHOR_UNKNOWN,
    publisher: "",
    publishedYear: 0,
    pages: 0,
    language: "",
    cover: "",
    isbn: "",
    inStock: dto.inStock,
  };
}

export function detailToBook(dto: BookDetailDto): Book {
  const sortedImages = [...(dto.images ?? [])]
    .sort((a, b) => Number(b.primary) - Number(a.primary) || a.sortOrder - b.sortOrder)
    .map((image) => image.url);
  return {
    id: String(dto.id),
    slug: dto.slug,
    title: dto.title,
    description: dto.description?.trim() || "Kitob haqida ma’lumot kiritilmagan",
    price: dto.price,
    oldPrice: dto.oldPrice,
    rating: dto.ratingAvg ?? 0,
    reviews: dto.ratingCount ?? 0,
    image: sortedImages[0] ?? FALLBACK_COVER,
    images: sortedImages.length ? sortedImages : [FALLBACK_COVER],
    badge: dto.discounted ? "Chegirma" : undefined,
    color: pickColor(dto.id, dto.title),
    category: dto.category ? String(dto.category.id) : "",
    categoryName: dto.category?.name,
    categories: dto.category ? [{ id: String(dto.category.id), name: dto.category.name }] : [],
    author: dto.authors.map((author) => author.fullName).join(", ") || AUTHOR_UNKNOWN,
    publisher: dto.publisher?.name ?? "Nashriyot ma’lumoti kiritilmagan",
    publishedYear: dto.publicationYear ?? 0,
    pages: dto.pageCount ?? 0,
    language: dto.language ? LANGUAGE_LABELS[dto.language] : "Til ma’lumoti kiritilmagan",
    cover: dto.coverType ? COVER_LABELS[dto.coverType] : "Muqova ma’lumoti kiritilmagan",
    isbn: dto.isbn13 ?? "—",
    inStock: dto.inStock,
    availableQuantity: dto.availableQuantity,
  };
}

// ---------- Ochiq katalog (API.md §3) ----------

// API.md §3.1: faqat shu maydonlar sortlanadi; qolgani jimgina tashlab yuboriladi.
const SORTABLE_FIELDS = new Set(["price", "title", "createdAt", "ratingAvg", "ratingCount", "publicationYear"]);

export function isSortAllowed(sort: string): boolean {
  return SORTABLE_FIELDS.has(sort.split(",")[0] ?? "");
}

export interface BookSearchParams {
  q?: string;
  categoryId?: number;
  includeSubcategories?: boolean;
  authorId?: number;
  publisherId?: number;
  language?: BookLanguage;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  discounted?: boolean;
  sort?: string;
  page?: number;
  size?: number;
}

export async function getBooks(params: BookSearchParams = {}, revalidate = 60): Promise<PageResponse<Book>> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q.slice(0, 200));
  if (params.categoryId !== undefined) query.set("categoryId", String(params.categoryId));
  if (params.includeSubcategories !== undefined) query.set("includeSubcategories", String(params.includeSubcategories));
  if (params.authorId !== undefined) query.set("authorId", String(params.authorId));
  if (params.publisherId !== undefined) query.set("publisherId", String(params.publisherId));
  if (params.language) query.set("language", params.language);
  if (params.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
  if (params.inStock !== undefined) query.set("inStock", String(params.inStock));
  if (params.discounted !== undefined) query.set("discounted", String(params.discounted));
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(Math.min(params.size, 100)));
  if (params.sort && isSortAllowed(params.sort)) query.set("sort", params.sort);
  const suffix = query.toString();
  const result = await kgPublicFetch<PageResponse<BookSummaryDto>>(
    `/books${suffix ? `?${suffix}` : ""}`,
    revalidate ? { next: { revalidate } } : { cache: "no-store" },
  );
  return { ...result, content: result.content.map(summaryToBook) };
}

export async function getBookDetail(slug: string, revalidate = 60): Promise<Book> {
  const dto = await kgPublicFetch<BookDetailDto>(
    `/books/${encodeURIComponent(slug)}`,
    revalidate ? { next: { revalidate } } : { cache: "no-store" },
  );
  return detailToBook(dto);
}

export function getCategoryTree(): Promise<CategoryTreeDto[]> {
  return kgPublicFetch<CategoryTreeDto[]>("/categories/tree", { next: { revalidate: 3600 } });
}

export interface FlatCategory {
  id: number;
  name: string;
  slug: string;
  depth: number;
}

export function flattenCategoryTree(tree: CategoryTreeDto[], depth = 0): FlatCategory[] {
  return tree.flatMap((node) => [
    { id: node.id, name: node.name, slug: node.slug, depth },
    ...flattenCategoryTree(node.children ?? [], depth + 1),
  ]);
}

export function getRegions(): Promise<RegionDto[]> {
  return kgPublicFetch<RegionDto[]>("/regions", { next: { revalidate: 3600 } });
}

// itemsTotal majburiy — bepul yetkazish chegarasi savat summasiga bog'liq (API.md §3.3).
export function getDeliveryOptions(regionId: number, itemsTotal: number): Promise<DeliveryQuoteDto[]> {
  return kgPublicFetch<DeliveryQuoteDto[]>(
    `/regions/${regionId}/delivery-options?itemsTotal=${encodeURIComponent(itemsTotal)}`,
    { cache: "no-store" },
  );
}

export function getBanners(): Promise<BannerDto[]> {
  return kgPublicFetch<BannerDto[]>("/banners", { next: { revalidate: 300 } });
}
