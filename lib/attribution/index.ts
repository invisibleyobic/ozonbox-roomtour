// Источник покупателя до создания заказа (04-потоки-данных.md, 7.1): cookie
// первой стороны, закрытая для скриптов, 30 дней. Внутри только метки канала и
// время первого визита - ничего о человеке (07-безопасность.md, раздел 1).
// Первое касание не перетирается: кто привёл человека, тот и источник.
//
// Файл без server-only и без базы: его вызывает middleware.ts, который
// работает в отдельной среде Next.js. resolveSource() (приоритет «код → метки
// → ответ в анкете → UNKNOWN», 7.2) появится вместе с заказом в фазе 3.

export const SOURCE_COOKIE = "ob_src";
export const SOURCE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const MAX_LABEL_LENGTH = 100;

export interface SourceCookie {
  utmSource: string | null;
  utmContent: string | null;
  /** Время первого визита с метками, ISO. */
  firstVisitAt: string;
}

function cleanLabel(value: string | null): string | null {
  if (!value) return null;
  // Метка приходит из адреса - чужой ввод. Оставляем печатные символы и режем длину.
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, MAX_LABEL_LENGTH);
  return cleaned || null;
}

/** Метки из адреса первого захода; null, если меток нет вовсе. */
export function sourceFromSearchParams(params: URLSearchParams, now: Date): SourceCookie | null {
  const utmSource = cleanLabel(params.get("utm_source"));
  const utmContent = cleanLabel(params.get("utm_content"));
  if (!utmSource && !utmContent) return null;
  return { utmSource, utmContent, firstVisitAt: now.toISOString() };
}

export function serializeSourceCookie(source: SourceCookie): string {
  return JSON.stringify(source);
}

export function parseSourceCookie(raw: string | undefined): SourceCookie | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<SourceCookie>;
    if (typeof data.firstVisitAt !== "string") return null;
    return {
      utmSource: cleanLabel(typeof data.utmSource === "string" ? data.utmSource : null),
      utmContent: cleanLabel(typeof data.utmContent === "string" ? data.utmContent : null),
      firstVisitAt: data.firstVisitAt,
    };
  } catch {
    return null;
  }
}
