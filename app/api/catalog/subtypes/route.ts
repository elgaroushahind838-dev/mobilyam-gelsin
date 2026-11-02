import { NextResponse } from "next/server";
import { getStore, StoreUnavailable } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const room = new URL(request.url).searchParams.get("room") || undefined;
    return NextResponse.json({ subtypes: await getStore().listSubtypes(room) });
  } catch (error) {
    if (error instanceof StoreUnavailable) return NextResponse.json({ subtypes: [] }, { status: 503 });
    throw error;
  }
}
