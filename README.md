# Kitob.go Home Page

Apple uslubidagi minimal va responsive O‘zbekiston onlayn kitob marketi bosh sahifasi.

## Ishga tushirish

```bash
npm install
npm run dev
```

Brauzerda `http://localhost:3000` manzilini oching.

## API

Do‘kon REST API manzilini `.env.local` faylida belgilang:

```env
KITOBGO_API_URL=https://api.kitobgo.com
```

Qiymat berilmasa `https://api.kitobgo.com` standart sifatida ishlatiladi. Lokal backend bilan ishlash uchun `.env.local` da `http://127.0.0.1:8080` deb belgilang.

## Tekshiruvlar

```bash
npm run typecheck
npm run lint
npm run build
```

Loyiha Next.js App Router, TypeScript, Tailwind CSS, Lucide React va lokal typed mock data asosida qurilgan.
