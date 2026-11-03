import { generateObject } from "ai";
import { z } from "zod";
import { getStore } from "./store";
import type { Measurement } from "./types";
import type { MeasurementInput } from "./store/types";
import { conversation } from "./whatsapp-store";

const extractionSchema = z.object({
  name: z.string().max(200).optional(),
  district: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  items: z.array(z.string().max(120)).max(12).optional(),
  appointmentAt: z.string().max(40).optional(),
  notes: z.string().max(2000).optional(),
});

export function normalizePhone(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = `90${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith("5")) digits = `90${digits}`;
  return digits;
}

export function displayPhone(digits: string) {
  if (digits.startsWith("90") && digits.length === 12) return `+90 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  return digits ? `+${digits}` : "";
}

function canWrite(measurement: Measurement, field: string, value: string) {
  if ((measurement.lockedFields ?? []).includes(field)) return false;
  if (!value.trim()) return true;
  return (measurement.whatsappOwned ?? []).includes(field);
}

function appointmentOrUndefined(value: string | undefined) {
  if (!value) return undefined;
  let text = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) text = `${text}T12:00:00+03:00`;
  else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(text)) text = `${text}+03:00`;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function aiConfigured() {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL);
}

export function mergeWhatsappFields(current: Measurement, patch: { name?: string; address?: string; notes?: string; appointmentAt?: string }) {
  const owned = new Set(current.whatsappOwned ?? []);
  const next: MeasurementInput = {
    customerName: current.customerName,
    phone: current.phone,
    address: current.address,
    appointmentAt: current.appointmentAt,
    notes: current.notes,
    status: current.status,
    origin: current.origin ?? "whatsapp",
    needsReview: true,
    fromWhatsapp: true,
  };
  if (patch.name && canWrite(current, "customerName", current.customerName)) {
    next.customerName = patch.name;
    owned.add("customerName");
  }
  if (patch.address && canWrite(current, "address", current.address)) {
    next.address = patch.address;
    owned.add("address");
  }
  if (patch.notes && canWrite(current, "notes", current.notes)) {
    next.notes = patch.notes;
    owned.add("notes");
  }
  if (patch.appointmentAt && canWrite(current, "appointmentAt", current.appointmentAt)) {
    next.appointmentAt = patch.appointmentAt;
    owned.add("appointmentAt");
  }
  next.whatsappOwned = [...owned];
  return next;
}

export async function captureConversation(phone: string, profileName: string) {
  if (!aiConfigured()) return;
  const messages = await conversation(phone);
  if (!messages.length) return;
  const transcript = messages.map((item) => `${item.direction === "out" ? "Atölye" : "Müşteri"}: ${item.body}`).join("\n").slice(-12000);
  const { object } = await generateObject({
    model: "openai/gpt-4.1-mini",
    schema: extractionSchema,
    prompt: [
      "Bir mobilya atölyesinin WhatsApp konuşmasından yalnızca açıkça yazılmış bilgileri çıkar.",
      "Konuşma Türkçe, Arapça veya İngilizce olabilir. Uydurma. Emin değilsen alanı boş bırak.",
      "appointmentAt yalnızca gün netse ISO 8601 olsun, saat yoksa İstanbul öğleni (12:00) kabul et.",
      "items istenen mobilyaları kısa Türkçe adlarla yaz.",
      transcript,
    ].join("\n\n"),
  });
  const address = [object.district, object.address].map((item) => item?.trim()).filter(Boolean).join(", ");
  const notes = [object.items?.length ? `İstenen: ${object.items.join(", ")}` : "", object.notes?.trim() || ""].filter(Boolean).join("\n");
  const appointmentAt = appointmentOrUndefined(object.appointmentAt);
  const store = getStore();
  const digits = normalizePhone(phone);
  const open = (await store.listMeasurements())
    .filter((item) => normalizePhone(item.phone) === digits && item.status === "scheduled")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (!open) {
    const owned = ["phone"];
    if (object.name || profileName) owned.push("customerName");
    if (address) owned.push("address");
    if (notes) owned.push("notes");
    owned.push("appointmentAt");
    await store.createMeasurement({
      customerName: object.name?.trim() || profileName || "WhatsApp müşterisi",
      phone: displayPhone(digits),
      address,
      appointmentAt: appointmentAt || new Date().toISOString(),
      notes: appointmentAt ? notes : [notes, "Ölçü tarihi mesajda geçmiyor."].filter(Boolean).join("\n"),
      status: "scheduled",
      origin: "whatsapp",
      needsReview: true,
      lockedFields: [],
      whatsappOwned: owned,
    });
    return;
  }
  const patch = mergeWhatsappFields(open, {
    name: object.name?.trim() || (open.customerName ? undefined : profileName),
    address,
    notes,
    appointmentAt,
  });
  await store.updateMeasurement(open.id, patch);
}
