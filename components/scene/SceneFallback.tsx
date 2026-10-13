"use client";

import { useEffect, useRef } from "react";
import { SceneContent, type SceneTextProps } from "./SceneContent";

// Заглушка вместо видео (00-правила-проекта.md, правило 3): CSS-фон и фото
// товаров. Это штатный режим, а не временный, поэтому не зависит ни от GSAP,
// ни вообще от того, выполнился ли JavaScript - весь текст и все карточки
// видны сразу в разметке. Движение при прокрутке (листья, выход карточек) -
// только украшение поверх уже готовой и читаемой страницы.
export function SceneFallback(props: SceneTextProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = cardRefs.current.filter((card): card is HTMLDivElement => Boolean(card));

    track.classList.add("js-ready");

    // design-system.md, раздел 5: кто просит меньше движения - видит всё сразу.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      track.classList.add("is-static");
      for (const card of cards) card.classList.add("is-in");
      return;
    }

    // Прогресс прокрутки сцены 0..1 в CSS-переменной --p: от него плывут
    // листья, гаснет подсказка и по очереди выходят карточки подборки.
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      const progress = distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 1;
      track.style.setProperty("--p", progress.toFixed(3));
      track.classList.toggle("is-past", progress > 0.6);
      cards.forEach((card, i) => card.classList.toggle("is-in", progress > 0.08 + i * 0.1));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    const arm = window.requestAnimationFrame(() => track.classList.add("is-armed"));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(arm);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="scene-track" ref={trackRef}>
      <span id="podborka" className="scene-anchor" />
      <div className="scene scene--fallback">
        <div className="scene-bg" aria-hidden="true">
          <span className="leaf leaf--1" />
          <span className="leaf leaf--2" />
          <span className="leaf leaf--3" />
          <span className="leaf leaf--4" />
          <span className="leaf leaf--5" />
        </div>
        <SceneContent
          {...props}
          cardRef={(i) => (el) => {
            cardRefs.current[i] = el;
          }}
        />
        <div className="scene-hint" aria-hidden="true">
          Листайте вниз
        </div>
      </div>
    </div>
  );
}
