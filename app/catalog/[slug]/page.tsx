import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/catalog";
import { publicUrl } from "@/lib/storage";

const BADGE_LABEL: Record<string, string> = {
  HIT: "Хит",
  BESTSELLER: "Бестселлер",
};

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
        <p className="product-page__price">{(product.priceKopecks / 100).toLocaleString("ru-RU")} ₽</p>
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
