import Link from "next/link";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-canvas p-6 text-center"><div><p className="text-sm font-bold text-brand">404</p><h1 className="mt-2 text-4xl font-extrabold text-ink">Sahifa topilmadi</h1><p className="mt-3 text-muted">Manzil noto‘g‘ri yoki sahifa o‘chirilgan bo‘lishi mumkin.</p><Link href="/" className="button-primary mx-auto mt-6 h-12 w-fit px-6">Bosh sahifaga qaytish</Link></div></main>;
}
