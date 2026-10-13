import { describe, expect, it } from "vitest";
import { parseSourceCookie, serializeSourceCookie, sourceFromSearchParams } from "./index";

const now = new Date("2026-09-27T10:00:00Z");

describe("sourceFromSearchParams", () => {
  it("берёт utm_source и utm_content из ссылки ролика", () => {
    const params = new URLSearchParams("promo=OSEN-R1&utm_source=instagram&utm_content=reels-1209");
    expect(sourceFromSearchParams(params, now)).toEqual({
      utmSource: "instagram",
      utmContent: "reels-1209",
      firstVisitAt: "2026-09-27T10:00:00.000Z",
    });
  });

  it("без меток источника нет - cookie не ставим", () => {
    expect(sourceFromSearchParams(new URLSearchParams("promo=OSEN-R1"), now)).toBeNull();
  });

  it("режет длинную и мусорную метку", () => {
    const params = new URLSearchParams({ utm_source: "a\u0000".repeat(300) });
    expect(sourceFromSearchParams(params, now)?.utmSource).toHaveLength(100);
  });
});

describe("parseSourceCookie", () => {
  it("читает то, что записали", () => {
    const source = sourceFromSearchParams(new URLSearchParams("utm_source=vk"), now)!;
    expect(parseSourceCookie(serializeSourceCookie(source))).toEqual(source);
  });

  it("испорченная cookie не роняет страницу", () => {
    expect(parseSourceCookie("{не json")).toBeNull();
    expect(parseSourceCookie(undefined)).toBeNull();
  });
});
