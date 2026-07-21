import type { Metadata } from "next";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { StoreShell } from "@/components/layout/StoreShell";
import { BookCard } from "@/components/product/BookCard";
import { PageIntro } from "@/components/shared/PageIntro";
import { getCategories, searchProducts } from "@/lib/store-api";

export const metadata: Metadata = { title: "Kitoblar katalogi — Kitob.go", description: "Saralangan original kitoblarni kategoriya, narx va muallif bo‘yicha toping." };

type CatalogParams = { q?: string; category?: string; sort?: string; max?: string; stock?: string; discount?: string; page?: string };
type SearchParams = Promise<CatalogParams>;

function catalogHref(params: CatalogParams, page: number) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key !== "page" && value) query.set(key, value);
  }
  if (page > 1) query.set("page", String(page));
  const suffix = query.toString();
  return suffix ? `/catalog?${suffix}` : "/catalog";
}

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const maxPrice = Number(params.max) || undefined;
  const selectedCategory = params.category ?? "";
  const selectedSort = params.sort ?? "popular";
  const requestedPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const categories = await getCategories().catch(() => []);
  const selectedName = categories.find((category) => String(category.id) === selectedCategory)?.name;
  const sortMap: Record<string, string> = { popular: "rating,desc", newest: "publishedYear,desc", "price-asc": "price,asc", "price-desc": "price,desc" };
  let apiUnavailable = false;
  const result = await searchProducts({
    q: query || undefined,
    maxPrice,
    inStock: params.stock === "true" ? true : undefined,
    hasDiscount: params.discount === "true" ? true : undefined,
    categoryId: selectedCategory || undefined,
    sort: sortMap[selectedSort] ?? sortMap.popular,
    page: requestedPage - 1,
    size: 24,
  }).catch(() => {
    apiUnavailable = true;
    return { content: [], page: requestedPage - 1, size: 24, totalElements: 0, totalPages: 0, last: true };
  });
  const currentPage = result.page + 1;
  const hasFilters = Boolean(query || selectedCategory || params.max || params.stock || params.discount);

  return (
    <StoreShell>
      <PageIntro eyebrow="Onlayn kutubxona" title={selectedName ?? (query ? `“${query}” bo‘yicha natijalar` : "Kitoblar katalogi")} description="Didingiz va ehtiyojingizga mos kitobni qulay filtrlar yordamida toping." breadcrumbs={[{ label: "Katalog" }]} aside={<span className="rounded-full bg-brand/10 px-4 py-2 text-sm font-bold text-brand">{result.totalElements} ta kitob</span>} />
      <section className="container-page py-8 sm:py-12">
        {categories.length > 0 && <div id="kategoriyalar" className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-6 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href="/catalog" className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${!selectedCategory ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:border-brand/30"}`}>Barchasi</Link>
          {categories.map((category) => <Link key={category.id} href={`/catalog?category=${category.id}`} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedCategory === String(category.id) ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:border-brand/30"}`}>{category.name}</Link>)}
        </div>}
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
              <label className="mt-5 block text-sm font-bold" htmlFor="stock">Mavjudligi</label>
              <select id="stock" name="stock" defaultValue={params.stock ?? ""} className="mt-2 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand">
                <option value="">Barchasi</option><option value="true">Faqat omborda bor</option>
              </select>
              <label className="mt-5 block text-sm font-bold" htmlFor="discount">Chegirma</label>
              <select id="discount" name="discount" defaultValue={params.discount ?? ""} className="mt-2 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand">
                <option value="">Barchasi</option><option value="true">Faqat chegirmali</option>
              </select>
              <button className="button-primary mt-6 h-11 w-full px-4 text-sm" type="submit">Natijalarni ko‘rsatish</button>
              {hasFilters && <Link href="/catalog" className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-muted hover:text-brand"><X size={15} /> Tozalash</Link>}
            </form>
          </aside>
          <div>
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-sm text-muted"><strong className="text-ink">{result.totalElements}</strong> ta natija topildi</p>
              <form action="/catalog">
                {query && <input type="hidden" name="q" value={query} />}{selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}{params.max && <input type="hidden" name="max" value={params.max} />}{params.stock && <input type="hidden" name="stock" value={params.stock} />}{params.discount && <input type="hidden" name="discount" value={params.discount} />}
                <select name="sort" defaultValue={selectedSort} className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-medium outline-none focus:border-brand" aria-label="Saralash">
                  <option value="popular">Eng mashhurlari</option><option value="newest">Eng yangilari</option><option value="price-asc">Narx: arzondan</option><option value="price-desc">Narx: qimmatdan</option>
                </select>
                <button type="submit" className="ml-2 h-10 rounded-xl border border-line bg-white px-3 text-xs font-bold hover:border-brand hover:text-brand">Saralash</button>
              </form>
            </div>
            {result.content.length ? <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">{result.content.map((book) => <BookCard key={book.id} book={book} />)}</div>
              {result.totalPages > 1 && <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Katalog sahifalari">
                {currentPage > 1 ? <Link href={catalogHref(params, currentPage - 1)} className="inline-flex h-10 items-center gap-1 rounded-xl border border-line bg-white px-4 text-sm font-bold hover:border-brand hover:text-brand"><ChevronLeft size={17} /> Oldingi</Link> : <span className="inline-flex h-10 cursor-not-allowed items-center gap-1 rounded-xl border border-line bg-white px-4 text-sm font-bold text-muted opacity-50"><ChevronLeft size={17} /> Oldingi</span>}
                <span className="text-sm font-semibold text-muted"><strong className="text-ink">{currentPage}</strong> / {result.totalPages}</span>
                {!result.last ? <Link href={catalogHref(params, currentPage + 1)} className="inline-flex h-10 items-center gap-1 rounded-xl border border-line bg-white px-4 text-sm font-bold hover:border-brand hover:text-brand">Keyingi <ChevronRight size={17} /></Link> : <span className="inline-flex h-10 cursor-not-allowed items-center gap-1 rounded-xl border border-line bg-white px-4 text-sm font-bold text-muted opacity-50">Keyingi <ChevronRight size={17} /></span>}
              </nav>}
            </> : <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center"><h2 className="text-xl font-extrabold">{apiUnavailable ? "Kitoblarni yuklab bo‘lmadi" : "Mos kitob topilmadi"}</h2><p className="mt-2 text-sm text-muted">{apiUnavailable ? "API serverini tekshirib, sahifani yangilang." : "Qidiruv so‘zini yoki filtrlarni o‘zgartirib ko‘ring."}</p><Link href="/catalog" className="button-primary mt-5 h-11 px-5 text-sm">Qayta urinish</Link></div>}
          </div>
        </div>
      </section>
    </StoreShell>
  );
}
