import { NextResponse } from "next/server";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { formatLira, monthKeyIstanbul } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await requireAdmin();
  if (!isStore(store)) return store;
  const [orders, measurements] = await Promise.all([store.listOrders(), store.listMeasurements()]);
  const month = monthKeyIstanbul();
  const monthRevenue = orders
    .filter((order) => order.status === "completed" && order.completedAt && monthKeyIstanbul(new Date(order.completedAt)) === month)
    .reduce((sum, order) => sum + order.priceAmount, 0);
  return NextResponse.json({
    activeOrders: orders.filter((order) => order.status === "active").length,
    pendingMeasurements: measurements.length,
    monthRevenue,
    monthRevenueLabel: formatLira(monthRevenue),
  });
}
