import { NextResponse } from "next/server";
import { getStore, StoreUnavailable } from "@/lib/store";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const weddingPackage = await getStore().getPackage(slug);
    if (!weddingPackage || !weddingPackage.active) return NextResponse.json({ error: "Paket bulunamadı" }, { status: 404 });
    return NextResponse.json({ package: weddingPackage });
  } catch (error) {
    if (error instanceof StoreUnavailable) return NextResponse.json({ error: error.message }, { status: 503 });
    throw error;
  }
}
