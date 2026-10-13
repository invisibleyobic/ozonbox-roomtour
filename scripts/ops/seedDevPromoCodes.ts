import { prisma } from "../../lib/db/prisma";

// Промокоды ДЛЯ РАЗРАБОТКИ - как в макете mockups/v1-scenariy-1:
// OSEN-R1 (действует) и OSEN-OLD (срок вышел). Кода «лимит исчерпан» здесь нет:
// база не пускает лимит 0, а для исчерпания нужны оплаченные заказы (фаза 4).
// Этот исход проверяет тест lib/promoCodes/evaluate.test.ts.
// Настоящие коды роликов заводит владелец, этот скрипт на боевой базе не
// запускается: при NODE_ENV=production он отказывается работать.

const today = new Date();
const inDays = (days: number) => new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + days));

const CODES = [
  { code: "OSEN-R1", usageLimit: 200, validUntil: inDays(30), videoTitle: "Reels «Осенняя кожа» (пример)" },
  { code: "OSEN-OLD", usageLimit: 200, validUntil: inDays(-1), videoTitle: "Старый ролик (пример)" },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Тестовые промокоды не заводятся в боевой базе.");
  }
  for (const item of CODES) {
    const data = {
      platform: "INSTAGRAM" as const,
      videoTitle: item.videoTitle,
      videoDate: inDays(-7),
      utmContent: null,
      discountPercent: 10,
      usageLimit: item.usageLimit,
      validUntil: item.validUntil,
      note: "Тестовый код для разработки (scripts/ops/seedDevPromoCodes.ts)",
    };
    await prisma.promoCode.upsert({ where: { code: item.code }, update: data, create: { code: item.code, ...data } });
  }
  console.log(`Тестовые промокоды готовы: ${CODES.map((item) => item.code).join(", ")}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
