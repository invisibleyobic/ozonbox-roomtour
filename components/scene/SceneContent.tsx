import Link from "next/link";
import type { ProductView } from "@/lib/catalog/view";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export interface SceneTextProps {
  kicker: string;
  title: string;
  description: string;
  products: ProductView[];
}

// Общая начинка сцены для видео и для заглушки: одно обещание, одна кнопка
// (profiles/glavnaya.md, правило 1) и подборка сезона до 4 товаров (правило 4).
// Всё - HTML поверх фона, читается без видео и без JavaScript (правило 3).
export function SceneContent({
  kicker,
  title,
  description,
  products,
  cardRef,
  revealed = false,
}: SceneTextProps & {
  cardRef?: (index: number) => (el: HTMLDivElement | null) => void;
  revealed?: boolean;
}) {
  return (
    <>
      <div className="scene-text">
        <p className="scene-text__kicker">
          <i aria-hidden="true" />
          {kicker}
        </p>
        <h1 className="scene-text__title">{title}</h1>
        <p className="scene-text__description">{description}</p>
        <a className="btn btn--primary btn--lg scene-text__cta" href="#podborka">
          Смотреть подборку
        </a>
      </div>
      <div className="scene-products">
        {products.map((product, i) => (
          <div
            key={product.id}
            className={`scene-product${revealed ? " is-in" : ""}`}
            style={{ transitionDelay: `${i * 90}ms` }}
            ref={cardRef?.(i)}
          >
            <Link href={`/catalog/${product.slug}`} className="scene-product__link">
              {product.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.imageUrl} alt={product.imageAlt} width={560} height={560} loading="lazy" />
              )}
              <span className="scene-product__name">{product.name}</span>
            </Link>
            <div className="scene-product__foot">
              <span className="scene-product__price">{product.priceLabel}</span>
              <AddToCartButton productId={product.id} productName={product.name} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
