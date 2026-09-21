"use client";

import { useEffect, useRef } from "react";
import type { ProductView } from "@/lib/catalog/view";

interface SceneFallbackProps {
  kicker: string;
  title: string;
  description: string;
  products: ProductView[];
}

// Заглушка вместо видео (00-правила-проекта.md, правило 3): CSS-фон и фото
// товаров. Это штатный режим, а не временный, поэтому не зависит ни от GSAP,
// ни вообще от того, выполнился ли JavaScript - весь текст и все карточки
// видны сразу в разметке. Плавное появление карточек при прокрутке - это
// только украшение поверх уже готовой и читаемой страницы.
export function SceneFallback({ kicker, title, description, products }: SceneFallbackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    track.classList.add("js-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
          }
        }
      },
      { threshold: 0.4 }
    );

    for (const card of cardRefs.current) {
      if (card) observer.observe(card);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="scene-track" ref={trackRef}>
      <div className="scene scene--fallback">
        <div className="scene-bg" aria-hidden="true">
          <span className="leaf leaf--1" />
          <span className="leaf leaf--2" />
          <span className="leaf leaf--3" />
        </div>
        <div className="scene-text">
          <p className="scene-text__kicker">{kicker}</p>
          <h1 className="scene-text__title">{title}</h1>
          <p className="scene-text__description">{description}</p>
        </div>
        <div className="scene-products">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="scene-product"
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
            >
              {product.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.imageUrl} alt={product.imageAlt} loading="lazy" />
              )}
              <p className="scene-product__name">{product.name}</p>
              <p className="scene-product__price">{product.priceLabel}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
