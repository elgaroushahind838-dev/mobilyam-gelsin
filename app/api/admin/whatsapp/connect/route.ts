import { NextResponse } from "next/server";
import { z } from "zod";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { clientIp } from "@/lib/login-guard";
import { connectWhatsapp } from "@/lib/whatsapp-connect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  code: z.string().min(8).max(2000),
  wabaId: z.string().regex(/^\d{5,30}$/),
  phoneNumberId: z.string().regex(/^\d{5,30}$/),
});

const recent = new Map<string, { start: number; count: number }>();

function allowed(ip: string) {
  const now = Date.now();
  const current = recent.get(ip);
  if (!current || now - current.start > 60 * 60 * 1000) {
    recent.set(ip, { start: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= 10;
}

export async function POST(request: Request) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  if (!allowed(clientIp(request))) {
    return NextResponse.json({ error: "Çok fazla deneme. Bir süre sonra tekrar deneyin." }, { status: 429 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  try {
    const result = await connectWhatsapp(parsed.data);
    return NextResponse.json({ ok: true, displayPhone: result.displayPhone });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bağlantı kurulamadı";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
