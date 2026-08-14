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

## Dizayn tizimi

**Yagona manba — mobil ilova:** `D:\Project\kitobgo-flutter\lib\ui\theme\colors.dart`
(+ `text_styles.dart`, `status_colors.dart`). Sayt unga ergashadi, teskarisi emas.
Tokenlarning **nomlari ilovadagi bilan bir xil va barqaror**: qiymatni o'zgartirish hech
narsani buzmaydi, nomni o'zgartirish butun saytga tegadi.

Palitra [tailwind.config.ts](tailwind.config.ts) da: `page` `cream` `sand` `navSurface`
`cocoa` `cocoaDark` `inkButton` `ink` `bodyText` `muted` `line` `lineSoft` `field`
`chevron` `gold` + `success`/`warning`/`danger` va ularning `*Soft` juftlari.

**Qo'llanishi (ilovadagidek):**

| Element | Token |
|---|---|
| Sahifa foni | `page` (oq) |
| Kartochka, input, panel | `cream` |
| Sticky header, to'liq kenglikdagi tasmalar | `navSurface` + `border-y border-line` |
| Asosiy tugma | `bg-inkButton text-cream`, hover `bg-ink` |
| Ikkilamchi tugma, havola, narx, faol tab | `cocoa` (hover `cocoaDark`) |
| Yumshoq to'ldirish: ikonka disklari, tanlangan pill | `sand` |
| Buyurtma status badge'lari | `status_colors.dart` mantiqiga mos: hal bo'lgan → `successSoft/success`, yo'ldagi → `warningSoft/cocoaDark`, to'xtagan → `dangerSoft/danger`, neytral → `sand/bodyText` |

**Tipografiya.** Lora (serif) — `font-serif` orqali **faqat** sarlavhalar, kitob nomlari va
narxlar uchun; qolgan hamma matn tizim sans-serif'da. Lora `next/font` bilan
[app/layout.tsx](app/layout.tsx) da `--font-lora` sifatida ulanadi (global emas). Kichik
katta-harfli yorliqlar uchun `.micro-label` (sans, 11.5px, letter-spacing 1.0) va `.eyebrow`.

**Diqqat qilinadigan to'rt joy** (kelajakdagi o'zgarishlarda ham shu qoidalar):

1. **`tailwind.config.ts` yolg'iz yetarli emas.** [app/globals.css](app/globals.css) ichida
   xom `rgba()` qiymatlar bor: soyalar (`shadow-soft/card/button` — ink #241D12 asosida),
   fokus halqasi (`outline: rgba(163,74,36,.34)` — cocoa) va `.faq-item[open] .faq-plus`
   foni. Palitra o'zgarsa bularni ham yangilang.
2. **`muted` (#97896F) cream fonda 3.37:1 — WCAG AA dan past.** Ilovada bu ataylab, faqat
   bezak uchun. Webda u **faqat placeholder** rangi sifatida ishlatiladi (globals.css dagi
   `::placeholder`); mijoz o'qishi kerak bo'lgan har qanday matn — `bodyText` (7.61:1).
3. **Oq page ustidagi cream kartochka kontrasti nozik** (1.02:1) — keng desktop ekranda
   ko'rinmay qoladi. Shuning uchun kartochkalar `border-line` + `shadow-soft` bilan,
   to'liq kenglikdagi tasmalar esa `navSurface` + `border-y` bilan ajratiladi.
   Tokenlar o'zgarmagan, faqat qo'llanishi web uchun moslashtirilgan.
4. **Muqova ortidagi pastel fonlar** ([lib/store-api.ts](lib/store-api.ts) `colors` massivi
   va `data/*.ts` dagi `color` maydonlari) ham iliq ohangda — sovuq pastel qo'shilsa
   ko'zga tashlanadi.

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

## Oqimlar

**Kirish** — telefon + SMS kod (API.md §4.1), sayt uchun asosiy usul. Email+parol tab
qo'shimcha (ilovada email bilan ro'yxatdan o'tganlar uchun). Yangi hisob saytda faqat OTP
orqali ochiladi — saytda ro'yxatdan o'tish formasi yo'q.

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

> Eski `/verify-email?token=…` va `/reset-password?token=…` uchun
> [next.config.ts](next.config.ts) da vaqtinchalik redirect bor (→ `/login`): backend
> `one_time_tokens` jadvalini tashlagan, ya'ni pochtada qolgan eski havolalar o'lik.
> Bir-ikki haftadan keyin olib tashlash mumkin.

Checkout'ning kod qadami — [CheckoutCodeStep](components/checkout/CheckoutCodeStep.tsx) —
o'z chizmasini (orqaga qaytish, summa, buyurtma joylash holati) saqlaydi, lekin xato tilini
o'sha `lib/otp.ts` dan oladi.

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
7. **Google/Apple web sign-in** — §4.1a oqimlari native uchun; webda kerak bo'lsa web client id
   va redirect oqimi kelishilishi kerak. Saytga qo'shilmagan.

## Keyingi qadamlar (sayt tomonida, backend tayyor)

- Saqlangan manzillar UI (`/account/addresses` CRUD bor, sayt hozir inline manzil yuboradi).
- Kitob sahifasida sharhlar ro'yxati/yozish (`/reviews/**` bor; hozir faqat reyting ko'rsatiladi).
- Bosh sahifa hero'sini `GET /banners`ga ulash (klient tayyor: `getBanners`).
- Bildirishnomalar (`/notifications`) va `/authors` sahifasini API'ga ulash (hozir statik).
