"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ProductView } from "@/lib/catalog/view";

// Корзина живёт в браузере (02-сущности.md, раздел 4): сервер не участвует,
// пока человек не оформляет заказ. В localStorage лежат только id товара и
// количество - цены и названия каждый раз берутся свежими с сервера
// (products приходит из корневого макета), так что вчерашняя цена в корзине
// не застрянет. Код из ссылки (?promo=OSEN-R1) подставляется в поле промокода,
// но применяется только кнопкой - как в макете.

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface CartViewLine extends CartLine {
  product: ProductView;
}

interface CartContextValue {
  lines: CartViewLine[];
  count: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  promoInput: string;
  setPromoInput: (value: string) => void;
  /** Растёт на каждое добавление - шапка по нему «подпрыгивает» счётчиком. */
  addedTick: number;
}

const STORAGE_KEY = "ob_cart_v1";
const MAX_QUANTITY = 20;

const CartContext = createContext<CartContextValue | null>(null);

interface StoredCart {
  lines: CartLine[];
  promo: string;
}

function readStored(): StoredCart {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lines: [], promo: "" };
    const data = JSON.parse(raw) as Partial<StoredCart>;
    const lines = Array.isArray(data.lines)
      ? data.lines.filter(
          (line): line is CartLine =>
            typeof line?.productId === "string" &&
            Number.isInteger(line.quantity) &&
            line.quantity > 0
        )
      : [];
    return { lines, promo: typeof data.promo === "string" ? data.promo : "" };
  } catch {
    // Приватный режим или испорченные данные: начинаем с пустой корзины.
    return { lines: [], promo: "" };
  }
}

export function CartProvider({
  products,
  children,
}: {
  products: ProductView[];
  children: React.ReactNode;
}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [promoInput, setPromoInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [addedTick, setAddedTick] = useState(0);

  useEffect(() => {
    const stored = readStored();
    const fromLink = new URLSearchParams(window.location.search).get("promo");
    setLines(stored.lines);
    setPromoInput(fromLink ? fromLink.trim().toUpperCase().slice(0, 40) : stored.promo);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, promo: promoInput }));
    } catch {
      // Хранилище недоступно - корзина проживёт до закрытия вкладки.
    }
  }, [lines, promoInput, loaded]);

  const byId = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);

  const viewLines = useMemo(
    () =>
      lines.flatMap((line) => {
        const product = byId.get(line.productId);
        // Товар сняли с публикации - из корзины он тихо пропадает.
        return product ? [{ ...line, product }] : [];
      }),
    [lines, byId]
  );

  const add = useCallback((productId: string) => {
    setLines((current) => {
      const existing = current.find((line) => line.productId === productId);
      if (existing) {
        return current.map((line) =>
          line.productId === productId
            ? { ...line, quantity: Math.min(line.quantity + 1, MAX_QUANTITY) }
            : line
        );
      }
      return [...current, { productId, quantity: 1 }];
    });
    setAddedTick((tick) => tick + 1);
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((line) => line.productId !== productId)
        : current.map((line) =>
            line.productId === productId
              ? { ...line, quantity: Math.min(quantity, MAX_QUANTITY) }
              : line
          )
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((current) => current.filter((line) => line.productId !== productId));
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines: viewLines,
      count: viewLines.reduce((sum, line) => sum + line.quantity, 0),
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      setQuantity,
      remove,
      promoInput,
      setPromoInput,
      addedTick,
    }),
    [viewLines, isOpen, add, setQuantity, remove, promoInput, addedTick]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart вызывается только внутри CartProvider");
  return context;
}
