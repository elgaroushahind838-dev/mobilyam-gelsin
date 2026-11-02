import { NextResponse } from "next/server";
import { z } from "zod";
import { adminCookieName, createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { rejectCrossSite } from "@/lib/csrf";
import { clearLoginFailures, clientIp, loginBlocked, recordLoginFailure } from "@/lib/login-guard";
import { passwordMatches } from "@/lib/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.looseObject({ password: z.string().max(500).optional() });

export async function POST(request: Request) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD ortam değişkeni tanımlı değil. Vercel proje ayarlarından ekleyin." },
      { status: 503 },
    );
  }

  const ip = clientIp(request);
  const locked = await loginBlocked(ip);
  if (locked) {
    return NextResponse.json(
      { error: "Çok fazla deneme. Bir süre sonra tekrar deneyin." },
      { status: 429, headers: { "Retry-After": String(locked) } },
    );
  }

  const raw = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raw && typeof raw === "object" ? raw : {});
  const password = parsed.success ? (parsed.data.password ?? "") : "";
  if (!(await passwordMatches(password, expected))) {
    const retryAfter = await recordLoginFailure(ip);
    if (retryAfter) {
      return NextResponse.json(
        { error: "Çok fazla deneme. Bir süre sonra tekrar deneyin." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }
    return NextResponse.json({ error: "Parola hatalı" }, { status: 401 });
  }

  await clearLoginFailures(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName(), await createSessionToken(), sessionCookieOptions());
  return response;
}
