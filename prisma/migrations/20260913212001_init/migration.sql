-- CreateEnum
CREATE TYPE "SourcePlatform" AS ENUM ('INSTAGRAM', 'TELEGRAM', 'VK', 'OZON', 'WB', 'YANDEX', 'SITE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('AWAITING_PAYMENT', 'PAID', 'SHIPPED');

-- CreateEnum
CREATE TYPE "ProductBadge" AS ENUM ('HIT', 'BESTSELLER');

-- CreateEnum
CREATE TYPE "PaymentKind" AS ENUM ('CHECK', 'PAY', 'FAIL');

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price_kopecks" INTEGER NOT NULL,
    "tagline" TEXT NOT NULL,
    "contents" TEXT[],
    "benefits" TEXT[],
    "badge" "ProductBadge",
    "image_key" TEXT,
    "image_alt" TEXT,
    "image_width" INTEGER,
    "image_height" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 100,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "product_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("product_id","category_id")
);

-- CreateTable
CREATE TABLE "promo_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "platform" "SourcePlatform" NOT NULL,
    "video_title" TEXT NOT NULL,
    "video_date" DATE NOT NULL,
    "utm_content" TEXT,
    "discount_percent" INTEGER NOT NULL,
    "usage_limit" INTEGER NOT NULL,
    "valid_until" DATE NOT NULL,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_options" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price_kopecks" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'AWAITING_PAYMENT',
    "customer_name" TEXT,
    "customer_phone" TEXT,
    "customer_email" TEXT,
    "address_line" TEXT,
    "delivery_option_id" TEXT NOT NULL,
    "delivery_title_snapshot" TEXT NOT NULL,
    "delivery_price_kopecks" INTEGER NOT NULL,
    "items_total_kopecks" INTEGER NOT NULL,
    "discount_kopecks" INTEGER NOT NULL DEFAULT 0,
    "total_kopecks" INTEGER NOT NULL,
    "source_platform" "SourcePlatform" NOT NULL DEFAULT 'UNKNOWN',
    "utm_source" TEXT,
    "utm_content" TEXT,
    "source_video_title" TEXT,
    "promo_code_id" TEXT,
    "promo_code_snapshot" TEXT,
    "discount_percent_snapshot" INTEGER,
    "offer_accepted_at" TIMESTAMP(3) NOT NULL,
    "privacy_accepted_at" TIMESTAMP(3) NOT NULL,
    "marketing_consent" BOOLEAN NOT NULL DEFAULT false,
    "legal_docs_version" TEXT NOT NULL,
    "paid_at" TIMESTAMP(3),
    "shipped_at" TIMESTAMP(3),
    "track_number" TEXT,
    "telegram_notified_at" TIMESTAMP(3),
    "sms_paid_sent_at" TIMESTAMP(3),
    "sms_shipped_sent_at" TIMESTAMP(3),
    "personal_data_erased_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "product_name_snapshot" TEXT NOT NULL,
    "product_sku_snapshot" TEXT NOT NULL,
    "unit_price_kopecks" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "line_total_kopecks" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "cp_transaction_id" TEXT NOT NULL,
    "kind" "PaymentKind" NOT NULL,
    "amount_kopecks" INTEGER NOT NULL,
    "reason" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_sort_order_idx" ON "categories"("sort_order");

-- CreateIndex
CREATE INDEX "product_categories_category_id_idx" ON "product_categories"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");

-- CreateIndex
CREATE INDEX "promo_codes_platform_video_date_idx" ON "promo_codes"("platform", "video_date");

-- CreateIndex
CREATE INDEX "promo_codes_valid_until_idx" ON "promo_codes"("valid_until");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_options_slug_key" ON "delivery_options"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "orders_number_key" ON "orders"("number");

-- CreateIndex
CREATE INDEX "orders_status_created_at_idx" ON "orders"("status", "created_at");

-- CreateIndex
CREATE INDEX "orders_source_platform_created_at_idx" ON "orders"("source_platform", "created_at");

-- CreateIndex
CREATE INDEX "orders_promo_code_id_status_idx" ON "orders"("promo_code_id", "status");

-- CreateIndex
CREATE INDEX "orders_customer_phone_idx" ON "orders"("customer_phone");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_items_order_id_product_id_key" ON "order_items"("order_id", "product_id");

-- CreateIndex
CREATE INDEX "payments_order_id_idx" ON "payments"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_cp_transaction_id_kind_key" ON "payments"("cp_transaction_id", "kind");

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_option_id_fkey" FOREIGN KEY ("delivery_option_id") REFERENCES "delivery_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
