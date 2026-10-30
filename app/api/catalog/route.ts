import { NextResponse } from "next/server";
import { publicProduct, SEED_PRODUCTS } from "@/lib/seed-products";
import { getStore, StoreUnavailable } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getStore().listProducts();
    return NextResponse.json({ source: "store", products: products.map(publicProduct) });
  } catch (error) {
    if (error instanceof StoreUnavailable) {
      return NextResponse.json({ source: "seed", products: SEED_PRODUCTS.map(publicProduct) });
    }
    throw error;
  }
}
