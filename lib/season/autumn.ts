import type { SeasonConfig } from "./index";

// Осенняя сцена (шаг 2 чертежа, 3.3). Тексты и подборка - из макета
// mockups/v1-scenariy-1/index.html (шаг сценария «Осенняя сцена»).
// Видео сцены ещё не снято (05-стек.md, раздел 7) - videoKey и posterKey
// пустые, сцена работает на CSS-заглушке. Это штатный режим, а не временный
// (00-правила-проекта.md, правило 3): подключение видео - отдельный коммит,
// код сцены не меняется.
export const autumnSeason: SeasonConfig = {
  code: "autumn",
  kicker: "Сезон · осень",
  navLabel: "Осень",
  title: "Осенью кожа реагирует на холод и отопление",
  description: "Мы собрали уход под это время года.",
  productSlugs: ["super-trio", "stop-akne", "ochischenie", "ozodermik-3"],
  media: {
    videoKey: null,
    posterKey: null,
  },
};
