import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/catalog";
import { toProductView } from "@/lib/catalog/view";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

// Цена берётся из базы при каждом обновлении кэша (правило 2), как на главной.
export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return { title: `${product.name} - OzoneBox`, description: product.tagline };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const view = toProductView(product);

  return (
    <main className="product-page">
      {/* profiles/glavnaya.md, правило 7: у страницы товара всегда есть путь назад */}
      <Link href="/#katalog" className="back-link">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Весь каталог
      </Link>

      <div className="product-page__grid">
        <div className="product-page__media">
          {view.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={view.imageUrl} alt={view.imageAlt} width={560} height={560} />
          )}
          {view.badgeLabel && <span className="badge product-card__badge">{view.badgeLabel}</span>}
        </div>

        <div className="product-page__body">
          <h1 className="product-page__title">{product.name}</h1>
          {product.tagline && <p className="product-page__tagline">{product.tagline}</p>}
          <div className="product-page__buy">
            <p className="product-page__price">{view.priceLabel}</p>
            <AddToCartButton productId={view.id} productName={view.name} size="lg" />
          </div>
          <p className="product-page__sku">Артикул {product.sku}</p>

          {product.contents.length > 0 && (
            <section className="product-page__section">
              <h2>Состав</h2>
              <ul>
                {product.contents.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          )}

          {product.benefits.length > 0 && (
            <section className="product-page__section">
              <h2>Почему стоит взять</h2>
              <ul>
                {product.benefits.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
