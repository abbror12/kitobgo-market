import type { Metadata } from "next";
import { Clock3, Mail, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

// Bu sahifa ilgari serverda qo'lda joylangan statik HTML edi (/var/www/kitobgo,
// manbasi D:\Project\KitobApp\docs\legal\site\account\delete.html). O'sha yerdagi
// README rejasiga ko'ra Next'ga ko'chirildi — MATN jonli nusxadan o'zgartirilmasdan
// olindi, faqat dizayn sayt qobig'iga o'tdi.
//
// DIQQAT: manzil (/account/delete) Play Console'dagi "hisobni o'chirish" maydonida
// va ilovaning core/Legal.kt faylida turibdi — uni o'zgartirib bo'lmaydi.
export const metadata: Metadata = {
  title: "Hisobni o‘chirish — KitobGo",
  description: "KitobGo hisobingizni va unga bog‘liq ma’lumotlarni o‘chirish tartibi: ilovaning o‘zida yoki so‘rov orqali, nima o‘chadi, nima saqlanadi, qancha vaqt ketadi.",
  alternates: { canonical: "/account/delete" },
};

export default function AccountDeletePage() {
  return (
    <LegalPage
      eyebrow="Hisob"
      title="Hisobni o‘chirish"
      updated={<>KitobGo — onlayn kitob do‘koni ilovasi (<code className="rounded bg-sand px-1.5 py-0.5 text-[13px] text-ink">uz.kitobgo.app</code>)</>}
    >
      <p className="mt-4">
        Bu sahifa KitobGo hisobingizni va unga bog‘liq shaxsiy ma’lumotlarni butunlay o‘chirish uchun.
        Ilova o‘rnatilgan bo‘lishi shart emas.
      </p>

      <LegalSection title="Eng tezi — ilovaning o‘zida">
        <div className="flex items-start gap-3 rounded-2xl border border-line bg-navSurface p-4">
          <Smartphone size={20} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
          <p><strong className="text-ink">Profil → Hisobni o‘chirish</strong> → tasdiqlash. Hisob darhol o‘chadi va barcha qurilmalarda sessiya yopiladi.</p>
        </div>
        <p>
          Bitta istisno: yo‘lda ketayotgan (hali yetkazilmagan yoki bekor qilinmagan) buyurtmangiz
          bo‘lsa, ilova avval uni yakunlashni yoki bekor qilishni so‘raydi — buyurtmani topshirish
          uchun qabul qiluvchining ismi kerak bo‘ladi.
        </p>
      </LegalSection>

      <LegalSection title="Yoki so‘rov yuboring">
        <p>
          Ilovadan foydalana olmasangiz, hisobingiz ro‘yxatdan o‘tkazilgan <strong className="text-ink">elektron
          pochtadan</strong> yoki <strong className="text-ink">telefon raqamdan</strong> quyidagi manzilga yozing:
        </p>
        <div className="flex items-start gap-3 rounded-2xl border border-line bg-navSurface p-4">
          <Mail size={20} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
          <p>
            <strong className="text-ink">Kimga:</strong> <a href="mailto:support@kitobgo.com" className="font-semibold text-brand hover:underline">support@kitobgo.com</a><br />
            <strong className="text-ink">Mavzu:</strong> Hisobni o‘chirish<br />
            <strong className="text-ink">Matnda:</strong> hisobingizga bog‘langan telefon raqami yoki elektron pochta.
          </p>
        </div>
        <p>
          Boshqa manzildan kelgan so‘rovni bajara olmaymiz — bu birovning hisobini o‘chirib
          yuborishning oldini oladi. Kerak bo‘lsa shaxsingizni tasdiqlash uchun qo‘shimcha savol
          beramiz. So‘rov <strong className="text-ink">2 ish kunida</strong> bajariladi va bajarilgani
          haqida javob yozamiz.
        </p>
      </LegalSection>

      <LegalSection title="Nima o‘chadi">
        <ul className="space-y-2">
          {[
            "Ismingiz, telefon raqamingiz va elektron pochtangiz",
            "Parolingiz va Google/Apple orqali kirish bog‘lamalari",
            "Saqlangan yetkazib berish manzillaringiz",
            "Savatingiz va bildirishnomalaringiz",
            "Barcha ochiq sessiyalar — hisobga kirib bo‘lmay qoladi",
            "Sharhlaringiz anonimlashtiriladi: matni qoladi, muallif sifatida ismingiz o‘rniga «Mijoz» ko‘rsatiladi",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <Trash2 size={16} className="mt-1 shrink-0 text-brand" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="Nima saqlanib qoladi">
        <div className="flex items-start gap-3 rounded-2xl border border-line bg-navSurface p-4">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
          <p>
            <strong className="text-ink">Buyurtma va to‘lov yozuvlari</strong> — 5 yil davomida. Buni biz
            tanlamaymiz: buxgalteriya va soliq qonunchiligi shuni talab qiladi. Bu yozuvlarda qabul
            qiluvchining ismi, telefoni va ko‘cha manzili <strong className="text-ink">o‘chiriladi</strong>,
            ya’ni ular endi sizga bog‘lanmaydi.
          </p>
        </div>
        <p>
          Sevimli kitoblar ro‘yxati serverda saqlanmaydi — u faqat telefoningizda edi va ilovani
          o‘chirsangiz o‘zi yo‘qoladi.
        </p>
      </LegalSection>

      <LegalSection title="Qancha vaqt ketadi">
        <div className="flex items-start gap-3 rounded-2xl border border-line bg-navSurface p-4">
          <Clock3 size={20} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
          <p>
            Ilovaning o‘zida — <strong className="text-ink">darhol</strong>. Pochta orqali so‘rov —{" "}
            <strong className="text-ink">2 ish kunida</strong>. Bajarilgandan keyin hisobni tiklab
            bo‘lmaydi — istasangiz keyin yangisini ochishingiz mumkin.
          </p>
        </div>
      </LegalSection>

      <LegalSection title="Savol bo‘lsa">
        <p>
          <a href="mailto:support@kitobgo.com" className="font-semibold text-brand hover:underline">support@kitobgo.com</a>
          {" · "}
          <a href="tel:+998774488080" className="font-semibold text-brand hover:underline">+998 77 448 80 80</a>
        </p>
        <p>
          Ma’lumotlaringiz bilan nima qilishimiz haqida to‘liq ma’lumot:{" "}
          <Link href="/privacy" className="font-semibold text-brand hover:underline">Maxfiylik siyosati</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
