import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Book } from "@/types/book";
import { BookCard } from "./BookCard";

interface ProductSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  books: Book[];
  compact?: boolean;
}

export function ProductSection({ id, title, subtitle, books, compact = false }: ProductSectionProps) {
  return (
    <section id={id} className="section-space">
      <div className="container-page">
        <div className="section-heading">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <Link href="/catalog" className="section-link">Barchasi <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
        {books.length > 0 ? (
          <div className={`mobile-rail product-rail mt-4 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-4 md:grid-cols-3 ${compact ? "lg:grid-cols-4" : "lg:grid-cols-6"}`}>
            {books.map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        ) : <ProductEmptyState />}
      </div>
    </section>
  );
}

export function ProductEmptyState() {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-line bg-cream p-10 text-center text-bodyText" role="status">
      Hozircha bu bo‘limda kitoblar yo‘q.
    </div>
  );
}

export function ProductLoadingState() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6" aria-label="Kitoblar yuklanmoqda" aria-busy="true">
      {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-80 animate-pulse rounded-2xl bg-sand/60" />)}
    </div>
  );
}
