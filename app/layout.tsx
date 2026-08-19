import type { Metadata, Viewport } from "next";
import { Lora } from "next/font/google";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";
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

// Diqqat: bu yerda `alternates.canonical` YOZILMAYDI. Layout metadatasi sahifalarga meros
// bo'lib o'tadi, ya'ni bitta kanonik manzil butun saytga tarqalib ketardi — har sahifa
// o'z canonical'ini o'zi beradi.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Kitob.go — O‘zbekistondagi onlayn kitob do‘koni",
  description: "Qur’oni Karim, hadis, tafsir, tarix va boshqa kitoblarni bepul yetkazib berish hamda qabul qilgandan keyin to‘lash imkoniyati bilan xarid qiling.",
  keywords: ["kitob", "onlayn kitob do‘koni", "Qur’oni Karim", "hadis", "tafsir", "O‘zbekiston"],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "uz_UZ",
    url: SITE_URL,
  },
};

// Butun sayt haqidagi strukturali ma'lumot. `SearchAction` — Google natijalarida sayt
// ichidagi qidiruv maydonini chiqarish uchun; manzil katalog qidiruvi bilan bir xil (`?q=`).
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
      sameAs: ["https://t.me/kitobgouz", "https://www.instagram.com/kitob.go"],
      // Raqam E.164 ko'rinishida — Google shu shaklni kutadi. Sahifada ko'rinadigan
      // raqam (footer, /contact, huquqiy hujjatlar) aynan shu bo'lishi shart:
      // strukturali ma'lumot sahifadagi matnga zid bo'lsa, u e'tiborga olinmaydi.
      telephone: "+998774488080",
      email: "info@kitobgo.com",
      contactPoint: [{
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: "+998774488080",
        email: "support@kitobgo.com",
        areaServed: "UZ",
        availableLanguage: ["uz", "ru"],
      }],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "uz-UZ",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/catalog?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F6F8FB", // navSurface — sticky header bilan bir xil
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz" className={lora.variable}>
      <body>
        <JsonLd data={siteJsonLd} />
        {children}
      </body>
    </html>
  );
}
