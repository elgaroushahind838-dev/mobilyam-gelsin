import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookieName, verifySessionToken } from "./auth";
import { getStore, StoreUnavailable } from "./store";
import type { Store } from "./store/types";

export async function requireAdmin(): Promise<Store | NextResponse> {
  const jar = await cookies();
  const ok = await verifySessionToken(jar.get(adminCookieName())?.value);
  if (!ok) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  try {
    return getStore();
  } catch (error) {
    if (error instanceof StoreUnavailable) {
      return NextResponse.json({ error: error.message, setup: true }, { status: 503 });
    }
    throw error;
  }
}

export function isStore(value: Store | NextResponse): value is Store {
  return !(value instanceof NextResponse);
}
