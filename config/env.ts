// Типизированный доступ к переменным окружения (шаг 8 чертежа).
// Значения читаются только здесь - остальной код импортирует уже проверенный объект,
// а не обращается к process.env напрямую.

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Переменная окружения ${name} не задана. Проверь .env.`);
  }
  return value;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),

  siteUrl: optional("SITE_URL"),
  yandexMetrikaId: optional("YANDEX_METRIKA_ID"),

  telegramBotToken: optional("TELEGRAM_BOT_TOKEN"),
  telegramOrdersChatId: optional("TELEGRAM_ORDERS_CHAT_ID"),

  s3Endpoint: optional("S3_ENDPOINT"),
  s3Region: optional("S3_REGION"),
  s3Bucket: optional("S3_BUCKET"),
  s3AccessKeyId: optional("S3_ACCESS_KEY_ID"),
  s3SecretAccessKey: optional("S3_SECRET_ACCESS_KEY"),
  mediaPublicBaseUrl: optional("MEDIA_PUBLIC_BASE_URL"),

  cloudPaymentsPublicId: optional("CLOUDPAYMENTS_PUBLIC_ID"),
  cloudPaymentsApiSecret: optional("CLOUDPAYMENTS_API_SECRET"),

  shippingLinkSecret: optional("SHIPPING_LINK_SECRET"),

  smsEnabled: process.env.SMS_ENABLED === "true",
} as const;
