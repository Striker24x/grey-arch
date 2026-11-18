import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "./lib/i18n";
import { SESSION_COOKIE, verifySessionToken } from "./lib/admin-auth";

// Locales that existed on the live site in the past but were removed. Old links
// (search results, bookmarks) are permanently redirected to the default locale
// with the rest of the path preserved, e.g. /<old>/studio -> /en/studio.
const RETIRED_LOCALES = ["ar"];

function getPreferredLocale(request: NextRequest): string {
  // Unknown / retired cookie values (e.g. a stale NEXT_LOCALE from a removed
  // language) are ignored and fall through to Accept-Language / default.
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

  // ── Admin API guard ───────────────────────────────────────
  // Every /api/admin/* endpoint requires a valid admin session (except the
  // login/logout endpoint itself). Other /api routes (contact form, job
  // applications) stay public.
  if (pathname.startsWith("/api/")) {
    if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/auth")) {
      const token = request.cookies.get(SESSION_COOKIE)?.value;
      if (!token || !(await verifySessionToken(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    return NextResponse.next();
  }

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

  // ── Retired locales → permanent redirect to the default locale ──
  const retired = RETIRED_LOCALES.find(
    (old) => pathname === `/${old}` || pathname.startsWith(`/${old}/`)
  );
  if (retired) {
    const rest = pathname.slice(retired.length + 1); // "" or "/studio/..."
    const newUrl = new URL(`/${defaultLocale}${rest}`, request.url);
    newUrl.search = request.nextUrl.search;
    const res = NextResponse.redirect(newUrl, 308);
    if (request.cookies.get("NEXT_LOCALE")?.value === retired) {
      res.cookies.set("NEXT_LOCALE", defaultLocale, { path: "/", maxAge: 31536000 });
    }
    return res;
  }

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
  matcher: ["/((?!_next|images|favicon.ico|icon.svg|apple-icon.png|robots.txt|sitemap.xml).*)"],
};

