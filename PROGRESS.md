# kitobgo-market — veb-do'kon (storefront)

Next.js 15 (App Router) + Tailwind. KitobGo'ning mijozlarga ko'rinadigan veb-do'koni:
`https://kitobgo.com`. Backend — `D:\Project\kitob-app-backend` (`https://api.kitobgo.com/api/v1`),
shartnoma **faqat** `docs/API.md` (o'sha repoda).

> 2026-08-10: sayt eski (boshqa) backenddan haqiqiy KitobGo backendiga to'liq o'tkazildi.
> Eski `/api/products`, anonim buyurtma, IndexedDB oflayn-navbat — olib tashlangan.
>
> 2026-08-11: sayt mobil ilova brendiga qayta bo'yaldi — to'q yashil + oltin (Inter)
> o'rniga iliq krem + terrakota (Lora serif). Pastdagi "Dizayn tizimi" bo'limiga qarang.
>
> 2026-08-14: emailni tasdiqlash va parolni tiklash **havoladan kodga** o'tdi (backend
> `319b042`, `docs/MIGRATION_EMAIL_CODES.md`). `/verify-email` va `/reset-password`
> sahifalari va ularning komponentlari **o'chirildi** — ikkala oqim ham kirish panelining
> ichida. Pastdagi "Kirish" bo'limiga qarang.
>
> 2026-08-19: **veb palitrasi logotipga o'tkazildi**, ikki bosqichda. Avval terrakota
> (#A34A24) logotip navy'siga (#101D7A) almashtirildi, iliq bej qog'oz esa qoldirilgan
> edi — foydalanuvchi buni rad etdi: «sariqqa yaqin rang ko'k bilan kelishmayapti, to'q
> ko'k bo'g'ib tashlaydi, asaxiydan ilhomlan». Shu bahoga ko'ra ikkinchi bosqichda sayt
> yengil marketplace ko'rinishiga o'tdi: oq/och-sovuq fonlar, katta to'q panellar yo'q,
> ko'k faqat urg'uda va u logotip ohangining yorqin toni (#2745D6). `cocoa`/`cocoaDark`
> tokenlari `brand`/`brandDark` deb qayta nomlandi, `inkButton` olib tashlandi.
> Shu sababli **veb endi ilova palitrasidan ajralgan**.

## Dizayn tizimi

**Brend manbayi — logotip** (`C:\Users\USER\Desktop\logo.PNG`, navy `#101D7A`), lekin
to'q navy **faqat logotipning o'zida**. Yo'nalish — asaxiy uslubidagi yengil marketplace:
oq sahifa, oq kartochka, och sovuq-kulrang to'ldirishlar, ko'k esa kam va faqat urg'uda
(havola, narx, tugma, faol tab) — logotip ohangining yorqin toni `#2745D6` bilan.
Katta to'q ko'k yuzalar ataylab yo'q («bo'g'ib tashlaydi»), iliq bej ham yo'q («sariqqa
yaqin rang ko'k bilan kelishmaydi»). Shu ikkinchi sababdan **qoida: `gold` sariq faqat
reyting yulduzlari va badge uchun — uni ko'k yuza yoniga qo'ymang** (StatisticsBanner
ikonkalari shuning uchun oq).

> **Veb endi ilova palitrasidan ajralgan** (2026-08-19). Ilova hali terrakotada
> (`D:\Project\kitobgo-flutter\lib\ui\theme\colors.dart`), veb esa navy'da. Tuzilma — token
> nomlari, ularning ma'nosi va `status_colors.dart` mantiqi — o'sha-o'sha, faqat qiymatlar
> ajradi. Ikkalasini yana birlashtirish kerak bo'lsa, o'zgarish **ilovada** bo'lishi kerak:
> aks holda ilova logotipga zid rangda qolaveradi.

Tokenlarning **nomlari barqaror**: qiymatni o'zgartirish hech narsani buzmaydi, nomni
o'zgartirish butun saytga tegadi.

Palitra [tailwind.config.ts](tailwind.config.ts) da: `page` `cream` `sand` `navSurface`
`brand` `brandDark` `inkButton` `ink` `bodyText` `muted` `line` `lineSoft` `field`
`chevron` `gold` + `success`/`warning`/`danger` va ularning `*Soft` juftlari.

**Qo'llanishi (ilovadagidek):**

| Element | Token |
|---|---|
| Sahifa foni | `page` (oq) |
| Kartochka, input, panel | `cream` |
| Sticky header, to'liq kenglikdagi tasmalar | `navSurface` (och sovuq-kulrang) + `border-y border-line` |
| Asosiy tugma | `bg-brand text-cream`, hover `bg-brandDark` (yorqin ko'k, to'q navy emas) |
| Ikkilamchi tugma, havola, faol tab | `brand` (hover `brandDark`) |
| Narx | sahifada `brand`; kartochkada `ink` (zich to'rda ko'k faqat CTA'da), eski narx `bodyText` ustidan chizilgan + `−N%` chip `dangerSoft/danger` |
| Yumshoq to'ldirish: ikonka disklari, tanlangan pill | `sand` |
| Buyurtma status badge'lari | `status_colors.dart` mantiqiga mos: hal bo'lgan → `successSoft/success`, yo'ldagi → `warningSoft/brandDark`, to'xtagan → `dangerSoft/danger`, neytral → `sand/bodyText` |

**Tipografiya.** Lora (serif) — `font-serif` orqali **faqat** sarlavhalar, kitob nomlari va
narxlar uchun; qolgan hamma matn tizim sans-serif'da. Lora `next/font` bilan
[app/layout.tsx](app/layout.tsx) da `--font-lora` sifatida ulanadi (global emas). Kichik
katta-harfli yorliqlar uchun `.micro-label` (sans, 11.5px, letter-spacing 1.0) va `.eyebrow`.

**Diqqat qilinadigan to'rt joy** (kelajakdagi o'zgarishlarda ham shu qoidalar):

1. **`tailwind.config.ts` yolg'iz yetarli emas.** [app/globals.css](app/globals.css) ichida
   xom `rgba()` qiymatlar bor: soyalar (`shadow-soft/card` — ink #151A33, `shadow-button` —
   brand #2745D6 asosida), fokus halqasi (`outline: rgba(39,69,214,.35)` — brand) va
   `.faq-item[open] .faq-plus` foni. Uchta komponentda ham qattiq yozilgan qiymat bor:
   [StoreShell](components/layout/StoreShell.tsx) (sticky header soyasi),
   [BookCardActions](components/product/BookCardActions.tsx) (savat tugmasi soyasi) va
   [HeroSection](components/home/HeroSection.tsx) (yumshoq ko'k radial fon).
   Palitra o'zgarsa bularni ham yangilang.
2. **`muted` (#82879B) cream fonda 3.50:1 — WCAG AA dan past.** Ilovada bu ataylab, faqat
   bezak uchun. Webda u **faqat placeholder** rangi sifatida ishlatiladi (globals.css dagi
   `::placeholder`); mijoz o'qishi kerak bo'lgan har qanday matn — `bodyText` (7.39:1).
3. **Kartochka yuzasi (`cream`) endi sof oq** — page bilan farqi yo'q, shuning uchun
   kartochkalar **har doim** `border-line` + `shadow-soft` bilan, to'liq kenglikdagi
   tasmalar esa `navSurface` + `border-y` bilan ajratiladi (asaxiy uslubidagi oq
   kartochka). `cream` nomi tarixiy — qiymatni alohida oq deb o'zgartirmang, token bitta.
4. **Muqova ortidagi pastel fonlar** ([lib/store-api.ts](lib/store-api.ts) `colors` massivi
   va `data/*.ts` dagi `color` maydonlari) endi sovuq och tuslarda (#E8EEFA atrofida) —
   iliq bej pastel qo'shilsa ko'zga tashlanadi.

### Logotip

[components/layout/Logo.tsx](components/layout/Logo.tsx) → `public/images/logo.png`
(384×200, shaffof fon). Xuddi shu manbadan `app/icon.png` (favicon, 512) va
`app/apple-icon.png` (180, oq fonli — Apple shaffoflikni qora qiladi) chiqarilgan;
Next ularni fayl nomiga qarab o'zi ulaydi, `metadata.icons` yozilmagan.

Favicon — soddalashtirilgan belgi, to'liq logotip EMAS: 16 px da to'liq logotip
o'qib bo'lmas dog'ga aylanardi (Google keshida shunday ko'ringan). Shuning uchun
`app/icon.png` (512) va `app/favicon.ico` (16/32/48, PNG-embedded ICO) — navy
kvadrat ustida oq "K"; `app/apple-icon.png` (180) — xuddi shu, lekin burchaksiz to'liq
kvadrat (iOS o'zi maskalaydi, shaffof burchak qora bo'lib qolardi). /favicon.ico
mavjudligi shart: Google krauleri uni to'g'ridan-to'g'ri so'raydi, 404 bo'lsa
qidiruvda belgi chiqmaydi. JSON-LD `Organization.logo` esa to'liq yozuvli belgiga
(`/images/logo.png`) ko'rsatadi. `app/opengraph-image.png` (1200×630) — oq fonda
to'liq navy logotip (ulashish kartochkasi).

O'lchamlar: shapkada 52px balandlik (100px kenglik), mobil shapkada 40px (77px),
footerda 52px. Yozuv rasm ichida, shuning uchun yonida matn takrorlanmaydi — nomni `alt`
beradi.

**Manbadan qanday olingan.** `C:\Users\USER\Desktop\logo.PNG` — 500×500, **oq** fonli,
belgining o'zi navy `#101D7A`. Ikki amal bajarilgan (skript:
`scratchpad/extract-logo.js`, repoda saqlanmagan — qaytadan kerak bo'lsa shu tavsifdan
tiklanadi):

1. Oq fon **chekkadan flood fill** bilan olib tashlangan, ya'ni faqat tashqi oq yo'qolgan —
   harflar ichidagi oq joyida qolgan.
2. Har bir piksel oq va ko'kning aralashmasi sifatida qaralib, aralashuv darajasi
   `k = (255 − min(R,G,B)) / (255 − 17)` bilan o'lchangan; fon tomonda `k` alfaga,
   kontent tomonda esa oq ↔ brend rangi orasidagi aralashmaga aylantirilgan. Shu tufayli
   silliqlangan chetlar saqlanib qolgan, "arra tish" chiqmagan.

> **Belgi manbadagi asl navy rangida** (`#101D7A`) — 2026-08-19 dan. Sayt palitrasi undan
> chiqadi, lekin **teng emas**: `brand` tokeni logotip ohangining yorqin toni (#2745D6),
> chunki to'q navy interfeys elementi sifatida og'ir. Logotipni qayta bo'yash KERAK EMAS
> — u to'q holicha oq/och fonlarda turadi. Uchala fayl
> (`public/images/logo.png`, `app/icon.png`, `app/apple-icon.png`) bir xil rangda bo'lishi
> shart — ular eski nusxadan qayta bo'yash bilan olingan (har piksel oq ↔ brend
> aralashmasi sifatida qaralib, aralashuv darajasi ko'k kanaldan yechilgan).
>
> Krem (`navSurface`) va oq yuzalar uchun mo'ljallangan: nishonning o'zi to'q navy,
> harflar esa xira oq. To'q fonga qo'yish kerak bo'lsa, oq variant alohida chiqariladi.

### Navigatsiya qoidasi: bitta havola — bitta joy

Sayt "chrome"i (TopBar, Header, MainNavigation, MobileHeader, MobileBottomNavigation) beshta
alohida komponent, lekin ekranda birga turadi. Shuning uchun **bir yo'nalish bir ekranda
faqat bitta joyda** bo'ladi — mijoz "savat qaysi biri?" deb o'ylab qolmasin.

| Yo'nalish | Mobil (<768px) | Desktop (≥768px) |
|---|---|---|
| Bosh sahifa | pastki panel | MainNavigation (+ logotip) |
| Katalog | pastki panel | logotip yonidagi "Katalog" tugmasi |
| Savatcha | pastki panel (hisoblagich shu yerda) | Header ikonkasi (hisoblagich shu yerda) |
| Profil / Kirish | pastki panel | Header, eng o'ngda (`AccountLink`) |
| Sevimlilar | yuqori panel, yurakcha | Header ikonkasi |
| Kategoriyalar, Mualliflar, Yangi kelganlar, Blog, Biz haqimizda, Aloqa | burger menyu | MainNavigation |
| Telegram, Instagram | footer | TopBar + footer |

Shundan kelib chiqadigan "yo'q"lar (har birining yonida kod izohi bor, ataylab olib
tashlangan — qaytarib qo'shmang):

- `MobileHeader` da savat yo'q, `MobileBottomNavigation` da sevimlilar yo'q.
- Burger menyuda Bosh sahifa / Katalog / Shaxsiy kabinet yo'q — menyu ochilganda pastki
  panel ko'rinib turadi, ikkalasi bir ekranda takrorlanardi.
- `MainNavigation` da "Katalog" yo'q — tepada, 50px narida katta "Katalog" tugmasi bor.
- Header'da "Yordam" yo'q — u ham `/contact` ga borardi, MainNavigation'dagi "Aloqa" bilan
  bitta ekranda turardi.
- TopBar'da Blog / Biz haqimizda / Aloqa yo'q — o'sha uchtasi to'g'ridan-to'g'ri pastdagi
  MainNavigation'da.

Ataylab qoldirilgan ikkita "takror": logotip + "Bosh sahifa" (odatiy naqsh) va breadcrumb
(u navigatsiya emas, joylashuvni ko'rsatadi).

## Arxitektura

- **Ochiq katalog** (kitoblar, kategoriyalar, hududlar, kotirovkalar) — server komponentlardan
  to'g'ridan-to'g'ri backendga: [lib/store-api.ts](lib/store-api.ts). Tokensiz, `Accept-Language: uz`.
- **Token talab qiladigan hamma narsa BFF orqali**: brauzer faqat sayt ichki `/api/*`
  route handler'lariga murojaat qiladi, ular backendga token bilan chiqadi.
  Tokenlar brauzerga berilmaydi — `kg_at` (access) va `kg_rt` (refresh) **httpOnly cookie'larda**.
- **Refresh discipline** (API.md §1: refresh token bir martalik!):
  [lib/server/session.ts](lib/server/session.ts) — jarayon ichida refresh-token bo'yicha
  deduplikatsiya + 60s natija keshi (eski cookie bilan kechikkan parallel so'rovlar retired
  tokenni backendga qayta ko'rsatmaydi). **Diqqat: bu bitta Node jarayoni uchun.** Bir nechta
  instansiyaga scale qilishda sticky session yoki umumiy qulf (Redis) kerak.
- Xatolar hamma qatlamda RFC 9457 problem+json ko'rinishida oqadi; mijoz **faqat `code`
  bo'yicha shoxlanadi**, `detail` foydalanuvchiga ko'rsatiladi (backend uz tilida beradi).
- Savat va sevimlilar **localStorage'da** (`kitobgo:cart:v2`, `kitobgo:favorites:v2` —
  [lib/client-store.ts](lib/client-store.ts)). Kalitlar ataylab v2: eski backend id'lari yangi
  katalog bilan mos emas edi.
- **`Intl` ni `uz-UZ` bilan ishlatmang** — [lib/format.ts](lib/format.ts) da sabab yozilgan.
  Qisqasi: bu lokal Node ICU sida bor, brauzerda yo'q, ya'ni bitta qiymat ikki xil chiqadi
  (`65[U+00A0]000` ↔ `65,000`, `14-avgust, 2026` ↔ `2026 M08 14`). Birinchisi SSR matnini
  mijoznikidan farqlantirib React'ni butun daraxtni qayta chizishga majbur qilardi
  ("hydration failed"), ikkinchisi foydalanuvchiga buzuq sana ko'rsatardi. Narx va sana
  formati shu fayldan olinadi; sana Toshkent vaqtida (UTC+5) hisoblanadi, chunki konteyner
  UTC da ishlaydi.

## Oqimlar

**Kirish** — telefon + SMS kod (API.md §4.1), sayt uchun asosiy usul: noma'lum raqam kod
tasdiqlangan zahoti hisobga aylanadi, ya'ni bu yo'lda ro'yxatdan o'tish qadami yo'q.
Email+parol — ikkinchi yo'l: kirish, **ro'yxatdan o'tish** va parol tiklash, hammasi
o'sha panelning ichida.

**Hamma kod ekranlari bitta komponent**: [components/auth/CodeEntry.tsx](components/auth/CodeEntry.tsx).
`codeLength` / `expiresInSeconds` / `resendAfterSeconds` **serverdan** o'qiladi va hech qayerda
qattiq yozilmagan — shu tufayli aynan bir komponent SMS (4 xona / 2 daqiqa) va email
(6 xona / 10 daqiqa) uchun ishlaydi. Xato tili ham bitta joyda: [lib/otp.ts](lib/otp.ts)
`describeOtpError` (`OTP_INVALID` → qayta tering; `OTP_EXPIRED` va `OTP_TOO_MANY_ATTEMPTS` →
kod o'ldi, yangisini so'rang; `ACCOUNT_BLOCKED` → qo'llab-quvvatlash).

Email oqimlari (API.md §4.2, 2026-08-14 dan **havola emas, kod**) — hammasi kirish panelining
ichidagi qadamlar, alohida sahifa yo'q:

| Qadam | Chaqiruv | Natija |
|---|---|---|
| "Ro'yxatdan o'tish" | `POST /auth/register {email, password, firstName, lastName?}` | `201 CodeSent` → kod ekrani. Hisob `PENDING_VERIFICATION`, cookie hali yo'q |
| Kirish `403 EMAIL_NOT_VERIFIED` bersa | `POST /auth/resend-verification {email}` | `202 CodeSent` → kod ekrani |
| Kodni kiritish | `POST /auth/verify-email {email, code}` | **`200 TokenResponse`** — cookie o'rnatiladi, alohida login qadami YO'Q |
| "Parolni unutdingizmi?" | `POST /auth/forgot-password {email}` | `202 CodeSent` → kod + yangi parol ekrani |
| Yangi parolni saqlash | `POST /auth/reset-password {email, code, newPassword}` | `204` — token BERILMAYDI, hamma qurilmadan chiqariladi, kirish ekraniga qaytariladi |

Ikkita tuzoq (MIGRATION_EMAIL_CODES.md §4):

1. `resend-verification` va `forgot-password` **doim `202`** qaytaradi — manzil ro'yxatda
   bo'lmasa ham, cooldown ichida ham. Bu javob hech qachon "manzil topilmadi" deb talqin
   qilinmaydi va sayt matnlari ham hisob bor-yo'qligini oshkor qilmaydi. Bu ikkisida
   `OTP_RESEND_TOO_SOON` **yo'q** — taymer `resendAfterSeconds` dan yuritiladi.
2. **Kod o'z oqimiga bog'langan**: tasdiqlash kodini `reset-password` ga yuborsangiz
   `401 OTP_EXPIRED` keladi, teskarisi ham shunday.

Ro'yxatdan o'tish formasi haqida: **telefon maydoni yo'q** (raqam faqat §4.1 orqali
o'rnatiladi), parol qoidasi backend DTO'si bilan bir xil (8–72, harf + raqam), ism 2–100
(majburiy) va familiya 100 gacha (ixtiyoriy) — **ikkita alohida katak**, pastdagi "Ism ikkita
maydon" bo'limiga qarang.
Shu uchtasi mijozda oldindan tekshiriladi — bekorga so'rov ketmasin va matn uzbekcha bo'lsin.
Backenddan `400 VALIDATION_FAILED` kelsa, `errors` massivi to'g'ridan-to'g'ri maydonlarga
joylanadi (API.md §2). `409 EMAIL_ALREADY_REGISTERED` → "kirishga o'ting".

> Eski `/verify-email?token=…` va `/reset-password?token=…` manzillari endi yo'q (404) va
> redirect ataylab qo'yilmagan: backend `one_time_tokens` jadvalini tashlagan, ya'ni pochtada
> qolgan eski havolalar baribir o'lik edi.

### Ism ikkita maydon (2026-08-22)

Backend ismni `firstName` + `lastName` ga ajratgan (API.md §4.2 va §5, "The name is two fields
now"). Sayt endi shu shaklni yuboradi: `POST /auth/register {email, password, firstName,
lastName?}` va `PUT /account {firstName, lastName?}`. Qoidalar:

- **Ko'rsatishda faqat `fullName`** (displayName, salomlashish, avatar initsiallari) — u har
  doim to'liq ism. `firstName`/`lastName` faqat forma kataklari uchun.
- **Mavjud ismni mijozda bo'lib olish YO'Q.** Bo'linishdan oldingi hisoblarda qismlar kelmaydi;
  o'zbekchada tartib qat'iy emas ("Amanbayev Zafarbek" ham, "Zafarbek Amanbayev" ham odatiy).
  Profil tahririda bunday hisobda ikkala katak **bo'sh**, tepasida "Hozirgi: …" matni —
  foydalanuvchi o'zi to'ldiradi ([ProfileContent](components/profile/ProfileContent.tsx)).
- Validatsiya mijozda ham, backendda ham bir xil: ism 2–100 majburiy, familiya 100 gacha, bo'sh
  satr = familiya yo'q (katak qanday bo'lsa shunday yuboriladi). `VALIDATION_FAILED` dagi
  `errors[].field` = `firstName` | `lastName` — "ism umuman yo'q" ham `firstName` ostida.
- **Eski `{fullName}` shakli bitta joyda ataylab qoldi:** checkout `newAccount` bo'lganda
  `recipientName` dan `PUT /account {fullName}` yuboradi ([CheckoutForm](components/checkout/CheckoutForm.tsx)).
  Bitta katakdan kelgan ism uchun bu to'g'ri yo'l; backend qabul qiladi va qismlarni tozalaydi.
  Shu sababli `app/api/account/route.ts` ikkala shaklni ham qabul qiladi.

Lokal backend (`provider=log`, kod konsolda) bilan to'liq sinalgan: register → kod → account
javobida uchala maydon; familiya o'chirilsa `fullName` faqat ismga aylanadi; `{fullName}`
yuborilsa qismlar yo'qoladi va profil tahriri bo'sh kataklar + "Hozirgi" ko'rsatadi.

Checkout'ning kod qadami — [CheckoutCodeStep](components/checkout/CheckoutCodeStep.tsx) —
o'z chizmasini (orqaga qaytish, summa, buyurtma joylash holati) saqlaydi, lekin xato tilini
o'sha `lib/otp.ts` dan oladi.

**Google bilan kirish** (API.md §4.1a) — telefon va email yonidagi uchinchi yo‘l:

```
Brauzer: Google Identity Services  →  ID token
   ↓
POST /api/auth/oauth/google { idToken }   (sayt ichki route’i)
   ↓  backend: POST /auth/oauth/google  →  200 TokenResponse
   ↓  tokenlar httpOnly cookie’ga yoziladi — brauzerga berilmaydi
```

Hisob qanday topiladi (backend hal qiladi): bog‘langan identifikator → Google tasdiqlagan
email bilan mavjud hisob (unga bog‘lanadi) → yo‘q bo‘lsa yangi hisob, `newAccount: true`,
parolsiz. Ya’ni bir odam telefon bilan ochgan hisobiga keyin Google bilan ham kira oladi,
agar email bir xil bo‘lsa.

**Client id — eng muhim nuqta.** [app/login/page.tsx](app/login/page.tsx) uni server tomonda
`GOOGLE_OAUTH_CLIENT_ID` dan o‘qib panelga uzatadi. Uch shart:

1. Qiymat **backenddagi `GOOGLE_OAUTH_CLIENT_ID` bilan aynan bir xil** bo‘lishi shart —
   backend token auditoriyasini o‘sha client id bilan tekshiradi. Bu Google Cloud Console’dagi
   **Web** client id (Android’niki emas).
2. **`NEXT_PUBLIC_` emas**: shunda qiymat build paytida kodga singib qolmaydi va konteynerga
   ish vaqtida beriladi (`docker run -e GOOGLE_OAUTH_CLIENT_ID=...`). Deploy workflow uni
   `secrets.GOOGLE_OAUTH_CLIENT_ID` dan oladi — secret qo‘yilmasa qiymat bo‘sh keladi va
   deploy shundan yiqilmaydi.
3. Google Cloud Console’da o‘sha client id uchun **Authorized JavaScript origins** ro‘yxatida
   `https://kitobgo.com` (va lokal ish uchun `http://localhost:3000`) turishi kerak. Aks holda
   tugma chiziladi-yu, bosilganda `[GSI_LOGGER] The given origin is not allowed` beradi.

Client id bo‘sh bo‘lsa panel Google blokini **umuman chizmaydi** (ajratgichi bilan birga) va
`accounts.google.com/gsi/client` skripti ham yuklanmaydi — ishlamaydigan tugma turgandan
ko‘ra yo‘qligi yaxshi.

Tugmani Google o‘zi chizadi ([GoogleSignIn](components/auth/GoogleSignIn.tsx) da `renderButton`,
`locale: "uz"` — yozuvi “Google orqali kirish” bo‘lib chiqadi). Kengligi konteynerdan o‘lchab
beriladi, chunki GIS foizni qabul qilmaydi (Google chegarasi 400px). One Tap ataylab yoqilmagan:
u FedCM sozlamalarini talab qiladi va kirish sahifasida keraksiz.

Xatolar: `503 OAUTH_PROVIDER_DISABLED` (serverda client id yo‘q), `401 OAUTH_TOKEN_INVALID`,
`403 ACCOUNT_BLOCKED` — uchalasi ham uzbekcha matnga o‘giriladi; backend bu endpointda `detail`
ni inglizcha qaytaradi, shuning uchun `code` bo‘yicha shoxlash shart.

**Checkout** — [app/api/checkout/route.ts](app/api/checkout/route.ts) kompozit:

1. `DELETE /cart` + har pozitsiya `POST /cart/items` — server savati saytdagi savat bilan
   **to'liq almashtiriladi** (snapshot = mijoz hozir ekranda ko'rgan narx; shu tufayli
   `hasPriceChanges` gate normal oqimda ishga tushmaydi).
2. Miqdor kesilgan / sotuvdan chiqqan pozitsiyalar bo'lsa → buyurtma berilmaydi, sayt-ichki
   **`CART_ADJUSTED`** kodi qaytadi (bu backend kodi EMAS) — forma lokal savatni moslab,
   foydalanuvchidan qayta tasdiq so'raydi.
3. `POST /orders` — `idempotencyKey` **body ichida** (bir checkout ekraniga bitta UUID,
   retry'da o'sha kalit). `ORDER_PRICE_CHANGED` kelsa forma farqni ko'rsatib, rozilikdan
   keyin `acceptPrices: true` bilan qayta yuboradi (BFF `POST /cart/accept-prices` chaqiradi).
4. To'lov: `COD` → `POST /payments/cash-on-delivery` (buyurtma darhol `PROCESSING`);
   `CLICK`/`PAYME` → `POST /payments` → `checkoutUrl` mijozga qaytadi.

**To'lov holati** — provayder redirekti isbot emas: `/order-success` sahifasi buyurtmani
`PAID` bo'lguncha 3 soniyada pollaydi (~2 daqiqa), `checkoutUrl` sessionStorage'da
(`kg:pay:{orderNumber}`) turadi — "To'lovni davom ettirish" tugmasi shundan.

## Qidiruv tizimlari uchun (SEO)

Manzil bitta joyda: [lib/site.ts](lib/site.ts) — `SITE_URL` (`NEXT_PUBLIC_SITE_URL` yoki
`https://kitobgo.com`), `SITE_NAME` va `PRIVATE_PATHS`. `robots.ts` ham, sahifalardagi
`robots: { index: false }` ham shu ro'yxatga tayanadi.

| Nima | Qayerda | Izoh |
|---|---|---|
| `/robots.txt` | [app/robots.ts](app/robots.ts) | Shaxsiy yo'llar va `/api/*` yopilgan, sitemap ko'rsatilgan |
| `/sitemap.xml` | [app/sitemap.ts](app/sitemap.ts) | Statik sahifalar + blog + kategoriyalar + **hamma kitob**; soatiga yangilanadi |
| Kanonik manzil | har sahifada `alternates.canonical` | Layout'da **ataylab yo'q** — u meros bo'lib butun saytga tarqalardi |
| Strukturali ma'lumot | [lib/seo.ts](lib/seo.ts) + [JsonLd](components/seo/JsonLd.tsx) | `Organization`+`WebSite` (layout), `Product`+`Book` va `BreadcrumbList` (kitob), `BreadcrumbList` (blog) |
| Ulashish rasmi | kitob sahifasida `openGraph.images` | Telegramda umumiy rasm emas, o'sha kitob muqovasi chiqadi |

**Sitemap.** Kitoblar `getBooks` orqali 100 tadan olinadi (API.md §2 dagi chegara), 50
sahifadan keyin to'xtaydi (5000 kitob) va bu `console.warn` bilan aytiladi — bundan oshsa
sitemap'ni indeksga bo'lish kerak. Backend javob bermasa oqim uziladi va sitemap **qisman**
qaytadi: butunlay yiqilgandan ko'ra shunisi yaxshi.

**Katalog kanoniklari.** `?sort=`, `?page=`, `?max=` — bitta ro'yxatning ko'rinishi, hammasi
yig'ilib tashlanadi. `?category=` esa **saqlanadi**: kategoriya o'z sahifasi va sitemap ham
aynan shu manzilni beradi (ikkovi bir-biriga zid bo'lmasligi shart). `?q=` — `noindex`:
cheksiz variant beradi va har biri "yupqa" sahifa.

**Ikkita tuzoq:**

1. **Sahifa `openGraph` bersa, Next layout'dagisini butunlay almashtiradi** (chuqur
   birlashtirmaydi). Shuning uchun kitob va blog sahifalarida `siteName`, `locale`, `type`
   qayta yoziladi — aks holda ular yo'qoladi.
2. **Bo'sh ma'lumot yozilmaydi.** `aggregateRating` faqat `reviews > 0` bo'lganda, `isbn`
   faqat haqiqiy 10/13 xonali bo'lganda qo'shiladi; `detailToBook` qo'yadigan "—" va
   "ko'rsatilmagan" kabi matnlar filtrlanadi. Nol reyting yoki soxta maydon Google uchun
   qoidabuzarlik va butun rich result'ni bekor qiladi.

> **Aloqa raqami butun saytda bitta: `+998 77 448 80 80`.** Footerda `+998 71 200 00 00`
> qolib ketgan edi (shablondan) — tuzatildi. `Organization` dagi raqam E.164 shaklida
> (`+998774488080`) va sahifadagi matnga mos: strukturali ma'lumot ko'rinadigan matnga
> zid bo'lsa, Google uni e'tiborga olmaydi. Raqam o'zgarsa — footer, `/contact`,
> `/terms`, `/privacy` va `app/layout.tsx` dagi `Organization`, hammasi birga o'zgaradi.

## Endpoint xaritasi (eski → yangi)

| Eski (o'chirilgan) | Yangi (API.md) | Qayerda |
|---|---|---|
| `GET /api/products` | `GET /books` (sort whitelist!) | `lib/store-api.ts getBooks` |
| `GET /api/products/{id}` | `GET /books/{slug}` | `getBookDetail` — routing endi **slug** bilan |
| `GET /api/products/search` | `GET /books?q=…` (`hasDiscount`→`discounted`) | katalog, `/api/search` |
| `GET /api/categories` (flat) | `GET /categories/tree` (daraxt) | katalog, footer |
| `GET /api/orders/regions` | `GET /regions` + `GET /regions/{id}/delivery-options?itemsTotal=` | checkout |
| `POST /api/orders` (anonim, header-key) | auth + server savat + `POST /orders` (key body'da) | `/api/checkout` kompoziti |
| `GET /uploads/*` media-proksi | rasm URL'lari absolyut keladi (CDN) | o'chirilgan; `next.config.ts` remotePatterns |
| IndexedDB oflayn-navbat | olib tashlandi — retry o'rnini `idempotencyKey` bosadi | — |

## Deploy

`main` ga push → GitHub Actions: tekshiruv → Docker image GHCR'ga → SSH orqali serverda
konteynerni almashtirish. Serverda repo yo'q: faqat `kitobgo-market` nomli konteyner
(`127.0.0.1:3000`), oldida host nginx (`/etc/nginx/sites-available/kitobgo-site.conf`).

nginx'da atigi ikkita statik istisno qolgan — `/account/delete` va `/style.css`
(`/var/www/kitobgo` dan). Qolgan hamma narsa Next.js konteyneriga proxy qilinadi.

> **Deploy bosqichi vaqtincha yiqilishi mumkin:** `dial tcp <server>:22: i/o timeout`.
> 2026-08-12 da shunday bo'ldi — 22-port O'zbekiston IP'sidan ochiq, GitHub runner'idan
> (Azure IP) esa javobsiz. Server ichida sabab yo'q edi (`ufw` 22-portni hammaga ochgan,
> fail2ban o'rnatilmagan, iptables INPUT'da faqat ufw zanjirlari) — ya'ni paketlar
> provayder tarmog'ida tashlangan. Bir necha soatdan keyin o'zi tiklandi, hech narsa
> o'zgartirilmagan. Takrorlansa — kutish yoki qo'lda chiqarish:
>
> ```
> echo "<classic PAT, read:packages>" | docker login ghcr.io -u <user> --password-stdin
> docker pull ghcr.io/<owner>/kitobgo-market:latest
> docker rm -f kitobgo-market
> docker run -d --name kitobgo-market --restart unless-stopped \
>   -p 127.0.0.1:3000:3000 -e KITOBGO_API_URL=https://api.kitobgo.com \
>   ghcr.io/<owner>/kitobgo-market:latest
> ```
>
> GHCR **classic** token talab qiladi (`read:packages`); fine-grained token bilan
> `docker login` "Succeeded" deydi-yu, `pull` da "denied" beradi — chalg'itadi.

Workflow'da SSH porti ataylab `port: 22` deb yozilgan, secret'dan o'qilmaydi: `SERVER_PORT`
secret qiymati oxirida `\n` bo'lgani uchun drone-ssh uni int'ga aylantira olmay, SSH'gacha
yetmasdan yiqilardi.

## Lokal ishga tushirish

```
npm run dev          # http://localhost:3000
KITOBGO_API_URL      # default https://api.kitobgo.com; lokal backend uchun http://localhost:8080
```

Prod katalogi hozircha bo'sh (`totalElements: 0`) — bosh sahifa bunday holatda
`data/books.ts` dagi statik ro'yxatga tushadi; katalog "yuklanmadi" emas, "topilmadi" ko'rsatadi.

## Backend tomonda hal bo'lishi kerak (workaround QILINMAGAN)

1. **"Eng ko'p sotilganlar" sorti yo'q** — sotuv soni bo'yicha sort/endpoint yo'q; bosh sahifa
   vaqtincha `ratingCount,desc` bilan taqlid qiladi.
2. **To'lov return-URL kelishuvi** — provayderdan qaytish manzili API.md'da yo'q. Tavsiya:
   `https://kitobgo.com/order-success?order={orderNumber}&pay=1`.
3. **Buyurtmada to'lov muddati maydoni yo'q** — "30 daqiqa" saytda matn sifatida yozilgan;
   `OrderDetail`ga deadline (masalan `paymentExpiresAt`) qo'shilsa aniq taymer ko'rsatiladi.
4. **BookSummary'da kategoriya id/slug yo'q** (faqat `categoryName`) — kartochkadan kategoriya
   sahifasiga havola qilib bo'lmaydi.
5. **Mehmon (tokensiz) checkout yo'q** — eski sayt anonim buyurtma qilardi; yangi oqimda OTP
   checkout ichiga qo'yildi. Mahsulot talabi anonim buyurtma bo'lsa, backendda alohida yechim kerak.
6. **Savat almashtirish semantikasi** — sayt checkoutda server savatini butunlay qayta yozadi;
   bir akkaunt Android app bilan baravar ishlatilsa, appdagi savat checkout paytida o'chadi.
   Cross-device savat kerak bo'lsa, merge siyosatini backend belgilashi kerak.
7. **Apple web sign-in** — §4.1a dagi Apple oqimi native (iOS) va Android deep link uchun;
   webda kerak bo’lsa Service ID va redirect manzili kelishilishi kerak. Saytga qo’shilmagan.
   **Google esa qo’shilgan va jonli saytda ishlaydi** (2026-08-18, foydalanuvchi tekshirdi) —
   yuqoridagi “Google bilan kirish” bo’limiga qarang.

## Keyingi qadamlar (sayt tomonida, backend tayyor)

- Saqlangan manzillar UI (`/account/addresses` CRUD bor, sayt hozir inline manzil yuboradi).
- Kitob sahifasida sharhlar ro'yxati/yozish (`/reviews/**` bor; hozir faqat reyting ko'rsatiladi).
- Bosh sahifa hero'sini `GET /banners`ga ulash (klient tayyor: `getBanners`).
- Bildirishnomalar (`/notifications`) va `/authors` sahifasini API'ga ulash (hozir statik).
