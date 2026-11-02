import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { todayIstanbul } from "./format";

export type AnalyticsEventName = "page_view" | "product_view" | "impression" | "card_click" | "whatsapp" | "phone" | "map";

export type AnalyticsRow = {
  day: string;
  event: AnalyticsEventName;
  path: string;
  product: string;
  section: string;
  language: "tr" | "en" | "ar";
  device: "mobile" | "tablet" | "desktop";
  source: string;
  visitor: string | null;
};

export type AnalyticsReport = {
  totals: Record<AnalyticsEventName, number> & { visitors: number };
  series: { day: string; views: number; visitors: number }[];
  topViews: { slug: string; total: number }[];
  topWhatsapp: { slug: string; total: number }[];
  sources: { source: string; total: number }[];
  languages: { language: string; total: number }[];
  devices: { device: string; total: number }[];
};

type Query = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;

const filePath = path.join(process.cwd(), "data", "analytics.json");
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|telegram|headless|lighthouse|pagespeed|pingdom|monitor|curl|wget/i;
let dbReady: Promise<Query> | null = null;
let queue: Promise<unknown> = Promise.resolve();
const recent = new Map<string, { start: number; count: number }>();

function mode(): "postgres" | "file" | "unavailable" {
  if (process.env.DATABASE_URL) return "postgres";
  if (process.env.VERCEL) return "unavailable";
  return "file";
}

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(() => undefined, () => undefined);
  return run;
}

export function isBot(request: Request) {
  return BOT.test(request.headers.get("user-agent") || "");
}

export function hasAdminCookie(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.split(";").some((part) => {
    const [name, value] = part.trim().split("=");
    return name === "mg_admin" && Boolean(value);
  });
}

export function visitorHash(ip: string, day: string) {
  if (!ip || ip === "unknown") return null;
  const salt = process.env.ADMIN_SESSION_SECRET || "mobilyam-analytics-v1";
  return createHash("sha256").update(`${salt}|${day}|${ip}`).digest("hex").slice(0, 16);
}

export function allowAnalyticsWrite(visitor: string | null) {
  const key = visitor || "anon";
  const now = Date.now();
  const current = recent.get(key);
  if (!current || now - current.start > 60_000) {
    recent.set(key, { start: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= 40;
}

function emptyTotals(): AnalyticsReport["totals"] {
  return { page_view: 0, product_view: 0, impression: 0, card_click: 0, whatsapp: 0, phone: 0, map: 0, visitors: 0 };
}

function shiftDay(day: string, delta: number) {
  const [year, month, date] = day.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, date + delta));
  return next.toISOString().slice(0, 10);
}

export function rangeBounds(range: "today" | "7" | "30") {
  const end = todayIstanbul();
  const start = range === "today" ? end : shiftDay(end, range === "7" ? -6 : -29);
  const days: string[] = [];
  for (let cursor = start; cursor <= end; cursor = shiftDay(cursor, 1)) days.push(cursor);
  return { start, end, days };
}

async function database() {
  if (!dbReady) {
    const sql = neon(process.env.DATABASE_URL!) as unknown as Query;
    dbReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS analytics_events (
        day date NOT NULL,
        event text NOT NULL,
        path text NOT NULL DEFAULT '',
        product_slug text,
        section text,
        language text NOT NULL DEFAULT 'tr',
        device text NOT NULL DEFAULT 'desktop',
        source text NOT NULL DEFAULT 'direct',
        visitor_hash text,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`CREATE INDEX IF NOT EXISTS analytics_day_event_idx ON analytics_events (day, event)`;
      await sql`CREATE INDEX IF NOT EXISTS analytics_product_event_idx ON analytics_events (product_slug, event)`;
      return sql;
    })();
  }
  return dbReady;
}

