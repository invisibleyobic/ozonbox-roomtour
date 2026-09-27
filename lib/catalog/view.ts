import "server-only";
import type { Product } from "@prisma/client";
import { publicUrl } from "@/lib/storage";
import { BADGE_LABEL, formatPrice } from "./format";

// Плоское представление товара для экрана. Сервер превращает запись базы в
// готовые строки (адрес картинки, цена текстом), а клиентские компоненты
// сцены получают только их: ни адреса хранилища, ни env в браузер не уходят.
export interface ProductView {
  id: string;
  slug: string;
  name: string;
  priceKopecks: number;
  priceLabel: string;
  imageUrl: string | null;
  imageAlt: string;
  badgeLabel: string | null;
}

export function toProductView(product: Product): ProductView {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    priceKopecks: product.priceKopecks,
    priceLabel: formatPrice(product.priceKopecks),
    imageUrl: product.imageKey ? publicUrl(product.imageKey) : null,
    imageAlt: product.imageAlt ?? product.name,
    badgeLabel: product.badge ? BADGE_LABEL[product.badge] ?? null : null,
  };
}
