"use client";

import { Heart, Minus, Plus, ShoppingBag, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { addToCart as addBookToCart, readFavorites, writeFavorites } from "@/lib/client-store";
import type { Book } from "@/types/book";

export function ProductActions({ book }: { book: Book }) {
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);
  // availableQuantity — buyurtma berish mumkin bo'lgan qoldiq (API.md §3.1, snapshot).
  const maxQuantity = Math.min(book.availableQuantity ?? 50, 50);

  useEffect(() => {
    setFavorite(readFavorites().some((item) => item.id === book.id));
  }, [book.id]);

  function addToCart() {
    addBookToCart(book, quantity);
    setAdded(true);
  }

  function toggleFavorite() {
    const saved = readFavorites();
    const nextFavorite = !saved.some((item) => item.id === book.id);
    writeFavorites(nextFavorite ? [...saved, book] : saved.filter((item) => item.id !== book.id));
    setFavorite(nextFavorite);
  }

  return (
    <div className="mt-4 sm:mt-6">
      <div className="flex gap-2 sm:gap-3">
        <div className="flex h-11 shrink-0 items-center rounded-xl border border-line bg-cream p-0.5 sm:h-12 sm:p-1" aria-label="Miqdor">
          <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid size-9 place-items-center rounded-lg transition hover:bg-sand" aria-label="Kamaytirish"><Minus size={16} /></button>
          <span className="w-8 text-center text-sm font-bold">{quantity}</span>
          <button type="button" onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))} className="grid size-9 place-items-center rounded-lg transition hover:bg-sand" aria-label="Ko‘paytirish"><Plus size={16} /></button>
        </div>
        {book.inStock ? <Link href={`/checkout?book=${book.slug}&quantity=${quantity}`} className="button-primary h-11 flex-1 px-3 text-sm sm:h-12 sm:px-5 sm:text-base"><ShoppingBag size={18} /> Hoziroq xarid qilish</Link> : <button type="button" disabled className="h-11 flex-1 rounded-xl bg-sand px-3 text-sm font-bold text-bodyText sm:h-12 sm:px-5">Hozircha mavjud emas</button>}
      </div>
      <div className="mt-3 flex gap-3">
        <button type="button" onClick={addToCart} disabled={!book.inStock} className="button-secondary inline-flex h-11 flex-1 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-50">
          <ShoppingCart size={17} /> Savatchaga qo‘shish
        </button>
        <button type="button" onClick={toggleFavorite} className={`grid size-12 place-items-center rounded-xl border transition ${favorite ? "border-brand bg-sand text-brand" : "border-line bg-cream text-ink hover:border-brand hover:text-brand"}`} aria-label={favorite ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo‘shish"}>
          <Heart size={20} className={favorite ? "fill-brand" : ""} />
        </button>
      </div>
      {added && <p className="mt-2 text-sm font-medium text-brand" role="status">{quantity} ta kitob savatchaga qo‘shildi.</p>}
    </div>
  );
}
