import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kitob.go — O‘zbekistondagi onlayn kitob do‘koni",
  description: "Qur’oni Karim, hadis, tafsir, tarix va boshqa kitoblarni bepul yetkazib berish hamda qabul qilgandan keyin to‘lash imkoniyati bilan xarid qiling.",
  keywords: ["kitob", "onlayn kitob do‘koni", "Qur’oni Karim", "hadis", "tafsir", "O‘zbekiston"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12633D",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="uz"><body>{children}</body></html>;
}
