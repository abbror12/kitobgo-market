import type { Metadata } from "next";
import { BadgeCheck, BookOpen, CreditCard, PackageCheck, ShieldCheck, Star, Truck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StoreShell } from "@/components/layout/StoreShell";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductSection } from "@/components/product/ProductSection";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getBookBySlug } from "@/data/books";
import { formatPrice } from "@/lib/format";
import { getProduct, getProducts } from "@/lib/store-api";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const book = await getProduct(slug).catch(() => getBookBySlug(slug));
  return book ? { title: `${book.title} — Kitob.go`, description: book.description } : {};
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getProduct(slug).catch(() => getBookBySlug(slug));
  if (!book) notFound();
  const categoryName = book.categoryName ?? "Kitoblar";
  const allBooks = await getProducts().catch(() => []);
  const categoryIds = new Set(book.categories?.map((category) => category.id) ?? []);
  const related = allBooks.filter((item) => item.id !== book.id).sort((a, b) => {
    const bRelated = b.categories?.some((category) => categoryIds.has(category.id)) || b.author === book.author;
    const aRelated = a.categories?.some((category) => categoryIds.has(category.id)) || a.author === book.author;
    return Number(bRelated) - Number(aRelated);
  }).slice(0, 4);

  return (
    <StoreShell>
      <div className="container-page py-6 sm:py-8"><Breadcrumbs items={[{ label: "Katalog", href: "/catalog" }, { label: categoryName, href: `/catalog?category=${book.category}` }, { label: book.title }]} /></div>
      <section className="container-page pb-12">
        <div className="grid gap-8 rounded-[24px] border border-line bg-white p-4 shadow-soft sm:p-7 lg:grid-cols-[.88fr_1.12fr] lg:gap-12 lg:p-10">
          <ProductGallery title={book.title} images={book.images ?? [book.image]} color={book.color} badge={book.badge} />
          <div className="flex flex-col justify-center">
            <Link href={`/catalog?category=${book.category}`} className="text-xs font-bold uppercase tracking-[.16em] text-brand">{categoryName}</Link>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.035em] text-ink sm:text-[42px]">{book.title}</h1>
            <Link href={`/authors?q=${encodeURIComponent(book.author)}`} className="mt-2 w-fit text-sm font-medium text-muted transition hover:text-brand">{book.author}</Link>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm"><span className="inline-flex items-center gap-1 font-bold"><Star size={17} className="fill-amber-400 text-amber-400" /> {book.rating || "Yangi"}</span>{book.reviews > 0 && <span className="text-muted">{book.reviews} ta sharh</span>}<span className="h-4 w-px bg-line" /><span className={`inline-flex items-center gap-1.5 font-semibold ${book.inStock ? "text-brand" : "text-red-600"}`}><PackageCheck size={17} /> {book.inStock ? "Omborda mavjud" : "Hozircha mavjud emas"}</span></div>
            <p className="mt-5 max-w-xl leading-7 text-muted">{book.description}</p>
            <div className="mt-6 flex items-end gap-3"><span className="text-3xl font-extrabold text-brand">{formatPrice(book.price)}</span>{book.oldPrice && <span className="pb-1 text-sm text-muted line-through">{formatPrice(book.oldPrice)}</span>}</div>
            <ProductActions book={book} />
            <div className="mt-7 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
              <span className="flex items-center gap-3 text-sm"><Truck size={20} className="text-brand" /><span><strong className="block">Bepul yetkazish</strong><small className="text-muted">O‘zbekiston bo‘ylab</small></span></span>
              <span className="flex items-center gap-3 text-sm"><CreditCard size={20} className="text-brand" /><span><strong className="block">Qabul qilganda to‘lov</strong><small className="text-muted">Avval tekshiring</small></span></span>
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-line bg-white py-12 sm:py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
          <div><span className="eyebrow">Kitob haqida</span><h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Mazmunli va sifatli nashr</h2><p className="mt-4 leading-8 text-muted">Ushbu kitob ishonchli nashriyot tomonidan tayyorlangan. Matn terilishi, qog‘oz sifati va muqova dizayni kundalik mutolaa uchun qulay. Buyurtmangiz maxsus himoyalangan qadoqda yetkaziladi.</p><div className="mt-6 flex gap-3 rounded-2xl bg-[#F3F6F3] p-4"><ShieldCheck className="shrink-0 text-brand" /><p className="text-sm leading-6 text-muted"><strong className="block text-ink">Original mahsulot kafolati</strong>Har bir nashr rasmiy hamkorlardan olinadi va jo‘natishdan oldin tekshiriladi.</p></div></div>
          <div className="rounded-2xl border border-line p-5 sm:p-6"><h2 className="flex items-center gap-2 font-extrabold"><BookOpen size={19} className="text-brand" /> Kitob xususiyatlari</h2><dl className="mt-4 divide-y divide-line text-sm">{[["Muallif", book.author], ["Nashriyot", book.publisher], ["Nashr yili", book.publishedYear ? String(book.publishedYear) : "—"], ["Sahifalar", book.pages ? `${book.pages} bet` : "—"], ["Til", book.language], ["Muqova", book.cover], ["ISBN", book.isbn]].map(([label, value]) => <div key={label} className="grid grid-cols-[110px_1fr] gap-3 py-3"><dt className="text-muted">{label}</dt><dd className="font-semibold text-ink">{value}</dd></div>)}</dl></div>
        </div>
      </section>
      <div className="container-page grid gap-3 py-8 sm:grid-cols-3">{[{ icon: BadgeCheck, title: "Tekshirilgan nashr", text: "Sifat va mazmun nazorati" }, { icon: Truck, title: "Tezkor yetkazish", text: "1–3 ish kuni ichida" }, { icon: ShieldCheck, title: "14 kun kafolat", text: "Qaytarish imkoniyati" }].map(({ icon: Icon, title, text }) => <div key={title} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4"><span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand"><Icon size={21} /></span><span><strong className="block text-sm">{title}</strong><small className="text-muted">{text}</small></span></div>)}</div>
      {related.length > 0 && <ProductSection title="Sizga yoqishi mumkin" subtitle="O‘xshash mavzudagi saralangan kitoblar" books={related} compact />}
    </StoreShell>
  );
}
