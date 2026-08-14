// Sonlar va sanalar ATAYLAB `Intl` siz formatlanadi.
//
// Sabab: `uz-UZ` ma'lumotlari Node ICU sida bor, brauzer ICU sida esa yo'q. Bitta qiymat
// ikki xil chiqadi:
//
//   Intl.NumberFormat("uz-UZ").format(65000)     Node: 65[U+00A0]000     Chrome: 65,000
//   toLocaleDateString("uz-UZ", {month:"long"})   Node: 14-avgust, 2026   Chrome: 2026 M08 14
//
// Birinchisi har bir narxda server va mijoz matnini farqlantirib, React'ni "hydration failed"
// bilan butun daraxtni qayta chizishga majbur qilardi; ikkinchisi foydalanuvchiga to'g'ridan-
// to'g'ri buzuq sana ko'rsatardi. Shuning uchun format shu yerda qat'iy yozilgan va hech
// qanday lokal ma'lumotga tayanmaydi.

// Minglar ajratgichi: uzbekcha yozuvda probel. Raqam o'rtasidan o'ralib ketmasligi uchun
// uzluksiz probel (U+00A0) — manbada ko'rinmas belgi turmasin deb kod bilan yozilgan.
const GROUP_SEPARATOR = String.fromCharCode(0xa0);

const MONTHS_UZ = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

// O'zbekiston UTC+5 da, yozgi vaqt yo'q. Sanani mahalliy vaqtga qoldirib bo'lmaydi: server
// konteyneri UTC da ishlaydi, ya'ni kechqurungi buyurtma serverda 14-avgust, brauzerda
// 15-avgust bo'lib ko'rinardi.
const TASHKENT_OFFSET_MS = 5 * 60 * 60 * 1000;

export function formatNumber(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  return sign + String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATOR);
}

export function formatPrice(price: number): string {
  return `${formatNumber(price)} so‘m`;
}

/** `14-avgust, 2026` — Toshkent vaqtida. */
export function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const tashkent = new Date(parsed.getTime() + TASHKENT_OFFSET_MS);
  return `${tashkent.getUTCDate()}-${MONTHS_UZ[tashkent.getUTCMonth()]}, ${tashkent.getUTCFullYear()}`;
}

export function isExternalImage(src: string): boolean {
  return src.startsWith("https://") || src.startsWith("http://");
}
