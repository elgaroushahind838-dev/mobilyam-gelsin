import { NextResponse } from "next/server";
import { z } from "zod";

const text = (max: number) => z.string().max(max);
const l10n = z
  .looseObject({
    tr: text(8000).optional(),
    en: text(8000).optional(),
    ar: text(8000).optional(),
  })
  .optional();

export const orderSchema = z.looseObject({
  customerName: text(200).optional(),
  phone: text(40).optional(),
  product: text(300).optional(),
  price: text(40).optional(),
  orderDate: text(40).optional(),
  status: text(20).optional(),
  address: text(500).optional(),
  notes: text(4000).optional(),
  action: text(20).optional(),
});

export const measurementSchema = z.looseObject({
  customerName: text(200).optional(),
  phone: text(40).optional(),
  address: text(500).optional(),
  appointmentAt: text(80).optional(),
  notes: text(4000).optional(),
  status: z.enum(["scheduled", "done", "cancelled"]).optional(),
  price: text(40).optional(),
});

export const productSchema = z.looseObject({
  name: text(300).optional(),
  nameEn: text(300).optional(),
  nameAr: text(300).optional(),
  description: text(8000).optional(),
  descriptionEn: text(8000).optional(),
  descriptionAr: text(8000).optional(),
  categorySlug: text(80).optional(),
  tag: text(120).optional(),
  subtypeSlug: text(80).nullable().optional(),
  imageUrl: text(2000).optional(),
  images: z.array(text(2000)).max(24).optional(),
  bestSeller: z.boolean().optional(),
  bestSellerOrder: z.number().finite().min(0).max(1000000).optional(),
});

export const packageSchema = z.looseObject({
  slug: text(120).optional(),
  active: z.boolean().optional(),
  displayOrder: z.number().finite().min(-1000000).max(1000000).optional(),
  cardLine1: l10n,
  cardLine2: l10n,
  name: l10n,
  description: l10n,
  bedroomTitle: l10n,
  bedroomDescription: l10n,
  livingTitle: l10n,
  livingDescription: l10n,
  diningTitle: l10n,
  diningDescription: l10n,
  included: z.array(l10n).max(40).optional(),
  items: z
    .array(
      z.object({
        productId: text(80),
        room: z.enum(["bedroom", "living", "dining", "entry"]),
        quantity: z.number().int().min(1).max(12),
      }),
    )
    .max(24)
    .optional(),
  tabletop: l10n,
  chairs: l10n,
  expert: l10n,
  fabrics: z.array(l10n).max(40).optional(),
  woods: z.array(z.looseObject({ color: text(40).optional(), name: l10n })).max(40).optional(),
  sofaColors: z.array(z.looseObject({ color: text(40).optional(), name: l10n })).max(40).optional(),
  coverImage: text(2000).optional(),
  images: z
    .looseObject({
      bed: z.array(text(2000)).max(24).optional(),
      sofa: z.array(text(2000)).max(24).optional(),
      dining: z.array(text(2000)).max(24).optional(),
    })
    .optional(),
});

export const subtypeSchema = z.looseObject({
  roomSlug: text(80).optional(),
  slug: text(80).optional(),
  displayOrder: z.number().finite().min(-1000000).max(1000000).optional(),
  labelTr: text(200).optional(),
  label: z
    .looseObject({
      tr: text(200).optional(),
      en: text(200).optional(),
      ar: text(200).optional(),
    })
    .optional(),
});

const idPattern = /^[A-Za-z0-9_-]{1,80}$/;

export function invalidId(id: string): boolean {
  return !idPattern.test(id);
}

export function schemaError(schema: z.ZodType, body: unknown): string | null {
  return schema.safeParse(body).success ? null : "Geçersiz istek";
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown> | NextResponse> {
  let raw: unknown = {};
  try {
    raw = await request.json();
  } catch {
    raw = {};
  }
  if (raw == null) raw = {};
  const parsed = z.record(z.string(), z.unknown()).safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  return parsed.data;
}

export function isJsonBody(value: Record<string, unknown> | NextResponse): value is Record<string, unknown> {
  return !(value instanceof NextResponse);
}

export function isSafeMediaUrl(value: string): boolean {
  if (!value || value.length > 2000) return false;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !value.includes("..")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
