import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { formatLira } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const summary = await store.dashboardSummary();
  return NextResponse.json({
    activeOrders: summary.activeOrders,
    pendingMeasurements: summary.pendingMeasurements,
    monthRevenue: summary.monthRevenue,
    monthRevenueLabel: formatLira(summary.monthRevenue),
  });
}
