import type { Metadata, Viewport } from "next";
import { Lora } from "next/font/google";
import "./globals.css";

// Lora — ilovadagidek FAQAT sarlavhalar, kitob nomlari va narxlar uchun (font-serif).
// Body matni tizim sans-serif'da qoladi, shuning uchun bu shrift global emas:
// u faqat --font-lora o'zgaruvchisi orqali kerakli joyda chaqiriladi.
const lora = Lora({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://kitobgo.com"),
  title: "Kitob.go — O‘zbekistondagi onlayn kitob do‘koni",
  description: "Qur’oni Karim, hadis, tafsir, tarix va boshqa kitoblarni bepul yetkazib berish hamda qabul qilgandan keyin to‘lash imkoniyati bilan xarid qiling.",
  keywords: ["kitob", "onlayn kitob do‘koni", "Qur’oni Karim", "hadis", "tafsir", "O‘zbekiston"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FBF7EC", // navSurface — sticky header bilan bir xil
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="uz" className={lora.variable}><body>{children}</body></html>;
}
