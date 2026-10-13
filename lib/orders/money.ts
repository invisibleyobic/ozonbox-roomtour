// Суммы заказа и корзины (03-база-данных.md, 4.3). Все деньги - целые копейки
// (00-правила-проекта.md, правило 5). Файл без обращений к базе и env: его
// считает и корзина в браузере, и (в фазе 3) транзакция создания заказа -
// поэтому цифра в корзине и цифра в заказе получаются одной и той же функцией.

/** Выгода по коду: процент от суммы товаров, округлённый вниз до целого рубля. */
export function discountKopecks(itemsTotalKopecks: number, discountPercent: number): number {
  if (itemsTotalKopecks <= 0 || discountPercent <= 0) return 0;
  const percent = Math.min(discountPercent, 100);
  const raw = Math.floor((itemsTotalKopecks * percent) / 100);
  return Math.floor(raw / 100) * 100;
}

export interface MoneyLine {
  priceKopecks: number;
  quantity: number;
}

export function itemsTotalKopecks(lines: MoneyLine[]): number {
  return lines.reduce((sum, line) => sum + line.priceKopecks * line.quantity, 0);
}
