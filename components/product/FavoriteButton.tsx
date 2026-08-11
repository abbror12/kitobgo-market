"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { readFavorites, writeFavorites } from "@/lib/client-store";
import type { Book } from "@/types/book";

export function FavoriteButton({ book }: { book: Book }) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    setFavorite(readFavorites().some((item) => item.id === book.id));
  }, [book.id]);

  function toggle() {
    const saved = readFavorites();
    const nextFavorite = !saved.some((item) => item.id === book.id);
    writeFavorites(nextFavorite ? [...saved, book] : saved.filter((item) => item.id !== book.id));
    setFavorite(nextFavorite);
  }

  return (
    <button type="button" onClick={toggle} className={`absolute right-2.5 top-2.5 z-20 grid size-9 place-items-center rounded-full border bg-cream/95 shadow-sm transition ${favorite ? "border-cocoa text-cocoa" : "border-line text-ink hover:border-cocoa hover:text-cocoa"}`} aria-label={favorite ? `${book.title} kitobini sevimlilardan olib tashlash` : `${book.title} kitobini sevimlilarga qo‘shish`}>
      <Heart size={17} className={favorite ? "fill-cocoa" : ""} aria-hidden="true" />
    </button>
  );
}
