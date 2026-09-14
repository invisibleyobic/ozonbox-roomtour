import Link from "next/link";
import type { Product } from "@prisma/client";
import { publicUrl } from "@/lib/storage";

const BADGE_LABEL: Record<string, string> = {
  HIT: "Хит",
  BESTSELLER: "Бестселлер",
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/catalog/${product.slug}`} className="product-card">
      <div className="product-card__media">
        {product.imageKey && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={publicUrl(product.imageKey)} alt={product.imageAlt ?? product.name} loading="lazy" />
        )}
        {product.badge && <span className="product-card__badge">{BADGE_LABEL[product.badge]}</span>}
      </div>
      <div className="product-card__body">
        <p className="product-card__name">{product.name}</p>
        <p className="product-card__price">{(product.priceKopecks / 100).toLocaleString("ru-RU")} ₽</p>
      </div>
    </Link>
  );
}
