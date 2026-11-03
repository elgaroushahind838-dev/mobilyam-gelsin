import { after } from "next/server";
import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { connectionStatus, disconnectWhatsapp } from "@/lib/whatsapp-connect";
import { importView, runImportBatch } from "@/lib/whatsapp-import";
import { listReviews } from "@/lib/whatsapp-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const [connection, imported, reviews] = await Promise.all([connectionStatus(), importView(), listReviews()]);
  after(() => runImportBatch().catch(() => undefined));
  return NextResponse.json({ ...connection, import: imported, reviews });
}

export async function DELETE(request: Request) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  await disconnectWhatsapp();
  return NextResponse.json({ ok: true });
}
