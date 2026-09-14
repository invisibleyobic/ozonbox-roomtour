import { env } from "@/config/env";

// Прослойка файлового хранилища (шаг 6 и 8 чертежа). Пока S3 не подключён
// (нет ключей в .env), отдаём файлы из public/ самого приложения - для
// разработки этого достаточно. Как только появится MEDIA_PUBLIC_BASE_URL,
// код менять не нужно: адрес просто начнёт указывать на S3/CDN.
export function publicUrl(key: string): string {
  if (env.mediaPublicBaseUrl) {
    return `${env.mediaPublicBaseUrl}/${key}`;
  }
  return `/${key}`;
}
