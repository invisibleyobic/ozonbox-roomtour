import { ProductBadge } from "@prisma/client";
import { prisma } from "../../lib/db/prisma";

// Перенос 19 товаров из prototypes/2026-09-09-katalog/js/data.js в базу
// (10-план-реализации.md, фаза 1). Данные скопированы один раз при написании
// этого файла - на прототип в рантайме код не ссылается (прототип - архив,
// mockups/v1-scenariy-1/README и CLAUDE.md).
//
// Осознанно не перенесено (02-сущности.md, 3.1 и решение владельца 12.09.2026):
// - поле `old` (зачёркнутая цена) - риск по закону о рекламе;
// - поле `url` (карточка Tilda) - новый адрес строится из slug;
// - остаток на складе - в первой версии не ведём.
// Бейдж сужен до HIT/BESTSELLER (модель шага 2): значения '-50%', 'Лечебное',
// 'Новинка' из прототипа - это ещё не решённая часть модели, бейджа не ставим.
// Категория `oils` - фикс бага прототипа: у товара otri-6000 она стояла в cats,
// но в список фильтров прототипа не попадала (02-сущности.md, раздел 6).
//
// Фото - уменьшенные копии из mockups/v1-scenariy-1/assets/ (README прототипа:
// "именно они стоят в макете первой версии"), лежат в public/products/ и не
// закоммичены в git (.gitignore) - до подключения S3 это заглушка для
// разработки. image_key уже в форме, которую lib/storage.publicUrl() умеет
// превратить в адрес: когда появится MEDIA_PUBLIC_BASE_URL, ссылка сама
// переключится на S3, код менять не придётся.

type SeedProduct = {
  slug: string;
  name: string;
  sku: string;
  priceRub: number;
  tagline: string;
  contents: string[];
  benefits: string[];
  badge: ProductBadge | null;
  categories: string[];
};

