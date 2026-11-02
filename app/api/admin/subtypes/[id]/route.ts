import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { slugify } from "@/lib/format";
import { invalidId, schemaError, subtypeSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const { id } = await context.params;
  if (invalidId(id)) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const invalid = schemaError(subtypeSchema, body);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
  const current = (await store.listSubtypes()).find((item) => item.id === id);
  if (!current) return NextResponse.json({ error: "Alt tür bulunamadı" }, { status: 404 });
  const label = body.label && typeof body.label === "object" ? (body.label as Record<string, unknown>) : {};
  const subtype = await store.updateSubtype(id, {
    roomSlug: String(body.roomSlug ?? current.roomSlug),
    slug: slugify(String(body.slug ?? current.slug)),
    label: {
      tr: String(label.tr ?? current.label.tr).trim(),
      en: String(label.en ?? current.label.en).trim(),
      ar: String(label.ar ?? current.label.ar).trim(),
    },
    displayOrder: Number(body.displayOrder ?? current.displayOrder),
  });
  return NextResponse.json({ subtype });
}

export async function DELETE(request: Request, context: Context) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const { id } = await context.params;
  if (invalidId(id)) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  const ok = await store.deleteSubtype(id);
  if (!ok) return NextResponse.json({ error: "Alt tür bulunamadı" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
