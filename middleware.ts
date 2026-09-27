import { NextResponse, type NextRequest } from "next/server";
import {
  SOURCE_COOKIE,
  SOURCE_COOKIE_MAX_AGE,
  serializeSourceCookie,
  sourceFromSearchParams,
} from "@/lib/attribution";

// На каждый заход страницы: если пришли по ссылке с метками и cookie источника
// ещё нет - кладём её тем же ответом (04-потоки-данных.md, событие 1 и 7.1).
// Уже записанный источник не трогаем: первое касание главнее.
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  if (request.cookies.has(SOURCE_COOKIE)) return response;

  const source = sourceFromSearchParams(request.nextUrl.searchParams, new Date());
  if (!source) return response;

  response.cookies.set(SOURCE_COOKIE, serializeSourceCookie(source), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SOURCE_COOKIE_MAX_AGE,
    path: "/",
  });
  return response;
}

export const config = {
  // Только страницы: статика, картинки и API источник не несут.
  matcher: ["/((?!api|_next|vendor|products|favicon.ico).*)"],
};
