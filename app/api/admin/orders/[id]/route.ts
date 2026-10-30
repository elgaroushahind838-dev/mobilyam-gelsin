import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { todayIstanbul } from "@/lib/format";
import { orderFromBody } from "@/lib/records";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const store = await requireAdmin();
  if (!isStore(store)) return store;
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
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

export async function DELETE(_request: Request, context: Context) {
  const store = await requireAdmin();
  if (!isStore(store)) return store;
  const { id } = await context.params;
  const ok = await store.deleteOrder(id);
  if (!ok) return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
