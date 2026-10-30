import { NextResponse } from "next/server";
import { publicProduct, SEED_PRODUCTS } from "@/lib/seed-products";
import { getStore, StoreUnavailable } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  try {
    const product = await getStore().getProduct(slug);
    if (!product) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    return NextResponse.json({ source: "store", product: publicProduct(product) });
  } catch (error) {
    if (error instanceof StoreUnavailable) {
      const product = SEED_PRODUCTS.find((item) => item.slug === slug);
      if (!product) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
      return NextResponse.json({ source: "seed", product: publicProduct(product) });
    }
    throw error;
  }
}
