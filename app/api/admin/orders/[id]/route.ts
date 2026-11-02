import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { todayIstanbul } from "@/lib/format";
import { orderFromBody } from "@/lib/records";
import { invalidId, orderSchema, schemaError } from "@/lib/schemas";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const { id } = await context.params;
  if (invalidId(id)) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const invalid = schemaError(orderSchema, body);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
  if (body.action === "complete") {
    const order = await store.completeOrder(id);
    if (!order) return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    return NextResponse.json({ order });
  }
  const input = orderFromBody(body, todayIstanbul());
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  const order = await store.updateOrder(id, input);
  if (!order) return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function DELETE(request: Request, context: Context) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const { id } = await context.params;
  if (invalidId(id)) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  const ok = await store.deleteOrder(id);
  if (!ok) return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
