import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminCookieName, verifySessionToken } from "@/lib/auth";
import { applySecurityHeaders } from "@/lib/security-headers";

function siteLang(request: NextRequest) {
  const value = request.nextUrl.searchParams.get("lang")?.toLowerCase();
  if (value === "en" || value === "ar" || value === "tr") return value;
  return "tr";
}

function withSiteHeaders(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-site-lang", siteLang(request));
  headers.set("x-pathname", request.nextUrl.pathname);
  headers.set("x-subtype", request.nextUrl.searchParams.get("tur") || "");
  return headers;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const headers = withSiteHeaders(request);
  const pass = () => applySecurityHeaders(NextResponse.next({ request: { headers } }));
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin");
  if (!isAdmin) return pass();

  if (pathname.startsWith("/admin/giris")) return pass();
  if (pathname === "/api/admin/export" || pathname === "/api/admin/measurements/upcoming") return pass();

  const ok = await verifySessionToken(request.cookies.get(adminCookieName())?.value);
  if (pathname === "/admin" || pathname === "/admin/") {
    if (!ok) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/giris";
      url.search = "";
      return applySecurityHeaders(NextResponse.rewrite(url, { request: { headers } }));
    }
    if (pathname === "/admin/") return pass();
  }

  if (ok) return pass();

  if (pathname.startsWith("/api/")) {
    return applySecurityHeaders(NextResponse.json({ error: "Giriş gerekli" }, { status: 401 }));
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin/giris";
  url.searchParams.set("next", pathname);
  return applySecurityHeaders(NextResponse.redirect(url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|images/|sw.js|manifest.webmanifest).*)"],
};
