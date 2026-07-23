"use client";

import { Check, ShoppingBag, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Book } from "@/types/book";

export function BookCardActions({ book }: { book: Book }) {
  const [added, setAdded] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  function addToCart() {
    const current = JSON.parse(localStorage.getItem("kitobgo-cart") ?? "[]") as Array<{ book: Book; quantity: number }>;
    const existing = current.find((item) => item.book.id === book.id);
    const next = existing
      ? current.map((item) => item.book.id === book.id ? { ...item, book, quantity: item.quantity + 1 } : item)
      : [...current, { book, quantity: 1 }];

    localStorage.setItem("kitobgo-cart", JSON.stringify(next));
    window.dispatchEvent(new Event("kitobgo-cart-updated"));
    setAdded(true);

    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setAdded(false), 1600);
  }

  if (!book.inStock) {
    return (
      <div className="relative z-20 mt-3 flex gap-2">
        <span className="flex h-10 flex-1 items-center justify-center rounded-xl bg-black/[0.06] px-2 text-center text-[11px] font-bold text-muted sm:text-xs">
          Hozircha mavjud emas
        </span>
        <button
          type="button"
          disabled
          className="grid size-10 shrink-0 cursor-not-allowed place-items-center rounded-xl border border-line bg-canvas text-muted opacity-60"
          aria-label={`${book.title} hozircha savatchaga qo‘shib bo‘lmaydi`}
        >
          <ShoppingCart size={18} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative z-20 mt-3 flex gap-2">
      <Link
        href={`/checkout?book=${book.slug}&quantity=1`}
        className="button-primary h-10 min-w-0 flex-1 px-2 text-[11px] sm:text-xs"
        aria-label={`${book.title} kitobini hoziroq xarid qilish`}
      >
        <ShoppingBag size={16} className="hidden shrink-0 sm:block" aria-hidden="true" />
        <span className="sm:hidden">Xarid qilish</span>
        <span className="hidden sm:inline">Hoziroq olish</span>
      </Link>
      <button
        type="button"
        onClick={addToCart}
        className={`grid size-10 shrink-0 place-items-center rounded-xl transition active:scale-95 ${
          added
            ? "bg-brand text-white"
            : "bg-brand-gold text-ink shadow-[0_7px_16px_rgba(199,168,74,.22)] hover:bg-[#b99a3f]"
        }`}
        aria-label={added ? `${book.title} savatchaga qo‘shildi` : `${book.title} kitobini savatchaga qo‘shish`}
        aria-live="polite"
      >
        {added ? <Check size={19} strokeWidth={2.5} aria-hidden="true" /> : <ShoppingCart size={18} aria-hidden="true" />}
      </button>
    </div>
  );
}
