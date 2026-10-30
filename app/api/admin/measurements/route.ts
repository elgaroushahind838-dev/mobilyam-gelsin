import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { measurementFromBody } from "@/lib/records";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await requireAdmin();
  if (!isStore(store)) return store;
  return NextResponse.json({ measurements: await store.listMeasurements() });
}

export async function POST(request: Request) {
  const store = await requireAdmin();
  if (!isStore(store)) return store;
  const body = await request.json().catch(() => ({}));
  const input = measurementFromBody(body);
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  const measurement = await store.createMeasurement(input);
  return NextResponse.json({ measurement }, { status: 201 });
}