async function readFileRows(): Promise<AnalyticsRow[]> {
  try {
    const parsed = JSON.parse(await readFile(filePath, "utf8")) as { rows?: AnalyticsRow[] };
    return Array.isArray(parsed.rows) ? parsed.rows : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function recordAnalytics(rows: AnalyticsRow[]) {
  if (!rows.length || mode() === "unavailable") return;
  if (mode() === "file") {
    await withLock(async () => {
      const existing = await readFileRows();
      const cutoff = shiftDay(todayIstanbul(), -120);
      const next = existing.filter((row) => row.day >= cutoff).concat(rows).slice(-8000);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, JSON.stringify({ rows: next }));
    });
    return;
  }
  const sql = await database();
  const payload = JSON.stringify(rows.map((row) => ({
    day: row.day,
    event: row.event,
    path: row.path,
    product: row.product,
    section: row.section,
    language: row.language,
    device: row.device,
    source: row.source,
    visitor: row.visitor,
  })));
  await sql`INSERT INTO analytics_events (day, event, path, product_slug, section, language, device, source, visitor_hash)
    SELECT e.day::date, e.event, e.path, NULLIF(e.product, ''), NULLIF(e.section, ''), e.language, e.device, e.source, NULLIF(e.visitor, '')
    FROM jsonb_to_recordset(${payload}::jsonb) AS e(
      day text, event text, path text, product text, section text, language text, device text, source text, visitor text
    )`;
}

function summarize(rows: AnalyticsRow[], days: string[]): AnalyticsReport {
  const totals = emptyTotals();
  const byDay = new Map(days.map((day) => [day, { views: 0, visitors: new Set<string>() }]));
  const views = new Map<string, number>();
  const whatsapp = new Map<string, number>();
  const sources = new Map<string, number>();
  const languages = new Map<string, number>();
  const devices = new Map<string, number>();
  for (const row of rows) {
    totals[row.event] += 1;
    if (row.event === "page_view") {
      const bucket = byDay.get(row.day);
      if (bucket) {
        bucket.views += 1;
        if (row.visitor) bucket.visitors.add(row.visitor);
      }
      sources.set(row.source, (sources.get(row.source) || 0) + 1);
      languages.set(row.language, (languages.get(row.language) || 0) + 1);
      devices.set(row.device, (devices.get(row.device) || 0) + 1);
    }
    if (row.event === "product_view" && row.product) views.set(row.product, (views.get(row.product) || 0) + 1);
    if (row.event === "whatsapp") whatsapp.set(row.product || "", (whatsapp.get(row.product || "") || 0) + 1);
  }
  const dayVisitors = new Set<string>();
  for (const row of rows) {
    if (row.event === "page_view" && row.visitor) dayVisitors.add(`${row.day}:${row.visitor}`);
  }
  totals.visitors = dayVisitors.size;
  const top = (map: Map<string, number>) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([slug, total]) => ({ slug, total }));
  const ranked = (map: Map<string, number>) => [...map.entries()].sort((a, b) => b[1] - a[1]).map(([key, total]) => ({ key, total }));
  return {
    totals,
    series: days.map((day) => ({ day, views: byDay.get(day)?.views || 0, visitors: byDay.get(day)?.visitors.size || 0 })),
    topViews: top(views),
    topWhatsapp: top(whatsapp),
    sources: ranked(sources).map((item) => ({ source: item.key, total: item.total })),
    languages: ranked(languages).map((item) => ({ language: item.key, total: item.total })),
    devices: ranked(devices).map((item) => ({ device: item.key, total: item.total })),
  };
}

export async function analyticsReport(range: "today" | "7" | "30"): Promise<AnalyticsReport> {
  const { start, end, days } = rangeBounds(range);
  if (mode() === "unavailable") return summarize([], days);
  if (mode() === "file") {
    const rows = (await readFileRows()).filter((row) => row.day >= start && row.day <= end);
    return summarize(rows, days);
  }
  const sql = await database();
  const [events, series, viewRows, whatsappRows, sourceRows, languageRows, deviceRows, visitorRows] = await Promise.all([
    sql`SELECT event, COUNT(*)::int AS total FROM analytics_events WHERE day >= ${start}::date AND day <= ${end}::date GROUP BY event`,
    sql`SELECT day::text AS day, COUNT(*)::int AS views, COUNT(DISTINCT visitor_hash)::int AS visitors
      FROM analytics_events WHERE event = 'page_view' AND day >= ${start}::date AND day <= ${end}::date GROUP BY day`,
    sql`SELECT COALESCE(product_slug, '') AS slug, COUNT(*)::int AS total FROM analytics_events
      WHERE event = 'product_view' AND product_slug IS NOT NULL AND day >= ${start}::date AND day <= ${end}::date
      GROUP BY product_slug ORDER BY total DESC LIMIT 10`,
    sql`SELECT COALESCE(product_slug, '') AS slug, COUNT(*)::int AS total FROM analytics_events
      WHERE event = 'whatsapp' AND day >= ${start}::date AND day <= ${end}::date
      GROUP BY product_slug ORDER BY total DESC LIMIT 10`,
    sql`SELECT source, COUNT(*)::int AS total FROM analytics_events
      WHERE event = 'page_view' AND day >= ${start}::date AND day <= ${end}::date GROUP BY source ORDER BY total DESC`,
    sql`SELECT language, COUNT(*)::int AS total FROM analytics_events
      WHERE event = 'page_view' AND day >= ${start}::date AND day <= ${end}::date GROUP BY language ORDER BY total DESC`,
    sql`SELECT device, COUNT(*)::int AS total FROM analytics_events
      WHERE event = 'page_view' AND day >= ${start}::date AND day <= ${end}::date GROUP BY device ORDER BY total DESC`,
    sql`SELECT COUNT(DISTINCT (day::text || ':' || visitor_hash))::int AS total FROM analytics_events
      WHERE event = 'page_view' AND visitor_hash IS NOT NULL AND day >= ${start}::date AND day <= ${end}::date`,
  ]);
  const totals = emptyTotals();
  for (const row of events) totals[String(row.event) as AnalyticsEventName] = Number(row.total ?? 0);
  totals.visitors = Number(visitorRows[0]?.total ?? 0);
  const seriesMap = new Map(series.map((row) => [String(row.day).slice(0, 10), { views: Number(row.views ?? 0), visitors: Number(row.visitors ?? 0) }]));
  const asRank = (rows: Record<string, unknown>[]) => rows.map((row) => ({ slug: String(row.slug ?? ""), total: Number(row.total ?? 0) }));
  return {
    totals,
    series: days.map((day) => ({ day, views: seriesMap.get(day)?.views || 0, visitors: seriesMap.get(day)?.visitors || 0 })),
    topViews: asRank(viewRows),
    topWhatsapp: asRank(whatsappRows),
    sources: sourceRows.map((row) => ({ source: String(row.source), total: Number(row.total ?? 0) })),
    languages: languageRows.map((row) => ({ language: String(row.language), total: Number(row.total ?? 0) })),
    devices: deviceRows.map((row) => ({ device: String(row.device), total: Number(row.total ?? 0) })),
  };
}
