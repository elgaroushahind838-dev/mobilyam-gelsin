import { NextResponse } from "next/server";
import { z } from "zod";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { dismissReview } from "@/lib/whatsapp-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ phone: z.string().regex(/^\d{8,20}$/) });

export async function DELETE(request: Request) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  await dismissReview(parsed.data.phone);
  return NextResponse.json({ ok: true });
}
