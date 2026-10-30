import { NextResponse } from "next/server";
import { getStore, StoreUnavailable } from "@/lib/store";

export const dynamic = "force-dynamic";

type IncomingMessage = {
  from?: string;
  type?: string;
  text?: { body?: string };
};

function messagesFromPayload(payload: unknown): IncomingMessage[] {
  if (!payload || typeof payload !== "object") return [];
  const entry = (payload as { entry?: unknown }).entry;
  if (!Array.isArray(entry)) return [];
  const found: IncomingMessage[] = [];
  for (const item of entry) {
    const changes = (item as { changes?: unknown }).changes;
    if (!Array.isArray(changes)) continue;
    for (const change of changes) {
      const messages = (change as { value?: { messages?: IncomingMessage[] } }).value?.messages;
      if (Array.isArray(messages)) found.push(...messages);
    }
  }
  return found;
}

async function signatureMatches(request: Request, raw: string) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  const header = request.headers.get("x-hub-signature-256") ?? "";
  if (!secret || !header.startsWith("sha256=")) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
  const expected = Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return header.slice("sha256=".length) === expected;
}

export async function GET(request: Request) {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!verifyToken) {
    return NextResponse.json(
      { configured: false, message: "WhatsApp webhook henüz bağlı değil. WHATSAPP_VERIFY_TOKEN tanımlayın." },
      { status: 501 },
    );
  }
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === verifyToken) return new Response(challenge ?? "", { status: 200 });
  return new Response("forbidden", { status: 403 });
}

export async function POST(request: Request) {
  if (!process.env.WHATSAPP_APP_SECRET || !process.env.WHATSAPP_VERIFY_TOKEN) {
    return NextResponse.json(
      { configured: false, message: "WhatsApp Business Cloud API bilgileri tanımlı değil. Kayıtlar şimdilik paneldeki yapıştırma akışından eklenir." },
      { status: 501 },
    );
  }
  const raw = await request.text();
  if (!(await signatureMatches(request, raw))) {
    return NextResponse.json({ error: "İmza doğrulanamadı" }, { status: 401 });
  }
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  try {
    const store = getStore();
    const created = [];
    for (const message of messagesFromPayload(payload)) {
      if (message.type !== "text" || !message.text?.body || !message.from) continue;
      const appointment = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const measurement = await store.createMeasurement({
        customerName: "WhatsApp müşterisi",
        phone: message.from,
        address: "Adres WhatsApp mesajından tamamlanacak",
        appointmentAt: appointment,
        notes: message.text.body,
      });
      created.push(measurement.id);
    }
    return NextResponse.json({ ok: true, created });
  } catch (error) {
    if (error instanceof StoreUnavailable) return NextResponse.json({ error: error.message, setup: true }, { status: 503 });
    throw error;
  }
}
