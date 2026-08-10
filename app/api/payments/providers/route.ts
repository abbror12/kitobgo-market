import { guard, kgAuthedFetch, passthrough } from "@/lib/server/session";

// API.md §7.1: GET /payments/providers → ["CLICK","PAYME"] — shu muhitda yoqilganlari.
export function GET() {
  return guard(async () => passthrough(await kgAuthedFetch("/payments/providers")));
}
