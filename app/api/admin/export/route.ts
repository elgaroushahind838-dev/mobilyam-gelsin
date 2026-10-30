import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { adminCookieName, passwordsMatch, verifySessionToken } from "@/lib/auth";
import { formatWhen, todayIstanbul } from "@/lib/format";
import { getStore, StoreUnavailable } from "@/lib/store";
import type { Measurement, Order, Product } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function bearerAllowed(request: Request): Promise<boolean> {
  const expected = process.env.EXPORT_TOKEN;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(\S+)\s*$/i.exec(header);
  if (!match) return false;
  return passwordsMatch(match[1], expected);
}

async function authorized(request: Request): Promise<boolean> {
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${adminCookieName()}=`))
    ?.slice(adminCookieName().length + 1);
  if (await verifySessionToken(token ? decodeURIComponent(token) : undefined)) return true;
  return bearerAllowed(request);
}

function orderRow(order: Order) {
  return {
    musteri: order.customerName,
    telefon: order.phone,
    urun: order.product,
    fiyat: order.price,
    tutar: order.priceAmount,
    siparisTarihi: order.orderDate,
    durum: order.status === "completed" ? "Tamamlandı" : "Aktif",
    tamamlanma: order.completedAt ? formatWhen(order.completedAt) : "",
    kayit: formatWhen(order.createdAt),
    not: "",
  };
}

const orderColumns = [
  { header: "Müşteri", key: "musteri", width: 24 },
  { header: "Telefon", key: "telefon", width: 18 },
  { header: "Ürün", key: "urun", width: 32 },
  { header: "Fiyat", key: "fiyat", width: 16 },
  { header: "Tutar (TL)", key: "tutar", width: 14 },
  { header: "Sipariş tarihi", key: "siparisTarihi", width: 16 },
  { header: "Durum", key: "durum", width: 14 },
  { header: "Tamamlanma tarihi", key: "tamamlanma", width: 22 },
  { header: "Kayıt tarihi", key: "kayit", width: 22 },
  { header: "Not", key: "not", width: 28 },
];

function addSheet(workbook: ExcelJS.Workbook, name: string, columns: ExcelJS.Column[], rows: Record<string, string | number>[]) {
  const sheet = workbook.addWorksheet(name);
  sheet.columns = columns;
  sheet.addRows(rows);
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
}

function measurementRow(item: Measurement) {
  return {
    musteri: item.customerName,
    telefon: item.phone,
    adres: item.address,
    randevu: formatWhen(item.appointmentAt),
    durum: "Ölçü ziyareti",
    not: item.notes,
    kayit: formatWhen(item.createdAt),
  };
}

function productRow(product: Product) {
  return {
    ad: product.name,
    aciklama: product.description,
    fiyat: product.price,
    tutar: product.priceAmount,
    koleksiyon: product.categoryLabel,
    etiket: product.tag,
    genislik: product.width,
    derinlik: product.depth,
    yukseklik: product.height,
    gorseller: product.images.join(", "),
    slug: product.slug,
    durum: "Vitrinde",
    not: product.description,
    kayit: formatWhen(product.createdAt),
  };
}

export async function GET(request: Request) {
  if (!(await authorized(request))) {
    return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  }

  try {
    const store = getStore();
    const [orders, measurements, products] = await Promise.all([
      store.listOrders(),
      store.listMeasurements(),
      store.listProducts(),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Mobilyam Gelsin";
    workbook.created = new Date();

    addSheet(
      workbook,
      "Aktif Siparişler",
      orderColumns as ExcelJS.Column[],
      orders.filter((order) => order.status === "active").map(orderRow),
    );
    addSheet(
      workbook,
      "Tamamlanan Siparişler",
      orderColumns as ExcelJS.Column[],
      orders.filter((order) => order.status === "completed").map(orderRow),
    );
    addSheet(
      workbook,
      "Ölçü Ziyaretleri",
      [
        { header: "Müşteri", key: "musteri", width: 24 },
        { header: "Telefon", key: "telefon", width: 18 },
        { header: "Adres", key: "adres", width: 36 },
        { header: "Randevu", key: "randevu", width: 22 },
        { header: "Durum", key: "durum", width: 16 },
        { header: "Not", key: "not", width: 40 },
        { header: "Kayıt tarihi", key: "kayit", width: 22 },
      ] as ExcelJS.Column[],
      measurements.map(measurementRow),
    );
    addSheet(
      workbook,
      "Ürünler",
      [
        { header: "Ad", key: "ad", width: 32 },
        { header: "Açıklama", key: "aciklama", width: 42 },
        { header: "Fiyat", key: "fiyat", width: 16 },
        { header: "Tutar (TL)", key: "tutar", width: 14 },
        { header: "Koleksiyon", key: "koleksiyon", width: 18 },
        { header: "Etiket", key: "etiket", width: 16 },
        { header: "Genişlik", key: "genislik", width: 12 },
        { header: "Derinlik", key: "derinlik", width: 12 },
        { header: "Yükseklik", key: "yukseklik", width: 12 },
        { header: "Görseller", key: "gorseller", width: 36 },
        { header: "Slug", key: "slug", width: 28 },
        { header: "Durum", key: "durum", width: 12 },
        { header: "Not", key: "not", width: 42 },
        { header: "Kayıt tarihi", key: "kayit", width: 22 },
      ] as ExcelJS.Column[],
      products.map(productRow),
    );

    const filename = `mobilyam-gelsin-${todayIstanbul()}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof StoreUnavailable) {
      return NextResponse.json({ error: error.message, setup: true }, { status: 503 });
    }
    throw error;
  }
}
