import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { productFromBody } from "@/lib/records";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const store = await requireAdmin();
  if (!isStore(store)) return store;
  const { id } = await context.params;
  const existing = await store.getProduct(id);
  if (!existing) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const input = productFromBody(body, existing);
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  const product = await store.updateProduct(id, { ...input, nameEn: existing.nameEn, nameAr: existing.nameAr, descriptionEn: existing.descriptionEn, descriptionAr: existing.descriptionAr, slug: existing.slug });
  return NextResponse.json({ product });
}

export async function DELETE(_request: Request, context: Context) {
  const store = await requireAdmin();
  if (!isStore(store)) return store;
  const { id } = await context.params;
  const ok = await store.deleteProduct(id);
  if (!ok) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
