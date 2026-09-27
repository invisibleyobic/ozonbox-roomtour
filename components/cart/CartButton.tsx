"use client";

import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";

export function CartButton() {
  const { count, open, addedTick } = useCart();
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (addedTick === 0) return;
    setBump(true);
    const timer = window.setTimeout(() => setBump(false), 600);
    return () => window.clearTimeout(timer);
  }, [addedTick]);

  return (
    <button
      type="button"
      className={`cart-btn${bump ? " is-bump" : ""}`}
      onClick={open}
      aria-label={`Корзина, товаров: ${count}`}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <path
          d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Z M9 8V6.5a3 3 0 0 1 6 0V8"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
      <span className="cart-btn__label">Корзина</span>
      <span className="cart-btn__count">{count}</span>
    </button>
  );
}
