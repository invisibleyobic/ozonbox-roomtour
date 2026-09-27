import { autumnSeason } from "./autumn";

export interface SeasonConfig {
  code: string;
  kicker: string;
  /** Короткое имя сезона для шапки. */
  navLabel: string;
  title: string;
  description: string;
  /** Slug'и товаров сцены, в порядке показа (02-сущности.md, 3.3). */
  productSlugs: string[];
  media: {
    videoKey: string | null;
    posterKey: string | null;
  };
}

// Сезон - конфиг, а не таблица (решение шага 2, 5.3). Текущий сезон - одна
// настройка; когда сезонов станет больше, здесь появится выбор по дате.
export function getCurrentSeason(): SeasonConfig {
  return autumnSeason;
}
