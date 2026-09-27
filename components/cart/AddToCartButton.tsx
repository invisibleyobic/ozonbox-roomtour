"use client";

import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";

// Кнопка «В корзину» (profiles/glavnaya.md, правило 7). Товар кладётся
// мгновенно, без сервера (04-потоки-данных.md, событие 3).
export function AddToCartButton({
  productId,
  productName,
  size = "md",
}: {
  productId: string;
  productName: string;
  size?: "sm" | "md" | "lg";
}) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const timer = window.setTimeout(() => setJustAdded(false), 1400);
    return () => window.clearTimeout(timer);
  }, [justAdded]);

  return (
    <button
      type="button"
      className={`btn btn--primary btn--${size}${justAdded ? " is-added" : ""}`}
      aria-label={`Положить в корзину: ${productName}`}
      onClick={() => {
        add(productId);
        setJustAdded(true);
      }}
    >
      {justAdded ? "Добавлено" : "В корзину"}
    </button>
  );
}
