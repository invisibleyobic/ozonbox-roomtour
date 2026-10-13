import { describe, expect, it } from "vitest";
import { evaluatePromo, normalizePromoCode, PROMO_REASON, type PromoRecord } from "./evaluate";

const code: PromoRecord = {
  discountPercent: 10,
  usageLimit: 200,
  validUntil: new Date("2026-10-31T00:00:00Z"),
  isDisabled: false,
  deletedAt: null,
};

describe("normalizePromoCode", () => {
  it("убирает пробелы по краям и поднимает регистр", () => {
    expect(normalizePromoCode("  osen-r1 ")).toBe("OSEN-R1");
  });
});

describe("evaluatePromo", () => {
  it("действующий код даёт выгоду", () => {
    expect(evaluatePromo(code, 27, new Date("2026-10-01T12:00:00Z"))).toEqual({
      valid: true,
      discountPercent: 10,
    });
  });

  it("в последний день срока код ещё действует (по московскому времени)", () => {
    // 31.10 23:30 по Москве = 20:30 UTC
    expect(evaluatePromo(code, 0, new Date("2026-10-31T20:30:00Z")).valid).toBe(true);
  });

  it("на следующий день по Москве срок вышел, даже если по UTC ещё 31-е", () => {
    // 01.11 00:30 по Москве = 31.10 21:30 UTC
    expect(evaluatePromo(code, 0, new Date("2026-10-31T21:30:00Z"))).toEqual({
      valid: false,
      discountPercent: 0,
      reason: PROMO_REASON.expired,
    });
  });

  it("лимит исчерпан, когда оплаченных заказов столько же, сколько лимит", () => {
    expect(evaluatePromo(code, 200, new Date("2026-10-01T12:00:00Z")).reason).toBe(PROMO_REASON.limit);
  });

  it("выключенный и неизвестный код выглядят одинаково", () => {
    const now = new Date("2026-10-01T12:00:00Z");
    expect(evaluatePromo({ ...code, isDisabled: true }, 0, now).reason).toBe(PROMO_REASON.notFound);
    expect(evaluatePromo(null, 0, now).reason).toBe(PROMO_REASON.notFound);
  });
});
