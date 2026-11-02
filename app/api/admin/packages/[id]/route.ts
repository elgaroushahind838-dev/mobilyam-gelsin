import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { packageFromBody } from "@/lib/records";
import { invalidId } from "@/lib/schemas";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const { id } = await context.params;
  if (invalidId(id)) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const input = packageFromBody(body);
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  const weddingPackage = await store.updatePackage(id, input);
  if (!weddingPackage) return NextResponse.json({ error: "Paket bulunamadı" }, { status: 404 });
  return NextResponse.json({ package: weddingPackage });
}

export async function DELETE(request: Request, context: Context) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const { id } = await context.params;
  if (invalidId(id)) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  const ok = await store.deletePackage(id);
  if (!ok) return NextResponse.json({ error: "Paket bulunamadı" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
