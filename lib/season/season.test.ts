import { describe, expect, it } from "vitest";
import { getCurrentSeason } from "./index";

describe("текущий сезон", () => {
  const season = getCurrentSeason();

  it("это осень с четырьмя товарами подборки", () => {
    expect(season.code).toBe("autumn");
    expect(season.productSlugs).toHaveLength(4);
  });

  it("не содержит служебных пометок для разработчика в тексте покупателя", () => {
    const text = `${season.kicker} ${season.title} ${season.description}`;
    expect(text).not.toMatch(/HTML|макет|заглушк|индексир/i);
  });

  it("без видео сцена работает на заглушке (правило 3): ключи видео пустые", () => {
    expect(season.media.videoKey).toBeNull();
    expect(season.media.posterKey).toBeNull();
  });
});
