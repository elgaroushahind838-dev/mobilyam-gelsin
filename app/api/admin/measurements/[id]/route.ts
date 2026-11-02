import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { parsePriceAmount, todayIstanbul } from "@/lib/format";
import { measurementFromBody } from "@/lib/records";
import { invalidId, measurementSchema, schemaError } from "@/lib/schemas";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const { id } = await context.params;
  if (invalidId(id)) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const input = measurementFromBody(body);
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  const measurement = await store.updateMeasurement(id, input);
  if (!measurement) return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
  return NextResponse.json({ measurement });
}

export async function DELETE(request: Request, context: Context) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const { id } = await context.params;
  if (invalidId(id)) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  const ok = await store.deleteMeasurement(id);
  if (!ok) return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request, context: Context) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const { id } = await context.params;
  if (invalidId(id)) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const invalid = schemaError(measurementSchema, body);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
  const measurements = await store.listMeasurements();
  const current = measurements.find((item) => item.id === id);
  if (!current) return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
  if (current.status === "done" || current.status === "cancelled") {
    return NextResponse.json({ error: "Bu ölçü ziyareti kapanmış." }, { status: 409 });
  }
  const price = String(body.price ?? "").trim();
  const extraNote = String(body.notes ?? "").trim();
  const carriedNotes = current.notes.trim();
  const order = await store.createOrder({
    customerName: current.customerName,
    phone: current.phone,
    address: current.address,
    product: carriedNotes || "Özel ölçü mobilya",
    notes: extraNote,
    price,
    priceAmount: price ? parsePriceAmount(price) : 0,
    orderDate: todayIstanbul(),
    status: "active",
  });
  const updated = await store.updateMeasurement(id, {
    customerName: current.customerName,
    phone: current.phone,
    address: current.address,
    appointmentAt: current.appointmentAt,
    notes: current.notes,
    status: "done",
  });
  if (!updated) {
    await store.deleteOrder(order.id);
    return NextResponse.json({ error: "Kayıt bulunamadı" }, { status: 404 });
  }
  return NextResponse.json({ order }, { status: 201 });
}
