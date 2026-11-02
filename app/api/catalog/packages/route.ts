import { NextResponse } from "next/server";
import { getStore, StoreUnavailable } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const packages = (await getStore().listPackages()).filter((item) => item.active);
    return NextResponse.json({ packages });
  } catch (error) {
    if (error instanceof StoreUnavailable) return NextResponse.json({ error: error.message, packages: [] }, { status: 503 });
    throw error;
  }
}
