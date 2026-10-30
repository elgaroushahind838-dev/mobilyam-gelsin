import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { productFromBody } from "@/lib/records";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await requireAdmin();
  if (!isStore(store)) return store;
  return NextResponse.json({ products: await store.listProducts() });
}

export async function POST(request: Request) {
  const store = await requireAdmin();
  if (!isStore(store)) return store;
  const body = await request.json().catch(() => ({}));
  const input = productFromBody(body);
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  const product = await store.createProduct(input);
  return NextResponse.json({ product }, { status: 201 });
}
