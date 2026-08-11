"use client";

import { Check, ShoppingBag, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { addToCart as addBookToCart } from "@/lib/client-store";
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
    addBookToCart(book, 1);
    setAdded(true);

    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setAdded(false), 1600);
  }

  if (!book.inStock) {
    return (
      <div className="relative z-20 mt-2 flex gap-1.5 sm:mt-3 sm:gap-2">
        <span className="flex h-9 flex-1 items-center justify-center rounded-xl bg-sand/70 px-2 text-center text-[10px] font-bold text-bodyText sm:h-10 sm:text-xs">
          Hozircha mavjud emas
        </span>
        <button
          type="button"
          disabled
          className="grid size-9 shrink-0 cursor-not-allowed place-items-center rounded-xl border border-line bg-navSurface text-bodyText opacity-60 sm:size-10"
          aria-label={`${book.title} hozircha savatchaga qo‘shib bo‘lmaydi`}
        >
          <ShoppingCart size={18} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative z-20 mt-2 flex gap-1.5 sm:mt-3 sm:gap-2">
      <Link
        href={`/checkout?book=${book.slug}&quantity=1`}
        className="button-primary h-9 min-w-0 flex-1 px-2 text-[10px] sm:h-10 sm:text-xs"
        aria-label={`${book.title} kitobini hoziroq xarid qilish`}
      >
        <ShoppingBag size={16} className="hidden shrink-0 sm:block" aria-hidden="true" />
        <span className="sm:hidden">Xarid qilish</span>
        <span className="hidden sm:inline">Hoziroq olish</span>
      </Link>
      <button
        type="button"
        onClick={addToCart}
        className={`grid size-9 shrink-0 place-items-center rounded-xl transition active:scale-95 sm:size-10 ${
          added
            ? "bg-success text-cream"
            : "bg-cocoa text-cream shadow-[0_7px_16px_rgba(163,74,36,.22)] hover:bg-cocoaDark"
        }`}
        aria-label={added ? `${book.title} savatchaga qo‘shildi` : `${book.title} kitobini savatchaga qo‘shish`}
        aria-live="polite"
      >
        {added ? <Check size={19} strokeWidth={2.5} aria-hidden="true" /> : <ShoppingCart size={18} aria-hidden="true" />}
      </button>
    </div>
  );
}
