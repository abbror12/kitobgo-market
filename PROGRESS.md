# kitobgo-market — veb-do'kon (storefront)

Next.js 15 (App Router) + Tailwind. KitobGo'ning mijozlarga ko'rinadigan veb-do'koni:
`https://kitobgo.com`. Backend — `D:\Project\kitob-app-backend` (`https://api.kitobgo.com/api/v1`),
shartnoma **faqat** `docs/API.md` (o'sha repoda).

> 2026-08-10: sayt eski (boshqa) backenddan haqiqiy KitobGo backendiga to'liq o'tkazildi.
> Eski `/api/products`, anonim buyurtma, IndexedDB oflayn-navbat — olib tashlangan.

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

**Kirish** — telefon + SMS kod (API.md §4.1), sayt uchun asosiy usul. `codeLength` /
`expiresInSeconds` / `resendAfterSeconds` serverdan o'qiladi. Email+parol tab qo'shimcha
(ilovada email bilan ro'yxatdan o'tganlar uchun). Yangi hisob saytda faqat OTP orqali ochiladi.

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
