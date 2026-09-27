import { describe, expect, it } from "vitest";
import { discountKopecks, itemsTotalKopecks } from "./money";

describe("discountKopecks", () => {
  it("округляет выгоду вниз до рубля (пример из 03-база-данных.md)", () => {
    // 2 893 ₽ × 10% = 289,30 ₽ → 289 ₽
    expect(discountKopecks(289300, 10)).toBe(28900);
  });

  it("всегда кратна 100 копейкам", () => {
    for (const total of [89900, 129050, 1, 99, 457700]) {
      expect(discountKopecks(total, 10) % 100).toBe(0);
    }
  });

  it("не бывает больше суммы товаров и не бывает отрицательной", () => {
    expect(discountKopecks(50000, 150)).toBe(50000);
    expect(discountKopecks(50000, 0)).toBe(0);
    expect(discountKopecks(0, 10)).toBe(0);
  });
});

describe("itemsTotalKopecks", () => {
  it("складывает цену на количество", () => {
    expect(
      itemsTotalKopecks([
        { priceKopecks: 129000, quantity: 2 },
        { priceKopecks: 89900, quantity: 1 },
      ])
    ).toBe(347900);
  });
});
