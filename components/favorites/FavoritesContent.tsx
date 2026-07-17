"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookCard } from "@/components/product/BookCard";
import type { Book } from "@/types/book";

export function FavoritesContent() {
  const [books, setBooks] = useState<Book[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const update = () => setBooks(JSON.parse(localStorage.getItem("kitobgo-favorites") ?? "[]") as Book[]);
    update();
    setReady(true);
    window.addEventListener("kitobgo-favorites-updated", update);
    return () => window.removeEventListener("kitobgo-favorites-updated", update);
  }, []);

  if (!ready) return <div className="h-80 animate-pulse rounded-2xl bg-black/5" />;
  if (!books.length) return <div className="rounded-3xl border border-line bg-white px-6 py-20 text-center"><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand/10 text-brand"><Heart size={28} /></span><h2 className="mt-5 text-2xl font-extrabold">Sevimlilar ro‘yxati bo‘sh</h2><p className="mt-2 text-muted">Yoqtirgan kitoblaringizni yurakcha orqali saqlang.</p><Link href="/catalog" className="button-primary mt-6 h-12 px-6">Katalogga o‘tish</Link></div>;

  return <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{books.map((book) => <BookCard key={book.id} book={book} />)}</div>;
}
