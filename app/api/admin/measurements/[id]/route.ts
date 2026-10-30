import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { parsePriceAmount, todayIstanbul } from "@/lib/format";
import { measurementFromBody } from "@/lib/records";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const store = await requireAdmin();
  if (!isStore(store)) return store;
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const input = measurementFromBody(body);
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  const measurement = await store.updateMeasurement(id, input);
  if (!measurement) return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
  return NextResponse.json({ measurement });
}

export async function DELETE(_request: Request, context: Context) {
  const store = await requireAdmin();
  if (!isStore(store)) return store;
  const { id } = await context.params;
  const ok = await store.deleteMeasurement(id);
  if (!ok) return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request, context: Context) {
  const store = await requireAdmin();
  if (!isStore(store)) return store;
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const measurements = await store.listMeasurements();
  const current = measurements.find((item) => item.id === id);
  if (!current) return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
  const product = String(body.product ?? "").trim() || "Özel ölçü mobilya";
  const price = String(body.price ?? "").trim() || "0 TL";
  const order = await store.createOrder({
    customerName: current.customerName,
    phone: current.phone,
    product,
    price,
    priceAmount: parsePriceAmount(price),
    orderDate: todayIstanbul(),
    status: "active",
  });
  await store.deleteMeasurement(id);
  return NextResponse.json({ order }, { status: 201 });
}
