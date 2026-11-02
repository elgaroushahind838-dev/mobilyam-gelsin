import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { analyticsReport } from "@/lib/analytics";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

function rangeOf(value: string | null): "today" | "7" | "30" {
  if (value === "today" || value === "30") return value;
  return "7";
}

export async function GET(request: Request) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const range = rangeOf(new URL(request.url).searchParams.get("range"));
  const report = await analyticsReport(range);
  let names = new Map<string, string>();
  try {
    const catalog = getStore();
    const [products, packages] = await Promise.all([catalog.listProducts(), catalog.listPackages()]);
    names = new Map(products.map((product) => [product.slug, product.name]));
    for (const item of packages) names.set(item.slug, item.name.tr);
  } catch {
    names = new Map();
  }
  const label = (slug: string) => (slug ? names.get(slug) || slug : "Genel");
  return NextResponse.json({
    range,
    totals: report.totals,
    series: report.series,
    topViews: report.topViews.map((item) => ({ ...item, name: label(item.slug) })),
    topWhatsapp: report.topWhatsapp.map((item) => ({ ...item, name: label(item.slug) })),
    sources: report.sources,
    languages: report.languages,
    devices: report.devices,
  });
}
