import type { Config } from "tailwindcss";

// KitobGo veb palitrasi — yengil, asaxiy uslubidagi marketplace ko'rinishi.
// Brend manbayi — LOGOTIP (navy #101D7A), lekin u faqat logotipning o'zida:
// katta to'q navy yuzalar odamni "bo'g'adi" (foydalanuvchi bahosi), shuning uchun
// interaktiv elementlar logotip ohangining YORQIN toni (#2745D6) da, fonlar esa
// oq/och sovuq-kulrang. Iliq bej (sand/krem) yuzalar olib tashlandi — ular ko'k
// bilan kelishmasdi.
//
// Qoida: sariq (gold) faqat reyting yulduzlari va "TOP" badge uchun; uni ko'k
// yuzalar yoniga qo'ymang — sariq-ko'k juftligi ataylab ishlatilmaydi.
//
// Diqqat: bu palitra mobil ilovaning colors.dart fayliga ergashmaydi (u hali
// terrakotada). Token NOMLARI barqaror: qiymat o'zgarishi hech narsani buzmaydi.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#FFFFFF",        // sahifa foni
        cream: "#FFFFFF",       // kartochka va input yuzasi — oq (nomi tarixiy)
        sand: "#EAF0F9",        // yumshoq to'ldirish: ikonka disklari, pill'lar, och panellar
        navSurface: "#F6F8FB",  // sticky header / pastki panel / to'liq kenglikdagi tasmalar
        brand: "#2745D6",       // ASOSIY URG'U: logotip navy'sining yorqin toni — havola, narx, tugma
        brandDark: "#1B2F9E",   // brand'ning bosilgan/hover holati
        ink: "#151A33",         // sarlavhalar va asosiy matn
        bodyText: "#4E5468",    // ma'no tashiydigan har qanday ikkilamchi matn
        muted: "#82879B",       // FAQAT bezak matn — WCAG AA dan past, placeholder uchun
        line: "#E3E8F0",        // ajratgichlar, kartochka chiziqlari
        lineSoft: "#EDF1F7",    // oq ustidagi chiziqlar uchun yengilroq variant
        field: "#D7DEEA",       // input va picker chegaralari
        chevron: "#A9B4C9",     // strelkalar va mayda elementlar
        gold: "#F5A623",        // reyting yulduzlari va badge — ko'k yuzaga qo'ymang
        success: "#1F9D50",
        successSoft: "#E8F6EE",
        warning: "#B7791F",
        warningSoft: "#FCF0DB",
        danger: "#D3352B",
        dangerSoft: "#FCE9E7",
      },
      fontFamily: {
        // Lora FAQAT sarlavhalar, kitob nomlari va narxlar uchun (ilovadagidek).
        // Qolgan hamma matn tizim sans-serif'da — shuning uchun sans global emas.
        serif: ["var(--font-lora)", "Lora", "Georgia", "serif"],
      },
      boxShadow: {
        // Yengil sovuq soyalar — ink (#151A33) asosida; tugma soyasi brand'dan.
        soft: "0 10px 32px rgba(21, 26, 51, 0.06)",
        card: "0 10px 24px rgba(21, 26, 51, 0.10)",
        button: "0 6px 16px rgba(39, 69, 214, 0.24)",
      },
    },
  },
  plugins: [],
};

export default config;
