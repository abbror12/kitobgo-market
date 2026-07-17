"use client";

import { Heart, Minus, Plus, ShoppingBag, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Book } from "@/types/book";

export function ProductActions({ book }: { book: Book }) {
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("kitobgo-favorites") ?? "[]") as Book[];
    setFavorite(saved.some((item) => item.id === book.id));
  }, [book.id]);

  function addToCart() {
    const current = JSON.parse(localStorage.getItem("kitobgo-cart") ?? "[]") as Array<{ book: Book; quantity: number }>;
    const existing = current.find((item) => item.book.id === book.id);
    const next = existing
      ? current.map((item) => item.book.id === book.id ? { ...item, book, quantity: item.quantity + quantity } : item)
      : [...current, { book, quantity }];
    localStorage.setItem("kitobgo-cart", JSON.stringify(next));
    window.dispatchEvent(new Event("kitobgo-cart-updated"));
    setAdded(true);
  }

  function toggleFavorite() {
    const saved = JSON.parse(localStorage.getItem("kitobgo-favorites") ?? "[]") as Book[];
    const nextFavorite = !saved.some((item) => item.id === book.id);
    localStorage.setItem("kitobgo-favorites", JSON.stringify(nextFavorite ? [...saved, book] : saved.filter((item) => item.id !== book.id)));
    window.dispatchEvent(new Event("kitobgo-favorites-updated"));
    setFavorite(nextFavorite);
  }

  return (
    <div className="mt-6">
      <div className="flex gap-3">
        <div className="flex h-12 shrink-0 items-center rounded-xl border border-line bg-white p-1" aria-label="Miqdor">
          <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid size-9 place-items-center rounded-lg transition hover:bg-canvas" aria-label="Kamaytirish"><Minus size={16} /></button>
          <span className="w-8 text-center text-sm font-bold">{quantity}</span>
          <button type="button" onClick={() => setQuantity((value) => value + 1)} className="grid size-9 place-items-center rounded-lg transition hover:bg-canvas" aria-label="Ko‘paytirish"><Plus size={16} /></button>
        </div>
        {book.inStock ? <Link href={`/checkout?book=${book.slug}&quantity=${quantity}`} className="button-primary h-12 flex-1 px-5"><ShoppingBag size={19} /> Hoziroq xarid qilish</Link> : <button type="button" disabled className="h-12 flex-1 rounded-xl bg-black/10 px-5 font-bold text-muted">Hozircha mavjud emas</button>}
      </div>
      <div className="mt-3 flex gap-3">
        <button type="button" onClick={addToCart} disabled={!book.inStock} className="button-secondary inline-flex h-11 flex-1 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-50">
          <ShoppingCart size={17} /> Savatchaga qo‘shish
        </button>
        <button type="button" onClick={toggleFavorite} className={`grid size-12 place-items-center rounded-xl border transition ${favorite ? "border-brand bg-brand/10 text-brand" : "border-line bg-white text-ink hover:border-brand hover:text-brand"}`} aria-label={favorite ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo‘shish"}>
          <Heart size={20} className={favorite ? "fill-brand" : ""} />
        </button>
      </div>
      {added && <p className="mt-2 text-sm font-medium text-brand" role="status">{quantity} ta kitob savatchaga qo‘shildi.</p>}
    </div>
  );
}
