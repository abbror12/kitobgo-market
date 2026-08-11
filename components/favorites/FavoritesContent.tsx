"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookCard } from "@/components/product/BookCard";
import { FAVORITES_EVENT, readFavorites } from "@/lib/client-store";
import type { Book } from "@/types/book";

export function FavoritesContent() {
  const [books, setBooks] = useState<Book[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const update = () => setBooks(readFavorites());
    update();
    setReady(true);
    window.addEventListener(FAVORITES_EVENT, update);
    return () => window.removeEventListener(FAVORITES_EVENT, update);
  }, []);

  if (!ready) return <div className="h-52 animate-pulse rounded-2xl bg-sand/60 sm:h-80" />;
  if (!books.length) return <div className="rounded-2xl border border-line bg-cream px-5 py-10 text-center sm:rounded-3xl sm:px-6 sm:py-20"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-sand text-cocoa sm:size-16"><Heart size={25} /></span><h2 className="font-serif mt-4 text-xl font-semibold sm:mt-5 sm:text-2xl">Sevimlilar ro‘yxati bo‘sh</h2><p className="mt-1.5 text-sm text-bodyText sm:mt-2 sm:text-base">Yoqtirgan kitoblaringizni yurakcha orqali saqlang.</p><Link href="/catalog" className="button-primary mt-5 h-11 px-5 text-sm sm:mt-6 sm:h-12 sm:px-6 sm:text-base">Katalogga o‘tish</Link></div>;

  return <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{books.map((book) => <BookCard key={book.id} book={book} />)}</div>;
}
