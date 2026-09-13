-- Ограничения, которые Prisma не умеет выразить в schema.prisma.
-- Дословный текст из блока «SQL к первой миграции» в конце prisma/schema.prisma.
-- Источник правил - architecture/03-база-данных.md, раздел 6.

-- номер заказа для человека начинается с 1000
ALTER SEQUENCE orders_number_seq RESTART WITH 1000;

-- деньги: неотрицательные, итог сходится, выгода не больше товаров и кратна рублю
ALTER TABLE orders ADD CONSTRAINT orders_money_non_negative
  CHECK (items_total_kopecks >= 0 AND discount_kopecks >= 0
         AND delivery_price_kopecks >= 0 AND total_kopecks >= 0);
ALTER TABLE orders ADD CONSTRAINT orders_total_matches
  CHECK (total_kopecks = items_total_kopecks - discount_kopecks + delivery_price_kopecks);
ALTER TABLE orders ADD CONSTRAINT orders_discount_fits
  CHECK (discount_kopecks <= items_total_kopecks);
ALTER TABLE orders ADD CONSTRAINT orders_discount_whole_rubles
  CHECK (discount_kopecks % 100 = 0);

-- состояния согласованы с отметками времени
ALTER TABLE orders ADD CONSTRAINT orders_paid_has_time
  CHECK (status <> 'PAID' OR paid_at IS NOT NULL);
ALTER TABLE orders ADD CONSTRAINT orders_shipped_has_track
  CHECK (status <> 'SHIPPED' OR (shipped_at IS NOT NULL AND track_number IS NOT NULL AND paid_at IS NOT NULL));

-- снимок промокода заполняется парой со ссылкой
ALTER TABLE orders ADD CONSTRAINT orders_promo_snapshot_pair
  CHECK ((promo_code_id IS NULL AND promo_code_snapshot IS NULL AND discount_percent_snapshot IS NULL)
      OR (promo_code_id IS NOT NULL AND promo_code_snapshot IS NOT NULL AND discount_percent_snapshot IS NOT NULL));

-- персональные данные: либо все на месте, либо стёрты все разом
ALTER TABLE orders ADD CONSTRAINT orders_personal_data_all_or_nothing
  CHECK ((personal_data_erased_at IS NULL
          AND customer_name IS NOT NULL AND customer_phone IS NOT NULL
          AND customer_email IS NOT NULL AND address_line IS NOT NULL)
      OR (personal_data_erased_at IS NOT NULL
          AND customer_name IS NULL AND customer_phone IS NULL
          AND customer_email IS NULL AND address_line IS NULL));

-- позиции заказа
ALTER TABLE order_items ADD CONSTRAINT order_items_quantity_positive CHECK (quantity > 0);
ALTER TABLE order_items ADD CONSTRAINT order_items_price_non_negative CHECK (unit_price_kopecks >= 0);
ALTER TABLE order_items ADD CONSTRAINT order_items_line_total_matches
  CHECK (line_total_kopecks = unit_price_kopecks * quantity);

-- промокод: проценты в диапазоне, лимит больше нуля, код только заглавными
ALTER TABLE promo_codes ADD CONSTRAINT promo_codes_percent_range
  CHECK (discount_percent BETWEEN 1 AND 100);
ALTER TABLE promo_codes ADD CONSTRAINT promo_codes_limit_positive CHECK (usage_limit > 0);
ALTER TABLE promo_codes ADD CONSTRAINT promo_codes_uppercase
  CHECK (code = upper(code) AND code = btrim(code) AND length(code) > 0);

-- товар и доставка: цены неотрицательные
ALTER TABLE products ADD CONSTRAINT products_price_non_negative CHECK (price_kopecks >= 0);
ALTER TABLE delivery_options ADD CONSTRAINT delivery_price_non_negative CHECK (price_kopecks >= 0);

-- у заказа не больше одного успешного платежа
CREATE UNIQUE INDEX payments_one_success_per_order
  ON payments (order_id) WHERE kind = 'PAY';

-- частичные индексы под самые частые запросы витрины и фоновых отправок
CREATE INDEX products_visible_idx
  ON products (sort_order) WHERE is_published AND deleted_at IS NULL;
CREATE INDEX delivery_options_visible_idx
  ON delivery_options (sort_order) WHERE is_enabled AND deleted_at IS NULL;
CREATE INDEX products_badge_idx
  ON products (badge) WHERE badge IS NOT NULL AND is_published AND deleted_at IS NULL;
CREATE INDEX orders_telegram_pending_idx
  ON orders (paid_at) WHERE paid_at IS NOT NULL AND telegram_notified_at IS NULL;
CREATE INDEX orders_sms_paid_pending_idx
  ON orders (paid_at) WHERE paid_at IS NOT NULL AND sms_paid_sent_at IS NULL;
CREATE INDEX orders_sms_shipped_pending_idx
  ON orders (shipped_at) WHERE shipped_at IS NOT NULL AND sms_shipped_sent_at IS NULL;
