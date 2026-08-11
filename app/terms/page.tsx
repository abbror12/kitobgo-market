import type { Metadata } from "next";
import Link from "next/link";
import { DraftNotice, LegalPage, LegalSection, Ph } from "@/components/legal/LegalPage";

// Matn /var/www/kitobgo/terms.html dan o'zgartirilmasdan ko'chirildi.
// Qoralama banneri va to'ldirilmagan [ ] joylar ataylab saqlangan — ular
// yurist tasdiqlagandan keyin, alohida qarordan so'ng olib tashlanadi.

export const metadata: Metadata = {
  title: "Foydalanish shartlari — KitobGo",
  description: "KitobGo onlayn kitob do'koni bilan xaridor o'rtasidagi ommaviy oferta: buyurtma, to'lov, yetkazib berish, qaytarish.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Ommaviy oferta"
      title="Foydalanish shartlari"
      updated={<>Ommaviy oferta · Oxirgi yangilanish: <Ph>[SANA]</Ph></>}
    >
      <DraftNotice>
        <p><strong>Bu qoralama, tasdiqlangan huquqiy hujjat emas.</strong></p>
        <p>
          Ilovaning haqiqiy xatti-harakati (bekor qilish, narx o‘zgarishi, to‘lov tartibi) koddan
          olingan va to‘g‘ri. Lekin oferta shartlari, qaytarish muddatlari va javobgarlik chegaralari
          O‘zbekiston Fuqarolik kodeksi hamda “Iste’molchilar huquqlarini himoya qilish to‘g‘risida”gi
          qonunga mos bo‘lishi kerak — buni yurist tekshirsin. Belgilangan joylarni to‘ldiring,
          keyin shu ogohlantirishni o‘chiring.
        </p>
      </DraftNotice>

      <LegalSection title="1. Umumiy qoidalar">
        <p>1.1. Ushbu shartlar <Ph>[YURIDIK NOM]</Ph> (keyingi o‘rinlarda — “Sotuvchi”, STIR <Ph>[RAQAM]</Ph>, manzil <Ph>[MANZIL]</Ph>) va KitobGo ilovasidan foydalanuvchi jismoniy shaxs (keyingi o‘rinlarda — “Xaridor”) o‘rtasidagi munosabatni tartibga soladi.</p>
        <p>1.2. Ilovadan foydalanish, ro‘yxatdan o‘tish yoki buyurtma berish ushbu shartlarga to‘liq rozilik bildirish hisoblanadi. Rozi bo‘lmasangiz, ilovadan foydalanmang.</p>
        <p>1.3. <Link href="/privacy" className="font-semibold text-brand hover:underline">Maxfiylik siyosati</Link> ushbu shartlarning ajralmas qismidir.</p>
      </LegalSection>

      <LegalSection title="2. Hisob">
        <p>2.1. Buyurtma berish uchun telefon raqami (SMS kod), elektron pochta yoki Google/Apple hisobi orqali kirish talab qilinadi. Katalogni ko‘rish uchun hisob shart emas.</p>
        <p>2.2. Xaridor kiritgan ma’lumotlarning to‘g‘riligi uchun javobgardir. Noto‘g‘ri telefon yoki manzil tufayli yetkazib berilmagan buyurtma uchun Sotuvchi javob bermaydi.</p>
        <p>2.3. Hisobga kirish uchun kelgan SMS kodni yoki parolni boshqalarga bermang. Hisobingizdan qilingan harakatlar sizning harakatingiz hisoblanadi.</p>
        <p>2.4. Xaridor istalgan vaqtda <Link href="/account/delete" className="font-semibold text-brand hover:underline">hisobini o‘chirishi</Link> mumkin.</p>
      </LegalSection>

      <LegalSection title="3. Tovar va narx">
        <p>3.1. Ilovada sotiladigan tovar — <strong className="text-ink">jismoniy kitoblar</strong>. Raqamli mahsulot yoki obuna sotilmaydi.</p>
        <p>3.2. Kitob muqovasidagi rasm va tavsif ma’lumot uchun; nashr yili yoki muqova dizayni noshir tomonidan o‘zgartirilgan bo‘lishi mumkin.</p>
        <p>3.3. Narxlar O‘zbekiston so‘mida, QQS <Ph>[hisobga olingan / olinmagan — kerakligini qoldiring]</Ph>.</p>
        <p>3.4. <strong className="text-ink">Narx buyurtma tasdiqlangunicha o‘zgarishi mumkin.</strong> Agar savatga solgan paytdagi narx buyurtma berish paytida boshqacha bo‘lsa, ilova yangi narxni ko‘rsatadi va Xaridordan tasdiq so‘raydi. Tasdiqlanmaguncha buyurtma rasmiylashtirilmaydi.</p>
        <p>3.5. Omborda yetarli nusxa bo‘lmasa, ilova mavjud sonni ko‘rsatadi va buyurtma o‘sha songa moslashtiriladi.</p>
      </LegalSection>

      <LegalSection title="4. Buyurtma va to‘lov">
        <p>4.1. Buyurtma quyidagi tartibda rasmiylashtiriladi: savat → manzil va qabul qiluvchi → buyurtmani tasdiqlash → to‘lov usulini tanlash.</p>
        <p>4.2. To‘lov usullari: <Ph>[Click]</Ph>, <Ph>[Payme]</Ph>, <strong className="text-ink">naqd pul kuryerga</strong>. Mavjud usullar ro‘yxati ilovada ko‘rsatiladi va o‘zgarishi mumkin.</p>
        <p>4.3. Onlayn to‘lovda karta ma’lumotlari to‘lov tizimining o‘z sahifasida kiritiladi va Sotuvchiga uzatilmaydi.</p>
        <p>4.4. <strong className="text-ink">To‘lanmagan buyurtma <Ph>[30 daqiqa]</Ph> ichida avtomatik bekor qilinadi</strong> va band qilingan kitoblar omborga qaytariladi.</p>
        <p>4.5. Naqd to‘lov tanlanganda buyurtma darhol ishlovga o‘tadi, to‘lov esa kuryerga yetkazib berish paytida amalga oshiriladi.</p>
      </LegalSection>

      <LegalSection title="5. Yetkazib berish">
        <p>5.1. Yetkazib berish <Ph>[HUDUDLAR RO‘YXATI yoki “ilovada ko‘rsatilgan hududlar”]</Ph> bo‘ylab kuryer orqali amalga oshiriladi.</p>
        <p>5.2. Yetkazib berish narxi hududga qarab hisoblanadi va buyurtmani tasdiqlashdan oldin ko‘rsatiladi. <Ph>[SUMMA]</Ph> so‘mdan yuqori buyurtmalarga yetkazib berish bepul.</p>
        <p>5.3. Yetkazib berish muddati — <Ph>[N]</Ph> ish kuni. Muddat taxminiy; ombor yoki logistika sabab kechikish mumkin, bu haqda Xaridorga xabar beriladi.</p>
        <p>5.4. Kuryer kelganda kitobni <strong className="text-ink">qabul qilishdan oldin ko‘zdan kechiring</strong>. Tashqi shikast borligi o‘sha paytda aytilishi kerak.</p>
      </LegalSection>

      <LegalSection title="6. Bekor qilish, qaytarish va pulni qaytarish">
        <p>6.1. Xaridor buyurtmani ilova orqali <Ph>[qaysi holatlarda ekanini yozing — kodda “Bekor qilish” tugmasi bor, lekin qaysi statusgacha ishlashini backend belgilaydi]</Ph> bekor qilishi mumkin.</p>
        <p>6.2. Qonunga muvofiq Xaridor sifatli tovarni <Ph>[14]</Ph> kun ichida qaytarishi mumkin, agar tovar ishlatilmagan va tovar ko‘rinishi saqlangan bo‘lsa. <Ph>[Kitob uchun qonundagi istisnolarni yurist bilan tekshiring]</Ph></p>
        <p>6.3. Nuqsonli yoki noto‘g‘ri kitob yetkazilgan bo‘lsa, <Ph>[N]</Ph> kun ichida almashtirish yoki to‘liq pulni qaytarish amalga oshiriladi. Yetkazib berish xarajati Sotuvchi zimmasida.</p>
        <p>6.4. Pul to‘langan usul orqali <Ph>[N]</Ph> ish kunida qaytariladi.</p>
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
        <p>10.1. Nizolar avval muzokara yo‘li bilan hal qilinadi. Murojaat: <Ph>[support@...]</Ph>, javob muddati <Ph>[N]</Ph> ish kuni.</p>
        <p>10.2. Kelishuvga erishilmasa, nizo O‘zbekiston Respublikasi qonunchiligiga muvofiq <Ph>[SUD — masalan “Toshkent shahar tumanlararo iqtisodiy sudi”]</Ph> da ko‘riladi.</p>
      </LegalSection>

      <LegalSection title="11. Shartlarning o‘zgarishi">
        <p>Sotuvchi shartlarni o‘zgartirishi mumkin. Yangi tahrir shu sahifada e’lon qilinadi. O‘zgarishdan keyin ilovadan foydalanishni davom ettirish yangi shartlarga rozilik hisoblanadi.</p>
      </LegalSection>

      <LegalSection title="12. Rekvizitlar">
        <p><Ph>[YURIDIK NOM]</Ph> · STIR <Ph>[RAQAM]</Ph> · <Ph>[MANZIL]</Ph> · <Ph>[TELEFON]</Ph> · <Ph>[EMAIL]</Ph> · <Ph>[BANK REKVIZITLARI]</Ph></p>
      </LegalSection>

      <nav className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-5 text-sm font-semibold">
        <Link href="/" className="text-brand hover:underline">Bosh sahifa</Link>
        <Link href="/privacy" className="text-brand hover:underline">Maxfiylik siyosati</Link>
        <Link href="/account/delete" className="text-brand hover:underline">Hisobni o‘chirish</Link>
      </nav>
    </LegalPage>
  );
}
