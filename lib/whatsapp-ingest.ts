import { createHmac, timingSafeEqual } from "crypto";
import { after } from "next/server";
import { z } from "zod";
import { captureConversation, normalizePhone } from "./whatsapp-capture";
import { insertMessages, latestMessageId, type StoredMessage } from "./whatsapp-store";

const payloadSchema = z.object({
  entry: z.array(z.object({
    changes: z.array(z.object({
      field: z.string().max(80).optional(),
      value: z.record(z.string(), z.unknown()).optional(),
    })).max(50).optional(),
  })).max(20).optional(),
});

type Incoming = StoredMessage;

function textOf(message: Record<string, unknown>) {
  const text = message.text as { body?: string } | undefined;
  if (typeof text?.body === "string") return text.body;
  const button = message.button as { text?: string } | undefined;
  if (typeof button?.text === "string") return button.text;
  const interactive = message.interactive as { button_reply?: { title?: string }; list_reply?: { title?: string } } | undefined;
  return interactive?.button_reply?.title || interactive?.list_reply?.title || "";
}

function asMessage(message: Record<string, unknown>, phone: string, direction: "in" | "out", profileName: string): Incoming | null {
  const id = String(message.id ?? "");
  const body = textOf(message).trim().slice(0, 4000);
  if (!id || !phone || !body) return null;
  const seconds = Number(message.timestamp ?? 0);
  const at = Number.isFinite(seconds) && seconds > 0 ? new Date(seconds * 1000).toISOString() : new Date().toISOString();
  return { id: id.slice(0, 180), phone: normalizePhone(phone), direction, body, profileName: profileName.slice(0, 200), at };
}

function messagesFromValue(field: string, value: Record<string, unknown>): Incoming[] {
  const found: Incoming[] = [];
  const contacts = new Map<string, string>();
  for (const contact of (value.contacts as Array<{ wa_id?: string; profile?: { name?: string } }> | undefined) ?? []) {
    if (contact.wa_id) contacts.set(normalizePhone(contact.wa_id), contact.profile?.name || "");
  }
  const take = (list: unknown, direction: "in" | "out", phoneOf: (message: Record<string, unknown>) => string) => {
    if (!Array.isArray(list)) return;
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const message = item as Record<string, unknown>;
      const phone = normalizePhone(phoneOf(message));
      const parsed = asMessage(message, phone, direction, contacts.get(phone) || "");
      if (parsed) found.push(parsed);
    }
  };
  if (field === "messages") take(value.messages, "in", (message) => String(message.from ?? ""));
  if (field === "smb_message_echoes") take(value.message_echoes, "out", (message) => String(message.to ?? ""));
  if (field === "history") {
    for (const chunk of (value.history as Array<{ threads?: Array<{ id?: string; messages?: unknown[] }> }> | undefined) ?? []) {
      for (const thread of chunk.threads ?? []) {
        const threadPhone = normalizePhone(String(thread.id ?? ""));
        if (!Array.isArray(thread.messages)) continue;
        for (const item of thread.messages) {
          if (!item || typeof item !== "object") continue;
          const message = item as Record<string, unknown>;
          const from = normalizePhone(String(message.from ?? ""));
          const direction = from && from !== threadPhone ? "out" : "in";
          const parsed = asMessage(message, threadPhone, direction, contacts.get(threadPhone) || "");
          if (parsed) found.push(parsed);
        }
      }
    }
  }
  return found;
}

export function verifyWebhookSignature(rawBody: string, header: string | null) {
  const secret = process.env.META_APP_SECRET || "";
  if (!secret || !header) return false;
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expected = Buffer.from(`sha256=${digest}`);
  const actual = Buffer.from(header);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function ingestWhatsappPayload(raw: unknown) {
  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) return;
  const incoming: Incoming[] = [];
  for (const entry of parsed.data.entry ?? []) {
    for (const change of entry.changes ?? []) {
      incoming.push(...messagesFromValue(change.field || "", change.value ?? {}));
    }
  }
  const unique = new Map<string, Incoming>();
  for (const message of incoming) {
    const existing = unique.get(message.id);
    if (!existing) unique.set(message.id, message);
    else if (!existing.profileName && message.profileName) existing.profileName = message.profileName;
  }
  const fresh = await insertMessages([...unique.values()]);
  const byPhone = new Map<string, string>();
  for (const message of fresh) byPhone.set(message.phone, message.id);
  for (const phone of byPhone.keys()) byPhone.set(phone, await latestMessageId(phone));
  if (!byPhone.size) return;
  after(async () => {
    await new Promise((resolve) => setTimeout(resolve, 15000));
    for (const [phone, messageId] of byPhone) {
      try {
        if ((await latestMessageId(phone)) !== messageId) continue;
        const profileName = fresh.find((item) => item.phone === phone && item.profileName)?.profileName || "";
        await captureConversation(phone, profileName);
      } catch {
        // A later message will try this conversation again.
      }
    }
  });
}
