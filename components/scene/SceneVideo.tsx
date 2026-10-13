"use client";

import { useRef } from "react";
import Script from "next/script";
import { SceneContent, type SceneTextProps } from "./SceneContent";

declare global {
  interface Window {
    gsap?: {
      registerPlugin: (...plugins: unknown[]) => void;
      quickTo: (
        target: unknown,
        property: string,
        vars: Record<string, unknown>
      ) => (value: number) => void;
    };
    ScrollTrigger?: {
      create: (vars: Record<string, unknown>) => void;
    };
  }
}

interface SceneVideoProps extends SceneTextProps {
  videoUrl: string;
  posterUrl?: string;
}

// Видео-скраббинг на GSAP ScrollTrigger (05-стек.md, решение о видео вместо
// 3D). Плагины грузятся лениво (next/script, strategy="lazyOnload") и не
// участвуют в первой отрисовке (05-стек.md, 1.1) - до их загрузки виден
// постер видео, текст и карточки уже на месте. Рендерится только когда в
// конфиге сезона указан videoKey - без него страница показывает
// SceneFallback, и код этого компонента не выполняется вовсе.
export function SceneVideo({ videoUrl, posterUrl, ...content }: SceneVideoProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readyRef = useRef(false);

  const initScrub = () => {
    const { gsap, ScrollTrigger } = window;
    const video = videoRef.current;
    const track = trackRef.current;
    if (!gsap || !ScrollTrigger || !video || !track || readyRef.current) return;
    readyRef.current = true;

    gsap.registerPlugin(ScrollTrigger);
    const setTime = gsap.quickTo(video, "currentTime", { duration: 0 });

    const attach = () => {
      ScrollTrigger!.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self: { progress: number }) => {
          if (video.duration) setTime(self.progress * video.duration);
        },
      });
    };

    if (video.readyState >= 1) attach();
    else video.addEventListener("loadedmetadata", attach, { once: true });
  };

  return (
    <>
      <Script src="/vendor/gsap/gsap.min.js" strategy="lazyOnload" onLoad={initScrub} />
      <Script src="/vendor/gsap/ScrollTrigger.min.js" strategy="lazyOnload" onLoad={initScrub} />
      <div className="scene-track" ref={trackRef}>
        <span id="podborka" className="scene-anchor" />
        <div className="scene scene--video">
          <video
            ref={videoRef}
            className="scene-video"
            src={videoUrl}
            poster={posterUrl}
            muted
            playsInline
            preload="metadata"
          />
          <SceneContent {...content} revealed />
        </div>
      </div>
    </>
  );
}
