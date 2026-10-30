import { NextResponse } from "next/server";
import { adminCookieName, sessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName(), "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
