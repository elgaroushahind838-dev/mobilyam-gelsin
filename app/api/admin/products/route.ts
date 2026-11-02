import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { productFromBody } from "@/lib/records";
import { clampPage, searchText } from "@/lib/store/paging";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const url = new URL(request.url);
  if (!url.searchParams.has("limit")) return NextResponse.json({ products: await store.listProducts() });
  const page = await store.listProductsPage({ ...clampPage(url.searchParams.get("limit"), url.searchParams.get("offset")), q: searchText(url.searchParams.get("q")) });
  return NextResponse.json(page);
}

export async function POST(request: Request) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const body = await request.json().catch(() => ({}));
  const input = productFromBody(body);
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  const product = await store.createProduct(input);
  return NextResponse.json({ product }, { status: 201 });
}
