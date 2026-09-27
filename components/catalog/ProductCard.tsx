import Link from "next/link";
import type { ProductView } from "@/lib/catalog/view";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

// Карточка каталога (design-system.md, раздел 4): фото и название ведут на
// страницу товара, кнопка кладёт в корзину одним нажатием.
export function ProductCard({ product }: { product: ProductView }) {
  return (
    <article className="product-card">
      <Link href={`/catalog/${product.slug}`} className="product-card__link">
        <div className="product-card__media">
          {product.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.imageAlt} width={560} height={560} loading="lazy" />
          )}
          {product.badgeLabel && <span className="badge product-card__badge">{product.badgeLabel}</span>}
        </div>
        <h3 className="product-card__name">{product.name}</h3>
      </Link>
      <div className="product-card__foot">
        <p className="product-card__price">{product.priceLabel}</p>
        <AddToCartButton productId={product.id} productName={product.name} size="sm" />
      </div>
    </article>
  );
}
