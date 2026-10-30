import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminCookieName, verifySessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin/giris")) return NextResponse.next();
  if (pathname === "/api/admin/export" || pathname === "/api/admin/measurements/upcoming") return NextResponse.next();

  const ok = await verifySessionToken(request.cookies.get(adminCookieName())?.value);
  if (pathname === "/admin" || pathname === "/admin/") {
    if (!ok) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/giris";
      url.search = "";
      return NextResponse.rewrite(url);
    }
    if (pathname === "/admin/") return NextResponse.next();
  }

  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin/giris";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin", "/admin/", "/admin/:path*", "/api/admin/:path*"],
};
