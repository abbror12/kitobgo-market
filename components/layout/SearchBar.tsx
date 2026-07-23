"use client";

import { LoaderCircle, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatPrice, isExternalImage } from "@/lib/format";

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  author: string;
  categoryName?: string;
  price: number;
  image: string;
}

export function SearchBar({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputId = mobile ? "mobile-search" : "desktop-search";
  const listboxId = `${inputId}-results`;
  const trimmedQuery = query.trim();
  const isOpen = isFocused && trimmedQuery.length >= 2;

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setHasSearched(false);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Search request failed");

        const data = await response.json() as { results?: SearchResult[] };
        setResults(data.results ?? []);
        setActiveIndex(-1);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setResults([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setHasSearched(true);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [trimmedQuery]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!searchRef.current?.contains(event.target as Node)) {
        setIsFocused(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsFocused(false);
      setActiveIndex(-1);
      event.currentTarget.blur();
      return;
    }

    if (!isOpen || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? results.length - 1 : current - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      router.push(`/books/${results[activeIndex].slug}`);
      setIsFocused(false);
    }
  }

  return (
    <div ref={searchRef} className="relative w-full">
      <form role="search" action="/catalog">
        <label htmlFor={inputId} className="sr-only">Kitob qidirish</label>
        <input
          id={inputId}
          name="q"
          type="search"
          role="combobox"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Kitob nomi, muallifi yoki kategoriya"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={isOpen ? listboxId : undefined}
          aria-expanded={isOpen}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
          className="h-12 w-full rounded-xl border border-line bg-white pl-4 pr-12 text-[15px] text-ink outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
        />
        <button type="submit" aria-label="Qidirish" className="absolute right-1.5 top-1.5 grid size-9 place-items-center rounded-lg text-ink transition hover:bg-brand/10 hover:text-brand">
          {isLoading
            ? <LoaderCircle size={19} className="animate-spin text-brand" aria-hidden="true" />
            : <Search size={19} aria-hidden="true" />}
        </button>
      </form>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[80] overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div id={listboxId} role="listbox" aria-label="Qidiruv natijalari" className="max-h-[min(420px,65vh)] overflow-y-auto p-2">
            {results.map((result, index) => (
              <Link
                key={result.id}
                id={`${listboxId}-${index}`}
                href={`/books/${result.slug}`}
                role="option"
                aria-selected={activeIndex === index}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => setIsFocused(false)}
                className={`flex items-center gap-3 rounded-xl p-2.5 transition ${activeIndex === index ? "bg-brand/10" : "hover:bg-canvas"}`}
              >
                <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-canvas">
                  <Image
                    src={result.image}
                    alt=""
                    fill
                    unoptimized={isExternalImage(result.image)}
                    sizes="56px"
                    className="object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm text-ink">{result.title}</strong>
                  <span className="mt-0.5 block truncate text-xs text-muted">
                    {result.author}{result.categoryName ? ` · ${result.categoryName}` : ""}
                  </span>
                  <span className="mt-1 block text-sm font-extrabold text-brand">{formatPrice(result.price)}</span>
                </span>
              </Link>
            ))}

            {!isLoading && hasSearched && results.length === 0 && (
              <div className="px-4 py-7 text-center">
                <p className="text-sm font-bold text-ink">Kitob topilmadi</p>
                <p className="mt-1 text-xs text-muted">Boshqa nom yoki muallifni yozib ko‘ring.</p>
              </div>
            )}
          </div>

          {results.length > 0 && (
            <Link
              href={`/catalog?q=${encodeURIComponent(trimmedQuery)}`}
              onClick={() => setIsFocused(false)}
              className="flex h-11 items-center justify-center border-t border-line bg-canvas text-sm font-bold text-brand transition hover:bg-brand/10"
            >
              Barcha natijalarni ko‘rish
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
