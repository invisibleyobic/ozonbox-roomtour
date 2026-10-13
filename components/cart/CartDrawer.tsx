"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/catalog/format";
import { discountKopecks, itemsTotalKopecks } from "@/lib/orders/money";
import { useCart } from "./CartProvider";
import { PromoCodeField, type PromoState } from "./PromoCodeField";

// Корзина-шторка (08-структура-кода.md, components/cart). Суммы считает та же
// функция, что потом посчитает заказ (lib/orders/money.ts), поэтому цифра в
// корзине и цифра в заказе не разойдутся. Оформление заказа - фаза 3, по
// решению владельца от 21.09.2026 денежный блок идёт последним.
export function CartDrawer() {
  const { lines, isOpen, close, setQuantity, remove, promoInput, setPromoInput } = useCart();
  const [promo, setPromo] = useState<PromoState>({ kind: "idle" });
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.classList.add("is-locked");
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("is-locked");
      previous?.focus();
    };
  }, [isOpen, close]);

  const itemsTotal = itemsTotalKopecks(
    lines.map((line) => ({ priceKopecks: line.product.priceKopecks, quantity: line.quantity }))
  );
  const discount = promo.kind === "applied" ? discountKopecks(itemsTotal, promo.discountPercent) : 0;

  return (
    <div className={`drawer${isOpen ? " is-open" : ""}`} aria-hidden={!isOpen}>
      <div className="drawer__overlay" onClick={close} />
      <div
        className="drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        ref={panelRef}
        inert={!isOpen}
      >
        <div className="drawer__head">
          <h2 id="cart-title" className="drawer__title">
            Корзина
          </h2>
          <button type="button" className="icon-btn" onClick={close} ref={closeRef} aria-label="Закрыть корзину">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="drawer__empty">
            <p>Корзина пока пустая.</p>
            <Link className="btn btn--secondary btn--md" href="/#katalog" onClick={close}>
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <>
            <ul className="cart-lines">
              {lines.map((line) => (
                <li key={line.productId} className="cart-line">
                  <div className="cart-line__media">
                    {line.product.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={line.product.imageUrl} alt="" width={64} height={64} />
                    )}
                  </div>
                  <div className="cart-line__info">
                    <Link className="cart-line__name" href={`/catalog/${line.product.slug}`} onClick={close}>
                      {line.product.name}
                    </Link>
                    <p className="cart-line__unit">{line.product.priceLabel} за шт.</p>
                    <div className="qty" role="group" aria-label={`Количество: ${line.product.name}`}>
                      <button
                        type="button"
                        className="qty__btn"
                        onClick={() => setQuantity(line.productId, line.quantity - 1)}
                        aria-label="Меньше"
                      >
                        −
                      </button>
                      <span className="qty__value" aria-live="polite">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        className="qty__btn"
                        onClick={() => setQuantity(line.productId, line.quantity + 1)}
                        aria-label="Больше"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-line__side">
                    <p className="cart-line__sum">{formatPrice(line.product.priceKopecks * line.quantity)}</p>
                    <button type="button" className="link-btn link-btn--mute" onClick={() => remove(line.productId)}>
                      Убрать
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <PromoCodeField value={promoInput} onChange={setPromoInput} state={promo} onState={setPromo} />

            <dl className="totals">
              <div className="totals__row">
                <dt>Товары</dt>
                <dd>{formatPrice(itemsTotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="totals__row totals__row--ok">
                  <dt>Выгода по коду</dt>
                  <dd>−{formatPrice(discount)}</dd>
                </div>
              )}
              <div className="totals__row totals__row--mute">
                <dt>Доставка</dt>
                <dd>при оформлении</dd>
              </div>
              <div className="totals__row totals__row--sum">
                <dt>Итого без доставки</dt>
                <dd>{formatPrice(itemsTotal - discount)}</dd>
              </div>
            </dl>

            <button type="button" className="btn btn--primary btn--lg btn--block" disabled>
              Оформить заказ
            </button>
            <p className="drawer__hint">Оформление и оплата подключаются на следующем этапе. Корзина сохранится.</p>
          </>
        )}
      </div>
    </div>
  );
}
