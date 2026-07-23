import { NextRequest, NextResponse } from "next/server";
import { books as fallbackBooks } from "@/data/books";
import { searchProducts } from "@/lib/store-api";
import type { Book } from "@/types/book";

const MAX_RESULTS = 6;

function toSearchResult(book: Book) {
  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    author: book.author,
    categoryName: book.categoryName,
    price: book.price,
    image: book.image,
  };
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim().slice(0, 80) ?? "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const response = await searchProducts({ q: query, page: 0, size: MAX_RESULTS });
    return NextResponse.json(
      { results: response.content.map(toSearchResult) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    const normalizedQuery = query.toLocaleLowerCase("uz");
    const results = fallbackBooks
      .filter((book) => {
        const searchableText = [
          book.title,
          book.author,
          book.categoryName,
          book.description,
        ].filter(Boolean).join(" ").toLocaleLowerCase("uz");

        return searchableText.includes(normalizedQuery);
      })
      .slice(0, MAX_RESULTS)
      .map(toSearchResult);

    return NextResponse.json(
      { results },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
