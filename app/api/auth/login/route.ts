import { NextResponse } from "next/server";
import { adminCookieName, createSessionToken, passwordsMatch, sessionCookieOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD ortam değişkeni tanımlı değil. Vercel proje ayarlarından ekleyin." },
      { status: 503 },
    );
  }
  const body = await request.json().catch(() => ({}));
  const password = String(body.password ?? "");
  if (!(await passwordsMatch(password, expected))) {
    return NextResponse.json({ error: "Parola hatalı" }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName(), await createSessionToken(), sessionCookieOptions());
  return response;
}
