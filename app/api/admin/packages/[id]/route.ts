import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { packageFromBody } from "@/lib/records";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const store = await requireAdmin();
  if (!isStore(store)) return store;
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const input = packageFromBody(body);
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  const weddingPackage = await store.updatePackage(id, input);
  if (!weddingPackage) return NextResponse.json({ error: "Paket bulunamadı" }, { status: 404 });
  return NextResponse.json({ package: weddingPackage });
}

export async function DELETE(_request: Request, context: Context) {
  const store = await requireAdmin();
  if (!isStore(store)) return store;
  const { id } = await context.params;
  const ok = await store.deletePackage(id);
  if (!ok) return NextResponse.json({ error: "Paket bulunamadı" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
