import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { connectionStatus, disconnectWhatsapp } from "@/lib/whatsapp-connect";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  return NextResponse.json(await connectionStatus());
}

export async function DELETE(request: Request) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  await disconnectWhatsapp();
  return NextResponse.json({ ok: true });
}
