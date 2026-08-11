import type { Config } from "tailwindcss";

// KitobGo palitrasi. Yagona manba — mobil ilova:
// D:\Project\kitobgo-flutter\lib\ui\theme\colors.dart
//
// Tokenlarning NOMLARI ilovadagi bilan bir xil va barqaror: qiymatni o'zgartirish
// hech narsani buzmaydi, nomni o'zgartirish esa butun saytga tegadi.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: "#FFFFFF",        // sahifa foni
        cream: "#FFFDF6",       // kartochka va input yuzasi — bu fonda hech qachon sof oq emas
        sand: "#EFE7D3",        // yumshoq to'ldirish: avatar doiralari, tanlangan pill'lar
        navSurface: "#FBF7EC",  // pastki panel / sticky header
        cocoa: "#A34A24",       // ASOSIY URG'U: havolalar, narxlar, faol tab, ikkilamchi tugma
        cocoaDark: "#8C3B1C",   // cocoa'ning bosilgan/hover holati
        inkButton: "#2B2317",   // asosiy tugma foni
        ink: "#241D12",         // sarlavhalar va asosiy matn
        bodyText: "#5C5142",    // ma'no tashiydigan har qanday ikkilamchi matn
        muted: "#97896F",       // FAQAT bezak matn — cream fonda ~3.4:1, WCAG AA dan past
        line: "#E6DCC6",        // ajratgichlar, kartochka chiziqlari
        lineSoft: "#EEE3CD",    // cream ustidagi chiziqlar uchun yengilroq variant
        field: "#E4D9C2",       // input va picker chegaralari
        chevron: "#C9BDA3",     // strelkalar va mayda elementlar
        gold: "#B08A3E",        // reyting yulduzlari
        success: "#3E5C46",
        successSoft: "#E4EAD9",
        warning: "#8A6516",
        warningSoft: "#F3E0D2",
        danger: "#9D241D",
        dangerSoft: "#FBE3E1",
      },
      fontFamily: {
        // Lora FAQAT sarlavhalar, kitob nomlari va narxlar uchun (ilovadagidek).
        // Qolgan hamma matn tizim sans-serif'da — shuning uchun sans global emas.
        serif: ["var(--font-lora)", "Lora", "Georgia", "serif"],
      },
      boxShadow: {
        // Iliq soyalar: ink (#241D12) asosida. Ilova deyarli soyasiz (elevation 0),
        // web'da esa oq page ustidagi cream kartochkani ajratish uchun kerak — trap #4.
        soft: "0 12px 40px rgba(36, 29, 18, 0.07)",
        card: "0 10px 24px rgba(36, 29, 18, 0.10)",
        button: "0 7px 18px rgba(43, 35, 23, 0.20)",
      },
    },
  },
  plugins: [],
};

export default config;
