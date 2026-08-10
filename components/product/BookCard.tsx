import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Book } from "@/types/book";
import { formatPrice, isExternalImage } from "@/lib/format";
import { BookCardActions } from "./BookCardActions";
import { FavoriteButton } from "./FavoriteButton";

export function BookCard({ book }: { book: Book }) {
  const style = { "--book-bg": book.color } as CSSProperties;

  return (
    <article className="book-card group" style={style}>
      <div className="relative aspect-[4/4.7] overflow-hidden rounded-xl bg-[var(--book-bg)]">
        {book.badge && <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-brand-gold px-2.5 py-1 text-[10px] font-bold text-ink">{book.badge}</span>}
        <FavoriteButton book={book} />
        <Image
          src={book.image}
          alt={`${book.title} kitobi muqovasi`}
          fill
          unoptimized={isExternalImage(book.image)}
          sizes="(max-width: 640px) 44vw, (max-width: 1024px) 30vw, 190px"
          className="object-cover transition duration-500 group-hover:scale-[1.035]"
        />
      </div>
      <div className="flex flex-1 flex-col pt-2 sm:pt-3">
        <h3 className="line-clamp-2 text-[14px] font-bold leading-[18px] text-ink sm:text-base sm:leading-5">{book.title}</h3>
        <p className="mt-1 hidden line-clamp-2 min-h-9 text-[12px] leading-[18px] text-muted sm:block sm:text-[13px]">{book.description}</p>
        <p className="mt-1.5 text-[15px] font-extrabold text-brand sm:mt-2 sm:text-[17px]">{formatPrice(book.price)}</p>
        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted sm:mt-2 sm:text-[11px]">
          <Star size={14} className={book.rating ? "fill-amber-400 text-amber-400" : "text-line"} aria-hidden="true" />
          <span className="font-semibold text-ink">{book.rating || "Yangi"}</span>
          {book.reviews > 0 && <span>({book.reviews} sharh)</span>}
        </div>
      </div>
      <BookCardActions book={book} />
      <Link href={`/books/${book.slug}`} className="absolute inset-0 z-10 rounded-2xl" aria-label={`${book.title} mahsulot sahifasiga o‘tish`} />
    </article>
  );
}
