import { parsePriceAmount } from "./format";
import { CATEGORIES } from "./types";
import type { MeasurementInput, OrderInput, ProductInput } from "./store/types";

export function orderFromBody(body: Record<string, unknown>, fallbackDate: string): OrderInput | string {
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

export function productFromBody(body: Record<string, unknown>, existingImages: string[] = []): ProductInput | string {
  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const price = String(body.price ?? "").trim();
  const categorySlug = String(body.categorySlug ?? "").trim();
  const category = CATEGORIES.find((item) => item.slug === categorySlug);
  if (!name || !description || !price || !category) return "Ad, açıklama, fiyat ve koleksiyon gerekli.";
  const imageUrl = String(body.imageUrl ?? "").trim();
  const images = imageUrl ? [imageUrl, ...existingImages.filter((item) => item !== imageUrl)] : existingImages;
  if (!images.filter(Boolean).length) return "Bir ürün fotoğrafı yükleyin veya görsel adresi yazın.";
  return {
    name,
    nameEn: String(body.nameEn ?? name),
    nameAr: String(body.nameAr ?? name),
    description,
    descriptionEn: String(body.descriptionEn ?? description),
    descriptionAr: String(body.descriptionAr ?? description),
    price,
    priceAmount: parsePriceAmount(price),
    categorySlug: category.slug,
    categoryLabel: category.label,
    tag: String(body.tag ?? category.label).trim() || category.label,
    width: String(body.width ?? "").trim(),
    depth: String(body.depth ?? "").trim(),
    height: String(body.height ?? "").trim(),
    images: images.filter(Boolean),
  };
}
