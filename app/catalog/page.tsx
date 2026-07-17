import type { Metadata } from "next";
import { SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { StoreShell } from "@/components/layout/StoreShell";
import { BookCard } from "@/components/product/BookCard";
import { PageIntro } from "@/components/shared/PageIntro";
import { categories } from "@/data/home";
import { searchProducts } from "@/lib/store-api";

export const metadata: Metadata = { title: "Kitoblar katalogi — Kitob.go", description: "Saralangan original kitoblarni kategoriya, narx va muallif bo‘yicha toping." };

type SearchParams = Promise<{ q?: string; category?: string; sort?: string; max?: string }>;

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const maxPrice = Number(params.max) || undefined;
  const selectedCategory = params.category ?? "";
  const selectedSort = params.sort ?? "popular";
  const selectedName = categories.find((category) => category.id === selectedCategory)?.name;
  const sortMap: Record<string, string> = { popular: "rating,desc", newest: "publishedYear,desc", "price-asc": "price,asc", "price-desc": "price,desc" };
  let apiUnavailable = false;
  const result = await searchProducts({ q: query || selectedName, maxPrice, sort: sortMap[selectedSort] ?? sortMap.popular, size: 24 }).catch(() => {
    apiUnavailable = true;
    return { content: [], page: 0, size: 24, totalElements: 0, totalPages: 0, last: true };
  });
  const filtered = result.content;

  return (
    <StoreShell>
      <PageIntro eyebrow="Onlayn kutubxona" title={selectedName ?? (query ? `“${params.q}” bo‘yicha natijalar` : "Kitoblar katalogi")} description="Didingiz va ehtiyojingizga mos kitobni qulay filtrlar yordamida toping." breadcrumbs={[{ label: "Katalog" }]} aside={<span className="rounded-full bg-brand/10 px-4 py-2 text-sm font-bold text-brand">{result.totalElements} ta kitob</span>} />
      <section className="container-page py-8 sm:py-12">
        <div id="kategoriyalar" className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-6 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href="/catalog" className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${!selectedCategory ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:border-brand/30"}`}>Barchasi</Link>
          {categories.map((category) => <Link key={category.id} href={`/catalog?category=${category.id}`} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedCategory === category.id ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:border-brand/30"}`}>{category.name}</Link>)}
        </div>
        <div className="grid gap-7 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr]">
          <aside>
            <form action="/catalog" className="rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-40">
              <div className="flex items-center gap-2 border-b border-line pb-4"><SlidersHorizontal size={18} className="text-brand" /><h2 className="font-extrabold">Filtrlar</h2></div>
              <label className="mt-5 block text-sm font-bold" htmlFor="catalog-query">Qidiruv</label>
              <input id="catalog-query" name="q" defaultValue={params.q} placeholder="Kitob yoki muallif" className="mt-2 h-11 w-full rounded-xl border border-line px-3 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10" />
              <label className="mt-5 block text-sm font-bold" htmlFor="category">Kategoriya</label>
              <select id="category" name="category" defaultValue={selectedCategory} className="mt-2 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand">
                <option value="">Barcha kategoriyalar</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <label className="mt-5 block text-sm font-bold" htmlFor="max">Eng yuqori narx</label>
              <select id="max" name="max" defaultValue={params.max ?? ""} className="mt-2 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand">
                <option value="">Cheklanmagan</option><option value="100000">100 000 so‘mgacha</option><option value="300000">300 000 so‘mgacha</option><option value="500000">500 000 so‘mgacha</option>
              </select>
              <button className="button-primary mt-6 h-11 w-full px-4 text-sm" type="submit">Natijalarni ko‘rsatish</button>
              {(query || selectedCategory || params.max) && <Link href="/catalog" className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-muted hover:text-brand"><X size={15} /> Tozalash</Link>}
            </form>
          </aside>
          <div>
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-sm text-muted"><strong className="text-ink">{result.totalElements}</strong> ta natija topildi</p>
              <form action="/catalog">
                {query && <input type="hidden" name="q" value={params.q} />}{selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}{params.max && <input type="hidden" name="max" value={params.max} />}
                <select name="sort" defaultValue={selectedSort} className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-medium outline-none focus:border-brand" aria-label="Saralash">
                  <option value="popular">Eng mashhurlari</option><option value="newest">Eng yangilari</option><option value="price-asc">Narx: arzondan</option><option value="price-desc">Narx: qimmatdan</option>
                </select>
                <button type="submit" className="ml-2 h-10 rounded-xl border border-line bg-white px-3 text-xs font-bold hover:border-brand hover:text-brand">Saralash</button>
              </form>
            </div>
            {filtered.length ? <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">{filtered.map((book) => <BookCard key={book.id} book={book} />)}</div> : <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center"><h2 className="text-xl font-extrabold">{apiUnavailable ? "Kitoblarni yuklab bo‘lmadi" : "Mos kitob topilmadi"}</h2><p className="mt-2 text-sm text-muted">{apiUnavailable ? "API serverini tekshirib, sahifani yangilang." : "Qidiruv so‘zini yoki filtrlarni o‘zgartirib ko‘ring."}</p><Link href="/catalog" className="button-primary mt-5 h-11 px-5 text-sm">Qayta urinish</Link></div>}
          </div>
        </div>
      </section>
    </StoreShell>
  );
}
