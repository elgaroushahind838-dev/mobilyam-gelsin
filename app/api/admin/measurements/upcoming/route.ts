import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { istanbulClock, tomorrowIstanbul } from "@/lib/format";
import { getStore, StoreUnavailable } from "@/lib/store";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  }

  const requested = new URL(request.url).searchParams.get("date");
  const date = requested?.trim() ? requested.trim() : tomorrowIstanbul();
  if (!DATE_RE.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    return NextResponse.json({ error: "Tarih YYYY-MM-DD olmalı" }, { status: 400 });
  }

  try {
    const visits = (await getStore().listMeasurements())
      .filter((item) => item.status !== "done" && item.status !== "cancelled")
      .map((item) => ({ item, clock: istanbulClock(item.appointmentAt) }))
      .filter((entry) => entry.clock.date === date)
      .sort((a, b) => a.clock.time.localeCompare(b.clock.time))
      .map(({ item, clock }) => ({
        name: item.customerName,
        phone: item.phone,
        address: item.address,
        time: clock.time,
        notes: item.notes,
        status: item.status,
      }));

    return NextResponse.json({ date, visits });
  } catch (error) {
    if (error instanceof StoreUnavailable) {
      return NextResponse.json({ error: error.message, setup: true }, { status: 503 });
    }
    throw error;
  }
}