const PRODUCTS: SeedProduct[] = [
  {
    slug: "stop-akne",
    name: "Бокс «Стоп акне»",
    sku: "4Y252D08",
    priceRub: 1990,
    tagline: "От акне, постакне, дерматита и купероза",
    contents: ["Крем ОЗОДЕРМИК 3% - 80 мл", "Озонированное масло ОТРИ 25 мл"],
    benefits: ["Снимает воспаление за 21 день", "Не сушит кожу", "Без гормонов и антибиотиков"],
    badge: ProductBadge.HIT,
    categories: ["face", "sets"],
  },
  {
    slug: "krem-pryschi",
    name: "Лечебный крем против прыщей",
    sku: "2G02",
    priceRub: 967,
    tagline: "Точечное действие, убирает красноту",
    contents: ["Тюбик 20 мл"],
    benefits: ["Работает точечно", "Убирает красноту за ночь", "Подходит с 12 лет"],
    badge: ProductBadge.HIT,
    categories: ["face"],
  },
  {
    slug: "super-kombo",
    name: "Набор «Супер комбо»",
    sku: "SC1G051H054Y252D",
    priceRub: 4999,
    tagline: "Максимальный уход для преображения лица",
    contents: ["Дневной и ночной кремы", "Озодермик 3%", "Масло ОТРИ"],
    benefits: ["Полный цикл ухода", "Выгода 3 291 рубль", "Хватает на 3 месяца"],
    badge: ProductBadge.HIT,
    categories: ["face", "sets"],
  },
  {
    slug: "chistaya-kozha",
    name: "Безупречно чистая кожа",
    sku: "1G051H05",
    priceRub: 2800,
    tagline: "От морщин, пигментации и воспалений",
    contents: ["Дневной озоновый крем - 50 мл", "Ночной крем глубокого действия - 50 мл"],
    benefits: ["Работает круглосуточно", "Выравнивает тон", "Накопительный эффект"],
    badge: ProductBadge.BESTSELLER,
    categories: ["face", "sets"],
  },
  {
    slug: "super-trio",
    name: "Набор «Супер трио»",
    sku: "ST4Y252D",
    priceRub: 2893,
    tagline: "Очищение и уход для проблемной кожи",
    contents: ["Три средства для домашнего ухода"],
    benefits: ["Программа на месяц", "Очищение плюс лечение", "Экономия 1 487 рублей"],
    badge: ProductBadge.BESTSELLER,
    categories: ["face", "sets"],
  },
  {
    slug: "super-duet",
    name: "Подарочный набор «Супер дуэт»",
    sku: "SD4Y252PP",
    priceRub: 1976,
    tagline: "Для нормальной и проблемной кожи",
    contents: ["Два средства в подарочной упаковке"],
    benefits: ["Готовый подарок", "Подходит любому типу кожи", "Выгода 1 204 рубля"],
    badge: ProductBadge.BESTSELLER,
    categories: ["sets"],
  },
  {
    slug: "ochischenie",
    name: "Озоновое очищение",
    sku: "OUDL1",
    priceRub: 1257,
    tagline: "Озоновая эмульсия для лица",
    contents: ["Тюбик 90 мл"],
    benefits: ["Мягкое очищение", "Не нарушает барьер кожи", "Первый шаг любого ухода"],
    badge: ProductBadge.BESTSELLER,
    categories: ["face"],
  },
  {
    slug: "set-lico",
    name: "Сет для лица",
    sku: "1G051H054Y252D08",
    priceRub: 4479,
    tagline: "От прыщей, дерматита, купероза и морщин",
    contents: ["Набор «Безупречно чистая кожа»", "Бокс «Стоп акне»"],
    benefits: ["Два набора по цене одного", "Максимальная выгода", "Уход на 3 месяца"],
    badge: null,
    categories: ["face", "sets"],
  },
  {
    slug: "otri-6000",
    name: "Озонированное масло «Отри 6000»",
    sku: "4X10",
    priceRub: 899,
    tagline: "От прыщей, розацеа, воспалений и грибка",
    contents: ["Оливковое масло, насыщенное озонидами"],
    benefits: ["Хватает на 6 месяцев", "Сто процентов натуральный состав", "Самая низкая цена в линейке"],
    badge: null,
    categories: ["face", "oils"],
  },
  {
    slug: "shampun",
    name: "Лечебный шампунь «Озодермис»",
    sku: "2В20",
    priceRub: 1205,
    tagline: "Против выпадения, перхоти и дерматита",
    contents: ["Тюбик 200 мл"],
    benefits: ["Лечит кожу головы", "Останавливает выпадение", "Без SLS и силиконов"],
    badge: null,
    categories: ["hair"],
  },
  {
    slug: "maska-shampun",
    name: "Набор маска и шампунь",
    sku: "2B202A15",
    priceRub: 2352,
    tagline: "Интенсивное восстановление волос",
    contents: ["Шампунь 200 мл", "Маска 150 мл"],
    benefits: ["Полный уход за волосами", "Против перхоти и выпадения", "Выгода 1 148 рублей"],
    badge: null,
    categories: ["hair", "sets"],
  },
  {
    slug: "vosstanovlenie-volos",
    name: "Полное восстановление волос",
    sku: "1A153A15",
    priceRub: 2490,
    tagline: "Защита, рост и восстановление структуры",
    contents: ["Маска для структуры волос - 150 мл", "Маска для роста - 150 мл"],
    benefits: ["Две маски разного действия", "Виден результат за месяц", "Для повреждённых волос"],
    badge: null,
    categories: ["hair", "sets"],
  },
  {
    slug: "maska-volosy",
    name: "Озодермик, маска для волос",
    sku: "2A15",
    priceRub: 1306,
    tagline: "От выпадения, перхоти, дерматита и псориаза",
    contents: ["Тюбик 150 мл"],
    benefits: ["Лечебное действие", "Успокаивает кожу головы", "Подходит при псориазе"],
    badge: null,
    categories: ["hair"],
  },
  {
    slug: "idealnoe-telo",
    name: "Идеальное тело",
    sku: "OB3",
    priceRub: 3500,
    tagline: "Комплексный уход за телом",
    contents: ["Антицеллюлитный крем - 150 мл", "Крем для ног - 150 мл", "Озонированное масло - 25 мл"],
    benefits: ["Три средства в наборе", "Против целлюлита и отёков", "Выгода 2 490 рублей"],
    badge: null,
    categories: ["body", "sets"],
  },
  {
    slug: "anticellulit",
    name: "Антицеллюлитный массажный крем",
    sku: "3Q15",
    priceRub: 1633,
    tagline: "Против целлюлита, отёков, растяжек и варикоза",
    contents: ["Тюбик 150 мл"],
    benefits: ["Разогревающий эффект", "Снимает отёки", "Улучшает микроциркуляцию"],
    badge: null,
    categories: ["body"],
  },
  {
    slug: "sos-boks",
    name: "Набор «СОС бокс»",
    sku: "SB1",
    priceRub: 1900,
    tagline: "Экстренная помощь коже и волосам",
    contents: ["Маска для волос с озонидами - 150 мл", "Крем ОЗОДЕРМИК 5% - 50 мл"],
    benefits: ["Быстрый результат", "Усиленная формула", "Два средства в наборе"],
    badge: null,
    categories: ["sets", "hair"],
  },
  {
    slug: "ozodermik-3",
    name: "Озодермик 3%",
    sku: "2D08",
    priceRub: 1195,
    tagline: "Крем от акне, постакне и купероза",
    contents: ["Тюбик 80 мл"],
    benefits: ["Базовая концентрация", "Для ежедневного применения", "Восстанавливает кожу"],
    badge: null,
    categories: ["face"],
  },
  {
    slug: "ozodermik-5",
    name: "Озодермик 5%",
    sku: "2E050",
    priceRub: 1303,
    tagline: "Действие вдвое сильнее, чем у крема 3%",
    contents: ["Тюбик 50 мл"],
    benefits: ["Усиленная концентрация", "Для запущенных случаев", "Рекомендован с 12 лет"],
    badge: null,
    categories: ["face"],
  },
  {
    slug: "dnevnoy-krem",
    name: "Дневной крем",
    sku: "OB3",
    priceRub: 1419,
    tagline: "Увлажнение, питание, дневная защита",
    contents: ["Тюбик 50 мл"],
    benefits: ["Лёгкая текстура", "Базовый дневной уход", "Подходит под макияж"],
    badge: null,
    categories: ["face"],
  },
];

