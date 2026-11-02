import { NextResponse } from "next/server";
import { z } from "zod";
import { allowAnalyticsWrite, hasAdminCookie, isBot, recordAnalytics, visitorHash, type AnalyticsRow } from "@/lib/analytics";
import { rejectCrossSite } from "@/lib/csrf";
import { todayIstanbul } from "@/lib/format";
import { clientIp } from "@/lib/login-guard";

export const dynamic = "force-dynamic";

const eventSchema = z.object({
  type: z.enum(["page_view", "product_view", "impression", "card_click", "whatsapp", "phone", "map"]),
  path: z.string().max(180).optional(),
  product: z.string().max(80).optional(),
  section: z.string().max(40).optional(),
});

const bodySchema = z.object({
  events: z.array(eventSchema).max(20),
  language: z.enum(["tr", "en", "ar"]).optional(),
  device: z.enum(["mobile", "tablet", "desktop"]).optional(),
  source: z.enum(["direct", "google", "instagram", "facebook", "tiktok", "whatsapp", "bing", "yandex", "other"]).optional(),
});

const sections = new Set(["bestseller", "catalog", "package", "product", "footer", "contact", "card"]);

function cleanPath(value: string | undefined) {
  const path = (value || "/").split("?")[0].slice(0, 180);
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("..") || path.startsWith("/admin")) return "";
  return path;
}

function cleanProduct(value: string | undefined) {
  const slug = (value || "").trim().toLowerCase();
  return /^[a-z0-9-]{1,80}$/.test(slug) ? slug : "";
}

export async function POST(request: Request) {
  if (rejectCrossSite(request) || isBot(request) || hasAdminCookie(request)) {
    return new NextResponse(null, { status: 204 });
  }
  const raw = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success || !parsed.data.events.length) return new NextResponse(null, { status: 204 });

  const day = todayIstanbul();
  const visitor = visitorHash(clientIp(request), day);
  if (!allowAnalyticsWrite(visitor)) return new NextResponse(null, { status: 204 });

  const rows: AnalyticsRow[] = [];
  for (const event of parsed.data.events) {
    const path = cleanPath(event.path);
    if (!path) continue;
    const section = sections.has(event.section || "") ? event.section || "" : "";
    rows.push({
      day,
      event: event.type,
      path,
      product: cleanProduct(event.product),
      section,
      language: parsed.data.language || "tr",
      device: parsed.data.device || "desktop",
      source: parsed.data.source || "direct",
      visitor,
    });
  }
  if (rows.length) {
    try {
      await recordAnalytics(rows);
    } catch {
      // The public page should not wait on or surface a storage failure.
    }
  }
  return new NextResponse(null, { status: 204 });
}
