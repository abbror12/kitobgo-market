import type { Metadata } from "next";
import { ArrowLeft, BookOpenText, Clock3, Send } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StoreShell } from "@/components/layout/StoreShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { posts } from "@/data/blog";
import { breadcrumbJsonLd, metaDescription } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export function generateStaticParams() { return posts.map((post) => ({ slug: post.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) return {};
  const title = `${post.title} — Kitob.go`;
  const description = metaDescription(post.excerpt);
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    // siteName/locale takrorlanadi — sahifa openGraph'i layout'dagisini almashtiradi.
    openGraph: { type: "article", siteName: SITE_NAME, locale: "uz_UZ", title, description, url: `/blog/${post.slug}` },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();
  return <StoreShell><JsonLd data={breadcrumbJsonLd([{ name: "Bosh sahifa", path: "/" }, { name: "Blog", path: "/blog" }, { name: post.title }])} /><article><div className="container-page py-6"><Breadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} /></div><header className="container-page"><div className="overflow-hidden rounded-[28px] px-6 py-12 text-center sm:px-12 sm:py-16" style={{ backgroundColor: post.color }}><span className="eyebrow bg-cream/70">{post.category}</span><h1 className="font-serif mx-auto mt-4 max-w-4xl text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-5xl">{post.title}</h1><p className="mx-auto mt-4 max-w-2xl leading-7 text-bodyText">{post.excerpt}</p><div className="mt-6 flex justify-center gap-4 text-sm text-bodyText"><span>{post.date}</span><span className="flex items-center gap-1.5"><Clock3 size={16} /> {post.readTime}</span></div><BookOpenText size={64} strokeWidth={1} className="mx-auto mt-8 text-brand/60" /></div></header><div className="container-page py-10 sm:py-14"><div className="mx-auto max-w-3xl text-[16px] leading-8 text-bodyText"><p className="text-xl font-medium leading-8 text-ink">Yaxshi kitob tanlash — mutolaaning yarmi. To‘g‘ri tanlov o‘qishga bo‘lgan qiziqishni oshiradi va vaqtni mazmunli o‘tkazishga yordam beradi.</p><h2 className="font-serif mt-9 text-2xl font-semibold text-ink">Maqsadingizni aniqlang</h2><p className="mt-3">Avvalo nima uchun kitob o‘qimoqchi ekaningizni o‘ylab ko‘ring: yangi bilim olish, ruhiy hordiq chiqarish yoki ma’lum bir ko‘nikmani rivojlantirish. Aniq maqsad tanlovni ancha osonlashtiradi.</p><h2 className="font-serif mt-9 text-2xl font-semibold text-ink">Muntazamlik muhim</h2><p className="mt-3">Kuniga atigi 15–20 daqiqa ajratish ham katta natija beradi. Kitobni ko‘rinadigan joyda saqlang, telefon bildirishnomalarini o‘chiring va mutolaa uchun doimiy vaqt belgilang.</p><blockquote className="my-9 rounded-r-2xl border-l-4 border-brand bg-sand/50 p-6 text-lg font-medium italic text-ink">Mutolaa tezlik musobaqasi emas. Muhimi — o‘qilgan fikrning hayotingizda aks etishi.</blockquote><h2 className="font-serif mt-9 text-2xl font-semibold text-ink">Xulosa</h2><p className="mt-3">O‘zingizga mos mavzu va sur’atni toping. Kichik qadamlar bilan boshlangan mutolaa vaqt o‘tib barqaror va zavqli odatga aylanadi.</p><div className="mt-10 flex flex-col gap-3 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between"><Link href="/blog" className="inline-flex items-center gap-2 font-bold text-brand"><ArrowLeft size={18} /> Barcha maqolalar</Link><a href="https://t.me/kitobgouz" className="inline-flex items-center gap-2 text-sm font-bold text-brand"><Send size={17} /> Telegramda kuzatish</a></div></div></div></article></StoreShell>;
}
