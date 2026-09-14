import { prisma } from "../../lib/db/prisma";

// Наполнитель справочников (08-структура-кода.md, раздел 1). Можно
// запускать сколько угодно раз: обновляет строки по slug, ничего не убирает
// (03-база-данных.md, раздел 8). Тарифы доставки добавятся сюда же в фазе 3.

const CATEGORIES = [
  { slug: "face", title: "Лицо", sortOrder: 10 },
  { slug: "hair", title: "Волосы", sortOrder: 20 },
  { slug: "body", title: "Тело", sortOrder: 30 },
  { slug: "oils", title: "Масло", sortOrder: 40 },
  { slug: "sets", title: "Наборы", sortOrder: 50 },
];

async function main() {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { title: category.title, sortOrder: category.sortOrder },
      create: category,
    });
  }
  console.log(`Категории готовы: ${CATEGORIES.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
