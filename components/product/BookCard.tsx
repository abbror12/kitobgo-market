import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { AUTHOR_UNKNOWN, type Book } from "@/types/book";
import { formatPrice, isExternalImage } from "@/lib/format";
import { BookCardActions } from "./BookCardActions";
import { FavoriteButton } from "./FavoriteButton";

export function BookCard({ book }: { book: Book }) {
  const style = { "--book-bg": book.color } as CSSProperties;
  // "Chegirma" badge matni backenddan (dto.discounted), foiz esa shu yerda eski
  // narxdan hisoblanadi — ikkalasi mustaqil, oldPrice bo'lmasa foiz chiqmaydi.
  const discount = book.oldPrice && book.oldPrice > book.price ? Math.round((1 - book.price / book.oldPrice) * 100) : 0;

  return (
    <article className="book-card group" style={style}>
      <div className="relative aspect-[4/4.7] overflow-hidden rounded-xl border border-line/70 bg-[var(--book-bg)]">
        {book.badge && <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold text-ink">{book.badge}</span>}
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
        {/* Kitob nomi va narx — serif (ilovadagi KitobText.bookTitle / price). */}
        <h3 className="line-clamp-2 font-serif text-[14px] font-semibold leading-[18px] text-ink sm:text-base sm:leading-5">{book.title}</h3>
        {book.author && book.author !== AUTHOR_UNKNOWN && (
          <p className="mt-0.5 line-clamp-1 text-[11px] text-bodyText sm:mt-1 sm:text-[12px]">{book.author}</p>
        )}
        <div className="mt-1 flex items-center gap-1 text-[10px] text-bodyText sm:mt-1.5 sm:text-[11px]">
          <Star size={13} className={book.rating ? "fill-gold text-gold" : "text-chevron"} aria-hidden="true" />
          <span className="font-semibold text-ink">{book.rating || "Yangi"}</span>
          {book.reviews > 0 && <span>({book.reviews} sharh)</span>}
        </div>
        {/* Narx pastga taqaladi (mt-auto) — grid'dagi kartochkalar teng bo'yda,
            narx qatorlari bir chiziqda turadi. Kartochkada narx ink: zich to'rda
            ko'k faqat CTA'da qolsin (sahifadagi katta narx esa brand'ligicha). */}
        <div className="mt-auto pt-1.5 sm:pt-2">
          {discount > 0 && book.oldPrice && (
            <p className="flex items-center gap-1.5 text-[11px] leading-4 sm:text-[12px]">
              <s className="font-medium text-bodyText">{formatPrice(book.oldPrice)}</s>
              <span className="rounded-md bg-dangerSoft px-1.5 py-px text-[10px] font-bold text-danger">−{discount}%</span>
            </p>
          )}
          <p className="font-serif text-[15px] font-semibold leading-6 text-ink sm:text-[17px]">{formatPrice(book.price)}</p>
        </div>
      </div>
      <BookCardActions book={book} />
      <Link href={`/books/${book.slug}`} className="absolute inset-0 z-10 rounded-2xl" aria-label={`${book.title} mahsulot sahifasiga o‘tish`} />
    </article>
  );
}
