import type { Category, FAQItem, Testimonial } from "@/types/book";

export const categories: Category[] = [
  { id: "quran", name: "Qur’oni Karim", icon: "book-open" },
  { id: "hadis", name: "Hadis", icon: "library" },
  { id: "tafsir", name: "Tafsir", icon: "heart-handshake" },
  { id: "aqida", name: "Aqida", icon: "flower" },
  { id: "fiqh", name: "Fiqh", icon: "landmark" },
  { id: "tarix", name: "Tarix", icon: "scroll" },
  { id: "hikmat", name: "Hikmatlar", icon: "sparkles" },
  { id: "bolalar", name: "Bolalar uchun", icon: "baby" },
  { id: "ayollar", name: "Ayollar uchun", icon: "person-standing" },
  { id: "badiiy", name: "Badiiy adabiyot", icon: "book-marked" },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Dilbar opa",
    location: "Toshkent shahri",
    text: "Kitob juda ozoda qadoqlangan holda yetib keldi. Buyurtma berish sodda, to‘lov esa qabul qilgandan keyin bo‘lgani juda qulay.",
    rating: 5,
  },
  {
    id: "2",
    name: "Akmaljon",
    location: "Samarqand shahri",
    text: "Nashr sifati a’lo. Maslahatchi kitob tanlashda xotirjam va tushunarli yordam berdi.",
    rating: 5,
  },
  {
    id: "3",
    name: "Muqaddasxon",
    location: "Andijon shahri",
    text: "Onam uchun olgandim. Matnlari yirik, o‘qish oson. Yetkazib berish ham kutilganidan tez bo‘ldi.",
    rating: 5,
  },
];

export const faqItems: FAQItem[] = [
  {
    id: "delivery",
    question: "Yetkazib berish qancha turadi va necha kunda keladi?",
    answer: "Yetkazib berish narxi hududga bog‘liq — u buyurtma berishda, hudud tanlanganda ko‘rsatiladi. Buyurtmalar O‘zbekiston bo‘ylab kuryer orqali 2–3 ish kunida yetkaziladi. Manzil va qulay vaqt buyurtma tasdiqlanganda kelishiladi.",
  },
  {
    id: "payment",
    question: "To‘lovni qachon amalga oshiraman?",
    answer: "Naqd to‘lovni tanlasangiz — kitobni qabul qilib, tekshirganingizdan keyin kuryerga to‘laysiz. Click yoki Payme tanlasangiz — buyurtma berishda to‘laysiz; to‘lanmagan onlayn buyurtma 30 daqiqada avtomatik bekor qilinadi.",
  },
  {
    id: "original",
    question: "Kitoblar original ekaniga qanday ishonaman?",
    answer: "Biz faqat rasmiy nashriyotlar va tasdiqlangan hamkorlardan olingan original kitoblarni taklif qilamiz.",
  },
  {
    id: "return",
    question: "Kitobni qaytarish mumkinmi?",
    answer: "Mahsulot foydalanilmagan va asl holati saqlangan bo‘lsa, 14 kun ichida qo‘llab-quvvatlash xizmatiga murojaat qilishingiz mumkin.",
  },
  {
    id: "order",
    question: "Buyurtma berishda yordam olsam bo‘ladimi?",
    answer: "Albatta. Telefon yoki Telegram orqali bog‘laning — maslahatchimiz kitob tanlashdan buyurtmagacha yordam beradi.",
  },
];
