import Image from "next/image";
import Link from "next/link";

// Brend belgisi: `public/images/logo.png` — `C:\Users\USER\Desktop\logo.PNG` dan olingan,
// oq foni shaffofga aylantirilgan va chetlari kesilgan (384x200). Shu sabab u krem
// (`navSurface`) yuzada ham, oq sahifada ham fonsiz turadi.
// Yozuv rasm ichida bo'lgani uchun matn takrorlanmaydi — nomni `alt` beradi.
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center" aria-label="Kitob.go bosh sahifa">
      <Image
        src="/images/logo.png"
        alt="Kitob.go — onlayn kitob do‘kon"
        width={384}
        height={200}
        priority
        className={compact ? "h-10 w-auto" : "h-[52px] w-auto"}
      />
    </Link>
  );
}
