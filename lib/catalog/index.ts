import { prisma } from "@/lib/db/prisma";

// Читающая часть продукта (шаг 8 чертежа): товары и категории. Кэшируется
// отдельно от заказов - витрина не должна упираться в пишущие таблицы.

export function getPublishedProducts() {
  return prisma.product.findMany({
    where: { isPublished: true, deletedAt: null },
    orderBy: { sortOrder: "asc" },
  });
}

export function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isPublished: true, deletedAt: null },
  });
}

export function getCategories() {
  return prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" },
  });
}
