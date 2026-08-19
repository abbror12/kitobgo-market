import type { Config } from "tailwindcss";

// KitobGo veb palitrasi. Yagona manba — LOGOTIP: navy #101D7A
// (C:\Users\USER\Desktop\logo.PNG dagi rasmiy rang).
//
// Diqqat: bu palitra endi mobil ilovaning colors.dart fayliga ergashmaydi.
// Ilova hali iliq terakota (#A34A24) da; veb esa logotip navy'siga o'tdi.
// Ikkalasini yana birlashtirmoqchi bo'lsangiz, o'zgarish ilovada bo'lishi kerak.
//
// Yondashuv: QOG'OZ iliq qoladi (cream/sand/chiziqlar bej), BREND esa sovuq navy.
// Bu — iliq qog'oz + navy siyoh, ya'ni klassik premium kitob do'koni ko'rinishi.
// Tokenlarning nomlari barqaror: qiymatni o'zgartirish hech narsani buzmaydi.
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
        brand: "#101D7A",       // ASOSIY URG'U = logotip rangi: havolalar, narxlar, faol tab
        brandDark: "#0B1456",   // brand'ning bosilgan/hover holati va bej fondagi qora-ko'k matn
        inkButton: "#101D7A",   // asosiy tugma va to'q panellar — logotip nishoni bilan bir xil
        ink: "#151A33",         // sarlavhalar va asosiy matn; brand tugmasining hover holati
        bodyText: "#4E5468",    // ma'no tashiydigan har qanday ikkilamchi matn
        muted: "#82879B",       // FAQAT bezak matn — cream fonda ~3.4:1, WCAG AA dan past
        line: "#E6DCC6",        // ajratgichlar, kartochka chiziqlari
        lineSoft: "#EEE3CD",    // cream ustidagi chiziqlar uchun yengilroq variant
        field: "#E4D9C2",       // input va picker chegaralari
        chevron: "#C9BDA3",     // strelkalar va mayda elementlar
        gold: "#B08A3E",        // reyting yulduzlari — navy bilan juftlikda premium urg'u
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
        // Soyalar ink (#151A33) asosida — navy'ga moslangan, iliq jigarrang emas.
        // Ilova deyarli soyasiz, web'da esa oq page ustidagi cream kartochkani ajratish kerak.
        soft: "0 12px 40px rgba(21, 26, 51, 0.08)",
        card: "0 10px 24px rgba(21, 26, 51, 0.12)",
        button: "0 7px 18px rgba(16, 29, 122, 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
