import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "./lib/i18n";
import { SESSION_COOKIE, verifySessionToken } from "./lib/admin-auth";

function getPreferredLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  for (const locale of locales) {
    if (acceptLanguage.toLowerCase().includes(locale)) {
      return locale;
    }
  }

  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin auth guard ──────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (pathname.startsWith("/admin/login")) return NextResponse.next();
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token || !(await verifySessionToken(token))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }
  // ─────────────────────────────────────────────────────────

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) return NextResponse.next();

  const locale = getPreferredLocale(request);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  newUrl.search = request.nextUrl.search;
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: ["/((?!_next|api|images|favicon.ico).*)"],
};

