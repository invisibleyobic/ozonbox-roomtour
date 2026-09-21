import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/catalog";
import { BADGE_LABEL, formatPrice } from "@/lib/catalog/format";
import { publicUrl } from "@/lib/storage";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return { title: `${product.name} - OzoneBox` };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="product-page">
      <div className="product-page__media">
        {product.imageKey && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={publicUrl(product.imageKey)} alt={product.imageAlt ?? product.name} />
        )}
        {product.badge && <span className="product-card__badge">{BADGE_LABEL[product.badge]}</span>}
      </div>
      <div className="product-page__body">
        <h1>{product.name}</h1>
        <p className="product-page__tagline">{product.tagline}</p>
        <p className="product-page__price">{formatPrice(product.priceKopecks)}</p>
        <p className="product-page__sku">Артикул {product.sku}</p>

        <h2>Состав</h2>
        <ul>
          {product.contents.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <h2>Почему стоит взять</h2>
        <ul>
          {product.benefits.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
