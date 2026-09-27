// Решение по промокоду без базы и env (02-сущности.md, 3.4; 03-база-данных.md,
// 3.4). Состояния кода не хранятся, а вычисляются из даты, счёта заказов и
// флага. Файл чистый, поэтому проверяется тестами без базы.

export interface PromoCheckResult {
  valid: boolean;
  discountPercent: number;
  reason?: string;
}

export interface PromoRecord {
  discountPercent: number;
  usageLimit: number;
  /** Дата «действует до», включительно (колонка DATE, приходит полночью UTC). */
  validUntil: Date;
  isDisabled: boolean;
  deletedAt: Date | null;
}

// Тексты - из 02-сущности.md (3.4) и макета: покупку не блокируем ни в одном
// случае (решение 3А от 11.09.2026), поэтому каждая причина говорит, что
// заказ можно оформить без выгоды.
export const PROMO_REASON = {
  notFound: "Такого кода нет. Проверьте буквы или оформите заказ без выгоды.",
  expired: "Срок действия кода закончился. Можно оформить заказ без выгоды.",
  limit: "Код этого ролика уже использован нужное число раз. Можно оформить заказ без выгоды.",
} as const;

const MAX_CODE_LENGTH = 40;

/** Код хранится заглавными (03-база-данных.md, 3.4): приводим к тому же виду. */
export function normalizePromoCode(input: string): string {
  return input.trim().toUpperCase();
}

export function isPlausiblePromoCode(code: string): boolean {
  return code.length > 0 && code.length <= MAX_CODE_LENGTH;
}

/** Сегодняшняя дата магазина (Москва) в виде YYYY-MM-DD. */
export function shopToday(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function evaluatePromo(
  record: PromoRecord | null,
  paidOrdersWithCode: number,
  now: Date
): PromoCheckResult {
  // Выключенный вручную код для покупателя выглядит как несуществующий (02-сущности.md, 3.4).
  if (!record || record.isDisabled || record.deletedAt) {
    return { valid: false, discountPercent: 0, reason: PROMO_REASON.notFound };
  }
  const validUntil = record.validUntil.toISOString().slice(0, 10);
  if (shopToday(now) > validUntil) {
    return { valid: false, discountPercent: 0, reason: PROMO_REASON.expired };
  }
  if (paidOrdersWithCode >= record.usageLimit) {
    return { valid: false, discountPercent: 0, reason: PROMO_REASON.limit };
  }
  return { valid: true, discountPercent: record.discountPercent };
}
