import { getCurrentSeason } from "@/lib/season";
import { getPublishedProducts } from "@/lib/catalog";
import { publicUrl } from "@/lib/storage";
import { SceneFallback } from "@/components/scene/SceneFallback";
import { SceneVideo } from "@/components/scene/SceneVideo";
import { ProductCard } from "@/components/catalog/ProductCard";

export default async function Home() {
  const season = getCurrentSeason();
  const products = await getPublishedProducts();

  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const sceneProducts = season.productSlugs
    .map((slug) => bySlug.get(slug))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  return (
    <main>
      {season.media.videoKey ? (
        <SceneVideo
          kicker={season.kicker}
          title={season.title}
          description={season.description}
          products={sceneProducts}
          videoUrl={publicUrl(season.media.videoKey)}
          posterUrl={season.media.posterKey ? publicUrl(season.media.posterKey) : undefined}
        />
      ) : (
        <SceneFallback
          kicker={season.kicker}
          title={season.title}
          description={season.description}
          products={sceneProducts}
        />
      )}

      <section className="catalog">
        <h2 className="catalog__title">Весь каталог</h2>
        <p className="catalog__subtitle">{products.length} товаров</p>
        <div className="catalog__grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
