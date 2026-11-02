import { parsePriceAmount, slugify } from "./format";
import { isSafeMediaUrl, measurementSchema, orderSchema, packageSchema, productSchema, schemaError } from "./schemas";
import { CATEGORIES } from "./types";
import type { L10n, WeddingPackage } from "./types";
import type { MeasurementInput, OrderInput, ProductInput } from "./store/types";

export function orderFromBody(body: Record<string, unknown>, fallbackDate: string): OrderInput | string {
  const invalid = schemaError(orderSchema, body);
  if (invalid) return invalid;
  const customerName = String(body.customerName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const product = String(body.product ?? "").trim();
  const price = String(body.price ?? "").trim();
  const orderDate = String(body.orderDate ?? fallbackDate).trim();
  if (!customerName || !phone || !product || !price) return "Ad, telefon, ürün ve fiyat gerekli.";
  return {
    customerName,
    phone,
    product,
    price,
    priceAmount: parsePriceAmount(price),
    orderDate,
    status: body.status === "completed" ? "completed" : "active",
  };
}

export function measurementFromBody(body: Record<string, unknown>): MeasurementInput | string {
  const invalid = schemaError(measurementSchema, body);
  if (invalid) return invalid;
  const customerName = String(body.customerName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const address = String(body.address ?? "").trim();
  const appointmentAt = String(body.appointmentAt ?? "").trim();
  const notes = String(body.notes ?? "").trim();
  if (!customerName || !phone || !address || !appointmentAt) return "Ad, telefon, adres ve randevu zamanı gerekli.";
  const date = new Date(appointmentAt);
  if (Number.isNaN(date.getTime())) return "Randevu tarihi geçersiz.";
  return { customerName, phone, address, appointmentAt: date.toISOString(), notes };
}

function l10n(value: unknown, fallback = ""): L10n {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    tr: String(record.tr ?? fallback).trim(),
    en: String(record.en ?? record.tr ?? fallback).trim(),
    ar: String(record.ar ?? record.tr ?? fallback).trim(),
  };
}

function l10nList(value: unknown): L10n[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => l10n(item)).filter((item) => item.tr || item.en || item.ar);
}

function colorList(value: unknown): { color: string; name: L10n }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      return { color: String(record.color ?? "#8c7f73"), name: l10n(record.name, "Renk") };
    })
    .filter((item) => item.name.tr || item.name.en || item.name.ar);
}

function imageList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? "").trim()).filter(isSafeMediaUrl);
}

export function packageFromBody(body: Record<string, unknown>): Omit<WeddingPackage, "id" | "createdAt"> | string {
  const invalid = schemaError(packageSchema, body);
  if (invalid) return invalid;
  const name = l10n(body.name);
  if (!name.tr) return "Türkçe paket adı gerekli.";
  const images = body.images && typeof body.images === "object" ? (body.images as Record<string, unknown>) : {};
  const bed = imageList(images.bed);
  const sofa = imageList(images.sofa);
  const dining = imageList(images.dining);
  const requestedCover = String(body.coverImage ?? "").trim();
  const coverImage = (isSafeMediaUrl(requestedCover) ? requestedCover : "") || bed[0] || sofa[0] || dining[0] || "";
  if (!coverImage || !bed.length || !sofa.length || !dining.length) return "Kapak ve üç bölüm için en az bir görsel gerekli.";
  return {
    slug: slugify(String(body.slug ?? name.tr)),
    active: body.active !== false,
    displayOrder: Number.isFinite(Number(body.displayOrder)) ? Number(body.displayOrder) : 0,
    cardLine1: l10n(body.cardLine1, name.tr),
    cardLine2: l10n(body.cardLine2, "Paket"),
    name,
    description: l10n(body.description),
    bedroomTitle: l10n(body.bedroomTitle, "Yatak Odası Takımı"),
    bedroomDescription: l10n(body.bedroomDescription),
    livingTitle: l10n(body.livingTitle, "Oturma Grubu"),
    livingDescription: l10n(body.livingDescription),
    diningTitle: l10n(body.diningTitle, "Yemek Odası"),
    diningDescription: l10n(body.diningDescription),
    included: l10nList(body.included),
    tabletop: l10n(body.tabletop),
    chairs: l10n(body.chairs),
    expert: l10n(body.expert),
    fabrics: l10nList(body.fabrics),
    woods: colorList(body.woods),
    sofaColors: colorList(body.sofaColors),
    coverImage,
    images: { bed, sofa, dining },
  };
}

export function productFromBody(
  body: Record<string, unknown>,
  existing?: {
    images?: string[];
    price?: string;
    priceAmount?: number;
    width?: string;
    depth?: string;
    height?: string;
    bestSeller?: boolean;
    bestSellerOrder?: number;
    subtypeSlug?: string | null;
  },
): ProductInput | string {
  const invalid = schemaError(productSchema, body);
  if (invalid) return invalid;
  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const categorySlug = String(body.categorySlug ?? "").trim();
  const category = CATEGORIES.find((item) => item.slug === categorySlug);
  if (!name || !description || !category) return "Ad, açıklama ve koleksiyon gerekli.";
  const existingImages = existing?.images ?? [];
  const postedImages = Array.isArray(body.images) ? body.images.map((item) => String(item ?? "").trim()).filter(isSafeMediaUrl) : [];
  const imageUrl = String(body.imageUrl ?? "").trim();
  const safeImageUrl = isSafeMediaUrl(imageUrl) ? imageUrl : "";
  const images = postedImages.length
    ? postedImages
    : safeImageUrl
      ? [safeImageUrl, ...existingImages.filter((item) => item !== safeImageUrl && isSafeMediaUrl(item))]
      : existingImages.filter(isSafeMediaUrl);
  if (!images.filter(Boolean).length) return "En az bir ürün fotoğrafı yükleyin.";
  const subtypeSlug = body.subtypeSlug === null || body.subtypeSlug === "" ? null : String(body.subtypeSlug ?? existing?.subtypeSlug ?? "").trim() || null;
  return {
    name,
    nameEn: String(body.nameEn ?? name),
    nameAr: String(body.nameAr ?? name),
    description,
    descriptionEn: String(body.descriptionEn ?? description),
    descriptionAr: String(body.descriptionAr ?? description),
    price: existing?.price ?? "",
    priceAmount: existing?.priceAmount ?? 0,
    categorySlug: category.slug,
    categoryLabel: category.label,
    tag: String(body.tag ?? category.label).trim() || category.label,
    subtypeSlug,
    width: existing?.width ?? "",
    depth: existing?.depth ?? "",
    height: existing?.height ?? "",
    bestSeller: typeof body.bestSeller === "boolean" ? body.bestSeller : Boolean(existing?.bestSeller),
    bestSellerOrder: Number.isFinite(Number(body.bestSellerOrder)) ? Number(body.bestSellerOrder) : Number(existing?.bestSellerOrder ?? 0),
    images: images.filter(Boolean),
  };
}
