// Strukturali ma'lumot (schema.org) va meta matnlar uchun yordamchilar.
// Qoida: ma'lumot yo'q bo'lsa, maydon UMUMAN yozilmaydi — bo'sh yoki nol qiymat
// Google uchun xato hisoblanadi va butun rich result'ni bekor qiladi.
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { Book } from "@/types/book";

const absolute = (url: string) => (/^https?:\/\//.test(url) ? url : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`);

/** Meta tavsif: qidiruv natijasida ~160 belgidan keyini baribir kesiladi. */
export function metaDescription(text: string, limit = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;
  const cut = clean.slice(0, limit);
  return `${cut.slice(0, cut.lastIndexOf(" ")) || cut}…`;
}

// detailToBook to'ldirilmagan maydonlarni matn bilan almashtiradi ("—", "Muallif
// ko'rsatilmagan"). Ular odam uchun, robot uchun emas — shu sabab filtrlanadi.
const isMissing = (value: string) => !value || value === "—" || value.includes("ko‘rsatilmagan") || value.includes("kiritilmagan");

function cleanIsbn(isbn: string): string | undefined {
  const digits = isbn.replace(/[^0-9Xx]/g, "");
  return digits.length === 10 || digits.length === 13 ? digits : undefined;
}

export function bookJsonLd(book: Book) {
  const url = `${SITE_URL}/books/${book.slug}`;
  const isbn = cleanIsbn(book.isbn);
  const authors = book.author.split(",").map((name) => name.trim()).filter((name) => !isMissing(name));
  const images = (book.images?.length ? book.images : [book.image]).map(absolute);

  return {
    "@context": "https://schema.org",
    // Ikki tur birga: `Product` narx va mavjudlikni beradi, `Book` — isbn, muallif, sahifa.
    "@type": ["Product", "Book"],
    "@id": `${url}#product`,
    name: book.title,
    description: metaDescription(book.description, 5000),
    image: images,
    url,
    ...(isbn ? { isbn } : {}),
    ...(authors.length ? { author: authors.map((name) => ({ "@type": "Person", name })) } : {}),
    ...(isMissing(book.publisher) ? {} : { publisher: { "@type": "Organization", name: book.publisher } }),
    ...(book.pages > 0 ? { numberOfPages: book.pages } : {}),
    ...(book.publishedYear > 0 ? { datePublished: String(book.publishedYear) } : {}),
    offers: {
      "@type": "Offer",
      url,
      price: book.price,            // API.md: barcha summalar UZS
      priceCurrency: "UZS",
      availability: book.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
    // Reyting bo'lmasa aggregateRating yozilmaydi — nol reyting Google qoidalariga zid.
    ...(book.reviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(book.rating.toFixed(1)),
            reviewCount: book.reviews,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: `${SITE_URL}${item.path}` } : {}),
    })),
  };
}
