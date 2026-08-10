// Brauzerdagi lokal savat va sevimlilar. Faqat client komponentlarda chaqiriladi.
// Kalitlar v2: eski backend id'lari yangi katalog bilan mos kelmaydi, shuning uchun
// eski yozuvlar ataylab o'qilmaydi.
import type { Book } from "@/types/book";

export const CART_KEY = "kitobgo:cart:v2";
export const FAVORITES_KEY = "kitobgo:favorites:v2";
export const CART_EVENT = "kitobgo-cart-updated";
export const FAVORITES_EVENT = "kitobgo-favorites-updated";

export interface CartItem {
  book: Book;
  quantity: number;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function readCart(): CartItem[] {
  return readJson<CartItem[]>(CART_KEY, []);
}

export function writeCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function clearCart(): void {
  writeCart([]);
}

export function addToCart(book: Book, quantity: number): void {
  const current = readCart();
  const existing = current.find((item) => item.book.id === book.id);
  const next = existing
    ? current.map((item) => (item.book.id === book.id ? { ...item, book, quantity: item.quantity + quantity } : item))
    : [...current, { book, quantity }];
  writeCart(next);
}

export function readFavorites(): Book[] {
  return readJson<Book[]>(FAVORITES_KEY, []);
}

export function writeFavorites(books: Book[]): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(books));
  window.dispatchEvent(new Event(FAVORITES_EVENT));
}
