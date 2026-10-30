import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { todayIstanbul } from "@/lib/format";
import { orderFromBody } from "@/lib/records";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const store = await requireAdmin();
  if (!isStore(store)) return store;
  const status = new URL(request.url).searchParams.get("status");
  const orders = await store.listOrders();
  return NextResponse.json({
    orders: status === "active" || status === "completed" ? orders.filter((order) => order.status === status) : orders,
  });
}

export async function POST(request: Request) {
  const store = await requireAdmin();
  if (!isStore(store)) return store;
  const body = await request.json().catch(() => ({}));
  const input = orderFromBody(body, todayIstanbul());
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  const order = await store.createOrder(input);
  return NextResponse.json({ order }, { status: 201 });
}
