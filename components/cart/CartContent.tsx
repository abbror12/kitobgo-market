"use client";

import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatPrice, isExternalImage } from "@/lib/format";
import { readCart, writeCart, type CartItem } from "@/lib/client-store";

export function CartContent() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.book.price * item.quantity, 0), [items]);
  // Checkout sahifasi kitoblarni slug bo'yicha qayta yuklaydi (GET /books/{slug}).
  const checkoutItems = items.map((item) => `${encodeURIComponent(item.book.slug)}:${item.quantity}`).join(",");

  useEffect(() => {
    setItems(readCart());
    setReady(true);
  }, []);

  function save(next: CartItem[]) {
    setItems(next);
    writeCart(next);
  }

  const updateQuantity = (id: string, change: number) => save(items.map((item) => {
    if (item.book.id !== id) return item;
    const max = Math.min(item.book.availableQuantity ?? 50, 50);
    return { ...item, quantity: Math.min(max, Math.max(1, item.quantity + change)) };
  }));

  if (!ready) return <div className="h-52 animate-pulse rounded-2xl bg-black/5 sm:h-80 sm:rounded-3xl" />;
  if (!items.length) return <div className="rounded-2xl border border-line bg-white px-5 py-10 text-center sm:rounded-3xl sm:px-6 sm:py-20"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand sm:size-16"><ShoppingBag size={25} /></span><h2 className="mt-4 text-xl font-extrabold sm:mt-5 sm:text-2xl">Savatchangiz bo‘sh</h2><p className="mt-1.5 text-sm text-muted sm:mt-2 sm:text-base">O‘zingizga yoqqan kitoblarni katalogdan tanlang.</p><Link href="/catalog" className="button-primary mt-5 h-11 px-5 text-sm sm:mt-6 sm:h-12 sm:px-6 sm:text-base">Katalogga o‘tish</Link></div>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] xl:gap-8">
      <div className="space-y-3">
        {items.map(({ book, quantity }) => (
          <article key={book.id} className="flex gap-4 rounded-2xl border border-line bg-white p-3 sm:items-center sm:p-4">
            <Link href={`/books/${book.slug}`} className="relative aspect-[4/4.7] w-24 shrink-0 overflow-hidden rounded-xl sm:w-32" style={{ backgroundColor: book.color }}><Image src={book.image} alt={book.title} fill unoptimized={isExternalImage(book.image)} sizes="128px" className="object-cover" /></Link>
            <div className="min-w-0 flex-1 self-stretch py-1"><Link href={`/books/${book.slug}`} className="font-extrabold leading-5 hover:text-brand sm:text-lg">{book.title}</Link><p className="mt-1 line-clamp-1 text-xs text-muted sm:text-sm">{book.author}</p><p className="mt-3 font-extrabold text-brand sm:text-lg">{formatPrice(book.price)}</p><div className="mt-3 flex items-center justify-between sm:hidden"><Quantity value={quantity} onMinus={() => updateQuantity(book.id, -1)} onPlus={() => updateQuantity(book.id, 1)} /><button onClick={() => save(items.filter((item) => item.book.id !== book.id))} className="icon-button text-muted hover:text-red-600" aria-label="Olib tashlash"><Trash2 size={18} /></button></div></div>
            <div className="hidden items-center gap-4 sm:flex"><Quantity value={quantity} onMinus={() => updateQuantity(book.id, -1)} onPlus={() => updateQuantity(book.id, 1)} /><div className="w-28 text-right font-extrabold">{formatPrice(book.price * quantity)}</div><button onClick={() => save(items.filter((item) => item.book.id !== book.id))} className="icon-button text-muted hover:text-red-600" aria-label="Olib tashlash"><Trash2 size={18} /></button></div>
          </article>
        ))}
        <Link href="/catalog" className="inline-flex items-center gap-2 py-3 text-sm font-bold text-brand">+ Yana kitob qo‘shish</Link>
      </div>
      <aside className="h-fit rounded-2xl border border-line bg-white p-5 shadow-soft lg:sticky lg:top-40 sm:p-6">
        <h2 className="text-xl font-extrabold">Buyurtma hisoboti</h2>
        <dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><dt className="text-muted">Mahsulotlar ({items.reduce((sum, item) => sum + item.quantity, 0)} ta)</dt><dd className="font-semibold">{formatPrice(subtotal)}</dd></div><div className="flex justify-between"><dt className="text-muted">Yetkazib berish</dt><dd className="font-bold text-brand">Bepul</dd></div></dl>
        <div className="mt-5 flex items-end justify-between border-t border-line pt-5"><span className="font-bold">Jami</span><strong className="text-2xl text-brand">{formatPrice(subtotal)}</strong></div>
        <Link href={`/checkout?items=${checkoutItems}`} className="button-primary mt-6 h-12 w-full px-5">Buyurtma berish</Link>
        <div className="mt-5 space-y-3 text-xs text-muted"><p className="flex gap-2"><Truck size={16} className="shrink-0 text-brand" /> O‘zbekiston bo‘ylab bepul yetkaziladi</p><p className="flex gap-2"><ShieldCheck size={16} className="shrink-0 text-brand" /> To‘lov mahsulotni olgandan keyin</p></div>
      </aside>
    </div>
  );
}

function Quantity({ value, onMinus, onPlus }: { value: number; onMinus: () => void; onPlus: () => void }) {
  return <div className="flex h-10 items-center rounded-xl border border-line p-0.5"><button onClick={onMinus} className="grid size-8 place-items-center rounded-lg hover:bg-canvas" aria-label="Kamaytirish"><Minus size={15} /></button><span className="w-8 text-center text-sm font-bold">{value}</span><button onClick={onPlus} className="grid size-8 place-items-center rounded-lg hover:bg-canvas" aria-label="Ko‘paytirish"><Plus size={15} /></button></div>;
}
