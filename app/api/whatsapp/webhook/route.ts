import { NextResponse } from "next/server";
import { clientIp } from "@/lib/login-guard";
import { ingestWhatsappPayload, verifyWebhookSignature } from "@/lib/whatsapp-ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const recent = new Map<string, { start: number; count: number }>();

function allowed(ip: string) {
  const now = Date.now();
  const current = recent.get(ip);
  if (!current || now - current.start > 60_000) {
    recent.set(ip, { start: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= 120;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!allowed(ip)) return new NextResponse(null, { status: 429 });
  const raw = await request.text();
  if (raw.length > 3_000_000) return new NextResponse(null, { status: 413 });
  if (!verifyWebhookSignature(raw, request.headers.get("x-hub-signature-256"))) {
    return new NextResponse(null, { status: 401 });
  }
  try {
    await ingestWhatsappPayload(JSON.parse(raw));
  } catch {
    return new NextResponse(null, { status: 500 });
  }
  return new NextResponse(null, { status: 200 });
}
