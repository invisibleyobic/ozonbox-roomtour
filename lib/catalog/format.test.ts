import { describe, expect, it } from "vitest";
import { BADGE_LABEL, formatPrice } from "./format";

const plain = (text: string) => text.replace(/\s/g, " ");

describe("formatPrice", () => {
  it("переводит копейки в рубли с разделителем тысяч", () => {
    expect(plain(formatPrice(129000))).toBe("1 290 ₽");
  });

  it("не теряет копейки на круглых суммах", () => {
    expect(plain(formatPrice(50000))).toBe("500 ₽");
  });

  it("показывает копейки, когда они есть", () => {
    expect(plain(formatPrice(129050))).toBe("1 290,5 ₽");
  });
});

describe("BADGE_LABEL", () => {
  it("знает оба бейджа первой версии", () => {
    expect(BADGE_LABEL.HIT).toBe("Хит");
    expect(BADGE_LABEL.BESTSELLER).toBe("Бестселлер");
  });
});
