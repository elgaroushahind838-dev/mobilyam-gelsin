import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { todayIstanbul } from "@/lib/format";
import { orderFromBody } from "@/lib/records";
import { clampPage, searchText } from "@/lib/store/paging";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");
  const status = statusParam === "active" || statusParam === "completed" ? statusParam : undefined;
  if (!url.searchParams.has("limit")) {
    const orders = await store.listOrders();
    return NextResponse.json({ orders: status ? orders.filter((order) => order.status === status) : orders });
  }
  const page = await store.listOrdersPage({
    ...clampPage(url.searchParams.get("limit"), url.searchParams.get("offset")),
    q: searchText(url.searchParams.get("q")),
    status,
  });
  return NextResponse.json(page);
}

export async function POST(request: Request) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const body = await request.json().catch(() => ({}));
  const input = orderFromBody(body, todayIstanbul());
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  const order = await store.createOrder(input);
  return NextResponse.json({ order }, { status: 201 });
}
