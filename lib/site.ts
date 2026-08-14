// Saytning tashqi manzili — metadata, sitemap, robots va JSON-LD shu yerdan oladi.
// Bitta joyda turgani muhim: bu qiymat qidiruv tizimiga beriladigan kanonik manzil.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://kitobgo.com").replace(/\/+$/, "");
export const SITE_NAME = "Kitob.go";

// Qidiruvga berilmaydigan yo'llar: shaxsiy kabinet, savat va bir martalik ekranlar.
// robots.ts ham, sahifalarning `robots: { index: false }` sozlamasi ham shu ro'yxatga tayanadi.
export const PRIVATE_PATHS = ["/cart", "/checkout", "/login", "/profile", "/favorites", "/order-success"];
