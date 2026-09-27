import { NextResponse } from "next/server";
import { checkPromoCode } from "@/lib/promoCodes";

// POST /api/promo-code (08-структура-кода.md, раздел 3): { code } →
// { valid, discountPercent, reason? }. Только чтение, ключ идемпотентности не
// нужен (04-потоки-данных.md, 6.2). Ответ не кэшируется: срок и лимит кода
// меняются со временем.
export async function POST(request: Request) {
  let code: unknown;
  try {
    ({ code } = await request.json());
  } catch {
    return NextResponse.json({ error: "Ожидается JSON вида { code }" }, { status: 400 });
  }
  if (typeof code !== "string") {
    return NextResponse.json({ error: "Ожидается JSON вида { code }" }, { status: 400 });
  }

  const result = await checkPromoCode(code);
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
