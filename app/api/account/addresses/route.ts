import { guard, kgAuthedFetch, passthrough } from "@/lib/server/session";

// API.md §5: GET /account/addresses → Address[], asosiysi (default) birinchi.
// Hozircha faqat o'qish — "Mening ma'lumotlarim" sahifasi asosiy manzilni va sonini
// ko'rsatadi. Qo'shish/tahrirlash checkout oqimida; alohida boshqaruv sahifasi yo'q.
export function GET() {
  return guard(async () => passthrough(await kgAuthedFetch("/account/addresses")));
}
