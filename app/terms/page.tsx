import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

// Matn manbayi: D:\Project\KitobApp\docs\legal\foydalanish-shartlari.md (2026-08-12 tahriri).
// Hujjat egasi tomonidan to'ldirilgan — qoralama banneri olib tashlangan.

export const metadata: Metadata = {
  title: "Foydalanish shartlari — KitobGo",
  description: "KitobGo onlayn kitob do'koni bilan xaridor o'rtasidagi ommaviy oferta: buyurtma, to'lov, yetkazib berish, qaytarish.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Ommaviy oferta"
      title="Foydalanish shartlari"
      updated={<>Ommaviy oferta · Oxirgi yangilanish: 1.2.2026</>}
    >
      <LegalSection title="1. Umumiy qoidalar">
        <p>1.1. Ushbu shartlar “KitobGo” YaTT ro‘yxatdan o‘tish raqami: 6985950 (keyingi o‘rinlarda — “Sotuvchi”, STIR 626762785, manzil Toshkent sh., Olmozor, Qamarniso ko‘chasi) va KitobGo ilovasidan foydalanuvchi jismoniy shaxs (keyingi o‘rinlarda — “Xaridor”) o‘rtasidagi munosabatni tartibga soladi.</p>
        <p>1.2. Ilovadan foydalanish, ro‘yxatdan o‘tish yoki buyurtma berish ushbu shartlarga to‘liq rozilik bildirish hisoblanadi. Rozi bo‘lmasangiz, ilovadan foydalanmang.</p>
        <p>1.3. Maxfiylik siyosati ushbu shartlarning ajralmas qismidir: <Link href="/privacy" className="font-semibold text-cocoa hover:underline">kitobgo.com/privacy</Link></p>
      </LegalSection>

      <LegalSection title="2. Hisob">
        <p>2.1. Buyurtma berish uchun telefon raqami (SMS kod), elektron pochta yoki Google/Apple hisobi orqali kirish talab qilinadi. Katalogni ko‘rish uchun hisob shart emas.</p>
        <p>2.2. Xaridor kiritgan ma’lumotlarning to‘g‘riligi uchun javobgardir. Noto‘g‘ri telefon yoki manzil tufayli yetkazib berilmagan buyurtma uchun Sotuvchi javob bermaydi.</p>
        <p>2.3. Hisobga kirish uchun kelgan SMS kodni yoki parolni boshqalarga bermang. Hisobingizdan qilingan harakatlar sizning harakatingiz hisoblanadi.</p>
        <p>2.4. Xaridor istalgan vaqtda hisobini o‘chirishi mumkin (<Link href="/privacy" className="font-semibold text-cocoa hover:underline">Maxfiylik siyosati</Link>, 6-band).</p>
      </LegalSection>

      <LegalSection title="3. Tovar va narx">
        <p>3.1. Ilovada sotiladigan tovar — <strong className="text-ink">jismoniy kitoblar</strong>. Raqamli mahsulot yoki obuna sotilmaydi.</p>
        <p>3.2. Kitob muqovasidagi rasm va tavsif ma’lumot uchun; nashr yili yoki muqova dizayni noshir tomonidan o‘zgartirilgan bo‘lishi mumkin.</p>
        <p>3.3. Narxlar O‘zbekiston so‘mida, QQS hisobga olingan.</p>
        <p>3.4. <strong className="text-ink">Narx buyurtma tasdiqlangunicha o‘zgarishi mumkin.</strong> Agar savatga solgan paytdagi narx buyurtma berish paytida boshqacha bo‘lsa, ilova yangi narxni ko‘rsatadi va Xaridordan tasdiq so‘raydi. Tasdiqlanmaguncha buyurtma rasmiylashtirilmaydi.</p>
        <p>3.5. Omborda yetarli nusxa bo‘lmasa, ilova mavjud sonni ko‘rsatadi va buyurtma o‘sha songa moslashtiriladi.</p>
      </LegalSection>

      <LegalSection title="4. Buyurtma va to‘lov">
        <p>4.1. Buyurtma quyidagi tartibda rasmiylashtiriladi: savat → manzil va qabul qiluvchi → buyurtmani tasdiqlash → to‘lov usulini tanlash.</p>
        <p>4.2. To‘lov usullari: Click, Payme, <strong className="text-ink">naqd pul kuryerga</strong>. Mavjud usullar ro‘yxati ilovada ko‘rsatiladi va o‘zgarishi mumkin.</p>
        <p>4.3. Onlayn to‘lovda karta ma’lumotlari to‘lov tizimining o‘z sahifasida kiritiladi va Sotuvchiga uzatilmaydi.</p>
        {/* 30 daqiqa — backend shartnomasida tasdiqlangan (docs/API.md §6.3). */}
        <p>4.4. <strong className="text-ink">To‘lanmagan buyurtma 30 daqiqa ichida avtomatik bekor qilinadi</strong> va band qilingan kitoblar omborga qaytariladi.</p>
        <p>4.5. Naqd to‘lov tanlanganda buyurtma darhol ishlovga o‘tadi, to‘lov esa kuryerga yetkazib berish paytida amalga oshiriladi.</p>
      </LegalSection>

      <LegalSection title="5. Yetkazib berish">
        {/* Backend GET /regions hozir 14 ta hududni qaytaradi — butun mamlakat.
            Hudud vaqtincha to'xtatilishi mumkin (REGION_NOT_SERVICED), shuning uchun
            aniq ro'yxat buyurtma paytida ko'rsatilishiga havola qilinadi. */}
        <p>5.1. Yetkazib berish O‘zbekiston Respublikasining barcha hududlari — Toshkent shahri, barcha viloyatlar va Qoraqalpog‘iston Respublikasi — bo‘ylab kuryer orqali amalga oshiriladi. Buyurtma berish paytida mavjud hududlar ro‘yxati ilova va saytda ko‘rsatiladi.</p>
        <p>5.2. Yetkazib berish muddati — 2–3 ish kuni. Muddat taxminiy; ombor yoki logistika sabab kechikish mumkin, bu haqda Xaridorga xabar beriladi.</p>
        <p>5.3. Kuryer kelganda kitobni <strong className="text-ink">qabul qilishdan oldin ko‘zdan kechiring</strong>. Tashqi shikast borligi o‘sha paytda aytilishi kerak.</p>
      </LegalSection>

      <LegalSection title="6. Bekor qilish, qaytarish va pulni qaytarish">
        <p>6.1. Xaridor buyurtmani ilova orqali to‘lov kutilmoqda holatida bekor qilishi mumkin.</p>
        <p>6.2. Qonunga muvofiq Xaridor sifatli tovarni 14 kun ichida qaytarishi mumkin, agar tovar ishlatilmagan va tovar ko‘rinishi saqlangan bo‘lsa.</p>
        <p>6.3. Nuqsonli yoki noto‘g‘ri kitob yetkazilgan bo‘lsa, 4–5 kun ichida almashtirish yoki to‘liq pulni qaytarish amalga oshiriladi. Yetkazib berish xarajati Sotuvchi zimmasida.</p>
        <p>6.4. Pul to‘langan usul orqali 15 ish kunida qaytariladi.</p>
      </LegalSection>

      <LegalSection title="7. Sharhlar">
        <p>7.1. Xaridor sotib olgan kitobiga baho va sharh qoldirishi mumkin.</p>
        <p>7.2. Sharh <strong className="text-ink">moderatsiyadan o‘tadi</strong> va darhol ko‘rinmasligi mumkin.</p>
        <p>7.3. Sotuvchi quyidagi sharhlarni e’lon qilmaslik yoki o‘chirish huquqiga ega: haqorat, so‘kinish, reklama, boshqa shaxsning shaxsiy ma’lumotlari, kitobga aloqasi yo‘q matn.</p>
        <p>7.4. Sharh yozish orqali Xaridor uni ilova va saytda e’lon qilishga rozilik beradi.</p>
      </LegalSection>

      <LegalSection title="8. Intellektual mulk">
        <p>8.1. Ilova, uning dizayni, logotipi va matnlari Sotuvchiga tegishli.</p>
        <p>8.2. Kitoblarning muqova rasmlari va tavsiflari noshirlarga tegishli va ma’lumot maqsadida ishlatiladi.</p>
      </LegalSection>

      <LegalSection title="9. Javobgarlik">
        <p>9.1. Sotuvchi ilovaning uzluksiz ishlashini kafolatlamaydi: texnik ishlar, internet uzilishi yoki uchinchi tomon xizmatlari (to‘lov tizimi, SMS provayderi) ishlamay qolishi mumkin.</p>
        <p>9.2. Sotuvchining javobgarligi konkret buyurtma summasi bilan cheklanadi.</p>
        <p>9.3. Fors-major holatlarida (tabiiy ofat, davlat qarori, ommaviy uzilish) muddatlar to‘xtatiladi.</p>
      </LegalSection>

      <LegalSection title="10. Nizolarni hal qilish">
        <p>10.1. Nizolar avval muzokara yo‘li bilan hal qilinadi. Murojaat: <a href="mailto:support@kitobgo.com" className="font-semibold text-cocoa hover:underline">support@kitobgo.com</a>, javob muddati 2 ish kuni.</p>
        <p>10.2. Kelishuvga erishilmasa, nizo O‘zbekiston Respublikasi qonunchiligiga muvofiq “Toshkent shahar tumanlararo iqtisodiy sudi” da ko‘riladi.</p>
      </LegalSection>

      <LegalSection title="11. Shartlarning o‘zgarishi">
        <p>Sotuvchi shartlarni o‘zgartirishi mumkin. Yangi tahrir shu sahifada e’lon qilinadi. O‘zgarishdan keyin ilovadan foydalanishni davom ettirish yangi shartlarga rozilik hisoblanadi.</p>
      </LegalSection>

      <LegalSection title="12. Rekvizitlar">
        <p>“KitobGo” YaTT ro‘yxatdan o‘tish raqami: 6985950 · STIR 626762785 · Toshkent sh., Olmozor, Qamarniso ko‘chasi · <a href="tel:+998774488080" className="font-semibold text-cocoa hover:underline">+998 77 448 80 80</a> · <a href="mailto:info@kitobgo.com" className="font-semibold text-cocoa hover:underline">info@kitobgo.com</a></p>
      </LegalSection>

      <nav className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-5 text-sm font-semibold">
        <Link href="/" className="text-cocoa hover:underline">Bosh sahifa</Link>
        <Link href="/privacy" className="text-cocoa hover:underline">Maxfiylik siyosati</Link>
        <Link href="/account/delete" className="text-cocoa hover:underline">Hisobni o‘chirish</Link>
      </nav>
    </LegalPage>
  );
}
