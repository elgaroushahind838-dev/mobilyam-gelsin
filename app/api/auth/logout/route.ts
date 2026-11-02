import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookieName, revokeSessionToken, sessionCookieOptions } from "@/lib/auth";
import { rejectCrossSite } from "@/lib/csrf";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const jar = await cookies();
  await revokeSessionToken(jar.get(adminCookieName())?.value);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName(), "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
