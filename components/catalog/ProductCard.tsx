import Link from "next/link";
import type { ProductView } from "@/lib/catalog/view";

export function ProductCard({ product }: { product: ProductView }) {
  return (
    <Link href={`/catalog/${product.slug}`} className="product-card">
      <div className="product-card__media">
        {product.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.imageAlt} loading="lazy" />
        )}
        {product.badgeLabel && <span className="product-card__badge">{product.badgeLabel}</span>}
      </div>
      <div className="product-card__body">
        <p className="product-card__name">{product.name}</p>
        <p className="product-card__price">{product.priceLabel}</p>
      </div>
    </Link>
  );
}
