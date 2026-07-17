"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import type { Book } from "@/types/book";

export function FavoriteButton({ book }: { book: Book }) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("kitobgo-favorites") ?? "[]") as Book[];
    setFavorite(saved.some((item) => item.id === book.id));
  }, [book.id]);

  function toggle() {
    const saved = JSON.parse(localStorage.getItem("kitobgo-favorites") ?? "[]") as Book[];
    const nextFavorite = !saved.some((item) => item.id === book.id);
    const next = nextFavorite ? [...saved, book] : saved.filter((item) => item.id !== book.id);
    localStorage.setItem("kitobgo-favorites", JSON.stringify(next));
    window.dispatchEvent(new Event("kitobgo-favorites-updated"));
    setFavorite(nextFavorite);
  }

  return (
    <button type="button" onClick={toggle} className={`absolute right-2.5 top-2.5 z-20 grid size-9 place-items-center rounded-full border bg-white/95 shadow-sm transition ${favorite ? "border-brand text-brand" : "border-line text-ink hover:border-brand hover:text-brand"}`} aria-label={favorite ? `${book.title} kitobini sevimlilardan olib tashlash` : `${book.title} kitobini sevimlilarga qo‘shish`}>
      <Heart size={17} className={favorite ? "fill-brand" : ""} aria-hidden="true" />
    </button>
  );
}
