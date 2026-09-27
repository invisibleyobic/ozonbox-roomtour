import "server-only";
import { prisma } from "@/lib/db/prisma";
import {
  evaluatePromo,
  isPlausiblePromoCode,
  normalizePromoCode,
  PROMO_REASON,
  type PromoCheckResult,
} from "./evaluate";

export type { PromoCheckResult } from "./evaluate";

// Проверка промокода (04-потоки-данных.md, раздел 3): только чтение, в базу
// ничего не пишется. Использования - не поле, а счёт оплаченных и отгруженных
// заказов с этим кодом (03-база-данных.md, 4.2): брошенная корзина лимит не ест.
// Та же функция позже вызывается второй раз внутри транзакции заказа (фаза 3).
export async function checkPromoCode(input: string): Promise<PromoCheckResult> {
  const code = normalizePromoCode(input);
  if (!isPlausiblePromoCode(code)) {
    return { valid: false, discountPercent: 0, reason: PROMO_REASON.notFound };
  }

  const record = await prisma.promoCode.findUnique({ where: { code } });
  const paidOrders = record
    ? await prisma.order.count({
        where: { promoCodeId: record.id, status: { in: ["PAID", "SHIPPED"] } },
      })
    : 0;

  return evaluatePromo(record, paidOrders, new Date());
}
