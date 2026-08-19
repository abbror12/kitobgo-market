import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, LegalSubheading, LegalTable } from "@/components/legal/LegalPage";

// Matn manbayi: D:\Project\KitobApp\docs\legal\maxfiylik-siyosati.md (2026-08-12 tahriri).
// Hujjat egasi tomonidan to'ldirilgan — qoralama banneri olib tashlangan.
//
// 6-banddagi ichki eslatma bloki ("BU BO'LIM HOZIR ILOVADA ISHLAMAYDI —
// docs/PLAY_RELEASE.md ga qarang") ATAYLAB ko'chirilmadi: u jamoaga yozilgan
// ichki izoh, mijozga mo'ljallangan matn emas.

export const metadata: Metadata = {
  title: "Maxfiylik siyosati — KitobGo",
  description: "KitobGo ilovasi va sayti qanday shaxsiy ma'lumot yig'ishi, ular kimga berilishi va qancha saqlanishi.",
  alternates: { canonical: "/privacy" },
};

const TH = "bg-navSurface px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-ink";
const TD = "border-t border-line px-3 py-2.5 align-top";
const ROW_TH = "border-t border-line bg-navSurface px-3 py-2.5 text-left align-top font-bold text-ink";

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Shaxsiy ma’lumotlar"
      title="Maxfiylik siyosati"
      updated={<>Oxirgi yangilanish: 1.2.2026 · Amal qilish boshlangan sana: 1.2.2026</>}
    >
      <LegalSection title="1. Biz kimmiz">
        <p>KitobGo — onlayn kitob do‘koni mobil ilovasi.</p>
        <LegalTable>
          <tbody>
            <tr><th className={ROW_TH}>Operator (ma’lumot egasi)</th><td className={TD}>“KitobGo” YaTT ro‘yxatdan o‘tish raqami: 6985950</td></tr>
            <tr><th className={ROW_TH}>STIR / INN</th><td className={TD}>626762785</td></tr>
            <tr><th className={ROW_TH}>Manzil</th><td className={TD}>Toshkent sh., Olmozor, Qamarniso ko‘chasi</td></tr>
            <tr><th className={ROW_TH}>Aloqa</th><td className={TD}><a href="mailto:support@kitobgo.com" className="font-semibold text-brand hover:underline">support@kitobgo.com</a> · <a href="tel:+998774488080" className="font-semibold text-brand hover:underline">+998 77 448 80 80</a></td></tr>
          </tbody>
        </LegalTable>
        <p>Ushbu siyosat KitobGo Android ilovasiga va <strong className="text-ink">kitobgo.com</strong> saytiga taalluqli.</p>
      </LegalSection>

      <LegalSection title="2. Qanday ma’lumotlarni yig‘amiz">
        <p>Biz <strong className="text-ink">faqat ilova ishlashi uchun zarur</strong> ma’lumotlarni yig‘amiz. Reklama uchun hech narsa yig‘ilmaydi va reklama identifikatori (Advertising ID) umuman ishlatilmaydi.</p>

        <LegalSubheading>2.1. Siz o‘zingiz kiritadigan ma’lumotlar</LegalSubheading>
        <LegalTable>
          <thead><tr><th className={TH}>Ma’lumot</th><th className={TH}>Qachon</th><th className={TH}>Nima uchun</th></tr></thead>
          <tbody>
            <tr><td className={TD}>Telefon raqami</td><td className={TD}>Hisobga kirishda (SMS kod)</td><td className={TD}>Shaxsni tasdiqlash, buyurtma bo‘yicha bog‘lanish</td></tr>
            <tr><td className={TD}>Elektron pochta va parol</td><td className={TD}>Email orqali ro‘yxatdan o‘tganda</td><td className={TD}>Hisobga kirish, parolni tiklash</td></tr>
            <tr><td className={TD}>Ism-familiya</td><td className={TD}>Ixtiyoriy, profilda</td><td className={TD}>Murojaat qilish, yetkazib berish hujjatlari</td></tr>
            <tr><td className={TD}>Yetkazib berish manzili: hudud, tuman, ko‘cha, mo‘ljal</td><td className={TD}>Buyurtma berishda</td><td className={TD}>Buyurtmani yetkazib berish</td></tr>
            <tr><td className={TD}>Qabul qiluvchining ismi va telefoni</td><td className={TD}>Buyurtma berishda</td><td className={TD}>Kuryer bog‘lanishi uchun</td></tr>
            <tr><td className={TD}>Buyurtmaga izoh</td><td className={TD}>Ixtiyoriy</td><td className={TD}>Yetkazib berishni aniqlashtirish</td></tr>
            <tr><td className={TD}>Sharh: baho, sarlavha, matn</td><td className={TD}>Kitobga sharh yozganda</td><td className={TD}>Sharhni saytda ko‘rsatish</td></tr>
          </tbody>
        </LegalTable>

        <LegalSubheading>2.2. Avtomatik yaratiladigan ma’lumotlar</LegalSubheading>
        <LegalTable>
          <thead><tr><th className={TH}>Ma’lumot</th><th className={TH}>Nima uchun</th></tr></thead>
          <tbody>
            <tr><td className={TD}>Buyurtmalar tarixi (kitoblar, narx, holat, sana)</td><td className={TD}>Buyurtmani bajarish, buxgalteriya, kafolat</td></tr>
            <tr><td className={TD}>To‘lov holati va to‘lov tizimi identifikatori</td><td className={TD}>To‘lovni tasdiqlash</td></tr>
            <tr><td className={TD}>Sessiya tokenlari (kirish va yangilash tokeni)</td><td className={TD}>Har safar qayta kirmasligingiz uchun</td></tr>
            <tr><td className={TD}>Bildirishnomalar va ularning o‘qilgan holati</td><td className={TD}>Buyurtma holati haqida xabar berish</td></tr>
          </tbody>
        </LegalTable>

        <LegalSubheading>2.3. Nima yig‘ilmaydi</LegalSubheading>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>Joylashuv (GPS) — ilovada bunday ruxsat umuman yo‘q.</li>
          <li>Kontaktlar, kamera, mikrofon, fayllar, kalendar — hech biri so‘ralmaydi.</li>
          <li>Reklama identifikatori (AD_ID) — ishlatilmaydi.</li>
          <li>Analitika yoki xatoliklarni kuzatish (Firebase, Crashlytics va h.k.) — hozircha ulanmagan.</li>
        </ul>
        <p className="mt-3">Ilova telefonda <strong className="text-ink">faqat bitta ruxsat</strong> so‘raydi: internetga ulanish.</p>
      </LegalSection>

      <LegalSection title="3. Savat va sevimlilar — telefonning o‘zida">
        <p>Savatingiz va sevimli kitoblaringiz <strong className="text-ink">serverga yuborilmaydi</strong>, ular faqat telefoningiz xotirasida saqlanadi. Ilovani o‘chirsangiz, ular ham yo‘qoladi.</p>
      </LegalSection>

      <LegalSection title="4. Ma’lumotlaringiz kimga beriladi">
        <p>Biz ma’lumotlaringizni <strong className="text-ink">sotmaymiz</strong> va reklama tarmoqlariga bermaymiz. Ular faqat quyidagilarga, faqat kerakli hajmda uzatiladi:</p>
        <LegalTable>
          <thead><tr><th className={TH}>Kim</th><th className={TH}>Nima uzatiladi</th><th className={TH}>Nima uchun</th></tr></thead>
          <tbody>
            <tr><td className={TD}>Yetkazib berish xizmati / kuryer</td><td className={TD}>Qabul qiluvchining ismi, telefoni, manzili</td><td className={TD}>Buyurtmani yetkazish</td></tr>
            <tr><td className={TD}>To‘lov tizimlari (Click, Payme)</td><td className={TD}>Buyurtma raqami va summasi</td><td className={TD}>To‘lovni amalga oshirish. <strong className="text-ink">Karta ma’lumotlari bizga umuman kelmaydi</strong> — ularni to‘lov tizimining o‘z sahifasida kiritasiz</td></tr>
            <tr><td className={TD}>Google (Google orqali kirishni tanlasangiz)</td><td className={TD}>Google hisobingizdagi ism va email</td><td className={TD}>Shaxsni tasdiqlash</td></tr>
            <tr><td className={TD}>Apple (Apple orqali kirishni tanlasangiz)</td><td className={TD}>Apple bergan identifikator va email</td><td className={TD}>Shaxsni tasdiqlash</td></tr>
            <tr><td className={TD}>Vakolatli davlat organlari</td><td className={TD}>Qonun talab qilgan hajmda</td><td className={TD}>Qonuniy talab bo‘yicha</td></tr>
          </tbody>
        </LegalTable>
      </LegalSection>

      <LegalSection title="5. Qancha muddat saqlanadi">
        <LegalTable>
          <thead><tr><th className={TH}>Ma’lumot</th><th className={TH}>Muddat</th></tr></thead>
          <tbody>
            <tr><td className={TD}>Hisob ma’lumotlari (ism, telefon, email)</td><td className={TD}>Hisob mavjud bo‘lgunicha</td></tr>
            <tr><td className={TD}>Manzillar</td><td className={TD}>Siz o‘chirgunizgacha yoki hisob o‘chirilgunicha</td></tr>
            <tr><td className={TD}>Buyurtmalar va to‘lov yozuvlari</td><td className={TD}>Hisob o‘chirilgandan keyin ham <strong className="text-ink">5 yil</strong> — buxgalteriya va soliq qonunchiligi talabi</td></tr>
            <tr><td className={TD}>Sharhlar</td><td className={TD}>Hisob o‘chirilganda anonimlashtiriladi</td></tr>
            <tr><td className={TD}>Sessiya tokenlari</td><td className={TD}>Chiqqaningizda darhol o‘chiriladi; yangilash tokeni 30 kun</td></tr>
          </tbody>
        </LegalTable>
      </LegalSection>

      <LegalSection title="6. Sizning huquqlaringiz">
        <p>Siz quyidagilarga haqlisiz:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-ink">Ko‘rish</strong> — qanday ma’lumot saqlanayotganini so‘rash.</li>
          <li><strong className="text-ink">Tuzatish</strong> — ism, telefon, manzilni ilovaning o‘zida o‘zgartirish.</li>
          <li><strong className="text-ink">O‘chirish</strong> — hisobingizni va unga bog‘liq ma’lumotlarni o‘chirtirish.</li>
          <li><strong className="text-ink">Roziligingizni qaytarib olish</strong> — bildirishnomalarni o‘chirish, hisobni yopish.</li>
        </ul>

        <LegalSubheading>Hisobni qanday o‘chirasiz</LegalSubheading>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5">
          <li>Ilovada: <strong className="text-ink">Profil → Hisobni o‘chirish</strong>.</li>
          <li>Yoki ilovasiz: <Link href="/account/delete" className="font-semibold text-brand hover:underline">kitobgo.com/account/delete</Link> sahifasi orqali.</li>
          <li>Yoki <a href="mailto:support@kitobgo.com" className="font-semibold text-brand hover:underline">support@kitobgo.com</a> ga hisobingiz telefon raqamidan yozib.</li>
        </ol>
        <p className="mt-3">So‘rov 2 ish kunida bajariladi. Buyurtma va to‘lov yozuvlari 5-banddagi muddat davomida saqlanib qoladi — bu qonun talabi, biz undan voz kecha olmaymiz.</p>
      </LegalSection>

      <LegalSection title="7. Xavfsizlik">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Ilova bilan server o‘rtasidagi barcha aloqa HTTPS orqali shifrlanadi.</li>
          <li>Parollar serverda encoder bilan xeshlanadi, ochiq holda saqlanmaydi.</li>
          <li>Sessiya tokenlari telefoningizning boshqa ilovalarga yopiq xotirasida saqlanadi. Tokenlar Google Drive zaxirasiga <strong className="text-ink">kirmaydi</strong>.</li>
          <li>Bularga qaramay, internet orqali uzatishning 100% xavfsiz usuli yo‘q.</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. O‘zgarishlar">
        <p>Siyosat o‘zgarsa, yangi tahriri shu sahifada e’lon qilinadi va yuqoridagi sana yangilanadi. Muhim o‘zgarishlar haqida ilovadagi bildirishnoma orqali xabar beramiz.</p>
      </LegalSection>

      <LegalSection title="9. Bog‘lanish">
        <p>Maxfiylik bo‘yicha savollar: <a href="mailto:support@kitobgo.com" className="font-semibold text-brand hover:underline">support@kitobgo.com</a> · <a href="tel:+998774488080" className="font-semibold text-brand hover:underline">+998 77 448 80 80</a> · Toshkent sh., Olmozor, Qamarniso ko‘chasi</p>
      </LegalSection>

      <nav className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-5 text-sm font-semibold">
        <Link href="/" className="text-brand hover:underline">Bosh sahifa</Link>
        <Link href="/terms" className="text-brand hover:underline">Foydalanish shartlari</Link>
        <Link href="/account/delete" className="text-brand hover:underline">Hisobni o‘chirish</Link>
      </nav>
    </LegalPage>
  );
}
