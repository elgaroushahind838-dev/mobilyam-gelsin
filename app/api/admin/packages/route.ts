import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { packageFromBody } from "@/lib/records";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  return NextResponse.json({ packages: await store.listPackages() });
}

export async function POST(request: Request) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const body = await request.json().catch(() => ({}));
  const input = packageFromBody(body);
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  const weddingPackage = await store.createPackage(input);
  return NextResponse.json({ package: weddingPackage }, { status: 201 });
}