async function main() {
  const categories = await prisma.category.findMany();
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  for (const [index, item] of PRODUCTS.entries()) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        sku: item.sku,
        priceKopecks: item.priceRub * 100,
        tagline: item.tagline,
        contents: item.contents,
        benefits: item.benefits,
        badge: item.badge,
        imageKey: `products/${item.slug}.jpg`,
        sortOrder: (index + 1) * 10,
        isPublished: true,
      },
      create: {
        slug: item.slug,
        name: item.name,
        sku: item.sku,
        priceKopecks: item.priceRub * 100,
        tagline: item.tagline,
        contents: item.contents,
        benefits: item.benefits,
        badge: item.badge,
        imageKey: `products/${item.slug}.jpg`,
        sortOrder: (index + 1) * 10,
        isPublished: true,
      },
    });

    await prisma.productCategory.deleteMany({ where: { productId: product.id } });
    const categoryIds = item.categories.map((slug) => {
      const id = categoryIdBySlug.get(slug);
      if (!id) {
        throw new Error(`Категория "${slug}" не найдена - запусти сначала seedReferenceData.ts`);
      }
      return id;
    });
    await prisma.productCategory.createMany({
      data: categoryIds.map((categoryId) => ({ productId: product.id, categoryId })),
    });
  }

  console.log(`Товары готовы: ${PRODUCTS.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
