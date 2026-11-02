import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { slugify } from "@/lib/format";
import { schemaError, subtypeSchema } from "@/lib/schemas";
import type { L10n } from "@/lib/types";

export const dynamic = "force-dynamic";

function labelFrom(body: Record<string, unknown>): L10n | string {
  const label = body.label && typeof body.label === "object" ? (body.label as Record<string, unknown>) : {};
  const tr = String(label.tr ?? body.labelTr ?? "").trim();
  if (!tr) return "Türkçe alt tür adı gerekli.";
  return { tr, en: String(label.en ?? tr).trim(), ar: String(label.ar ?? tr).trim() };
}

export async function GET(request: Request) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const room = new URL(request.url).searchParams.get("room") || undefined;
  return NextResponse.json({ subtypes: await store.listSubtypes(room) });
}

export async function POST(request: Request) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const body = await request.json().catch(() => ({}));
  const invalid = schemaError(subtypeSchema, body);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
  const label = labelFrom(body);
  if (typeof label === "string") return NextResponse.json({ error: label }, { status: 400 });
  const roomSlug = String(body.roomSlug ?? "").trim();
  if (!roomSlug) return NextResponse.json({ error: "Oda seçin" }, { status: 400 });
  const subtype = await store.createSubtype({
    roomSlug,
    slug: slugify(String(body.slug ?? label.tr)),
    label,
    displayOrder: Number(body.displayOrder ?? 0),
  });
  return NextResponse.json({ subtype }, { status: 201 });
}
