import { PrismaClient } from "@prisma/client";

// Один общий клиент на весь код (шаг 8 чертежа). В разработке Next.js
// перезагружает модули на каждое сохранение файла - без кэша в global
// каждый раз создавался бы новый клиент и новое соединение с базой.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
