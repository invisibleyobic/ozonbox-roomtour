// Показ денег и бейджей на витрине. Без обращения к базе и env, поэтому
// безопасно для клиентских компонентов. Сами суммы всегда целые копейки
// (00-правила-проекта.md, правило 5) - рубли появляются только здесь, на экране.

export function formatPrice(kopecks: number): string {
  return `${(kopecks / 100).toLocaleString("ru-RU")} ₽`;
}

export const BADGE_LABEL: Record<string, string> = {
  HIT: "Хит",
  BESTSELLER: "Бестселлер",
};
