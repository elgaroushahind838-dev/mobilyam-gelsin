import { generateObject } from "ai";
import { z } from "zod";
import { parsePriceAmount, todayIstanbul } from "./format";
import { getStore } from "./store";
import type { Measurement, Order } from "./types";
import type { MeasurementInput, OrderInput } from "./store/types";
import { conversation, dismissReview, upsertReview } from "./whatsapp-store";
import { buildTranscript, canFill, composeNotes, joinAddress, planAction, type Extraction, type Stage } from "./whatsapp-stage";

const extractionSchema = z.object({
  customer: z.boolean(),
  confidence: z.enum(["high", "low"]),
  stage: z.enum(["measurement", "active", "archive"]).optional(),
  reason: z.string().max(160).optional(),
  name: z.string().max(200).optional(),
  district: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  items: z.array(z.string().max(120)).max(12).optional(),
  appointmentAt: z.string().max(40).optional(),
  price: z.string().max(40).optional(),
  deposit: z.string().max(40).optional(),
  deliveryAt: z.string().max(40).optional(),
  orderDate: z.string().max(40).optional(),
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

function aiConfigured() {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL);
}

function asIso(value: string | undefined) {
  if (!value) return undefined;
  let text = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) text = `${text}T12:00:00+03:00`;
  else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(text)) text = `${text}+03:00`;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function dayKey(value: string | undefined) {
  const iso = asIso(value);
  if (!iso) return "";
  return todayIstanbul(new Date(iso));
}

async function findPipeline(phone: string) {
  const digits = normalizePhone(phone);
  const same = (value: string) => normalizePhone(value) === digits;
  const store = getStore();
  const [orders, measurements] = await Promise.all([store.listOrders(), store.listMeasurements()]);
  const mine = orders.filter((item) => same(item.phone)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const completed = mine.find((item) => item.status === "completed");
  const active = mine.find((item) => item.status === "active");
  const scheduled = measurements.filter((item) => same(item.phone) && item.status === "scheduled").sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (completed) return { stage: "archive" as Stage, order: completed, measurement: scheduled };
  if (active) return { stage: "active" as Stage, order: active, measurement: scheduled };
  if (scheduled) return { stage: "measurement" as Stage, order: undefined, measurement: scheduled };
  return { stage: null, order: undefined, measurement: undefined };
}

function fillMeasurement(current: Measurement, extraction: Extraction, reason: string, profileName: string) {
  const owned = new Set(current.whatsappOwned ?? []);
  const next: MeasurementInput = {
    customerName: current.customerName,
    phone: current.phone,
    address: current.address,
    appointmentAt: current.appointmentAt,
    notes: current.notes,
    status: current.status,
    origin: current.origin ?? "whatsapp",
    fromWhatsapp: true,
  };
  const name = extraction.name?.trim() || (!current.customerName.trim() ? profileName : "");
  const address = joinAddress(extraction.district, extraction.address);
  const appointmentAt = asIso(extraction.appointmentAt);
  const notes = composeNotes(extraction, appointmentAt ? [] : []);
  let changed = false;
  const differs = (field: string, value: string) => value.trim() !== String((current as unknown as Record<string, string>)[field] ?? "").trim();
  if (name && differs("customerName", name) && canFill(current.lockedFields, current.whatsappOwned, "customerName", current.customerName)) {
    next.customerName = name;
    owned.add("customerName");
    changed = true;
  }
  if (address && differs("address", address) && canFill(current.lockedFields, current.whatsappOwned, "address", current.address)) {
    next.address = address;
    owned.add("address");
    changed = true;
  }
  if (notes && differs("notes", notes) && canFill(current.lockedFields, current.whatsappOwned, "notes", current.notes)) {
    next.notes = notes;
    owned.add("notes");
    changed = true;
  }
  if (appointmentAt && differs("appointmentAt", appointmentAt) && canFill(current.lockedFields, current.whatsappOwned, "appointmentAt", current.appointmentAt)) {
    next.appointmentAt = appointmentAt;
    owned.add("appointmentAt");
    changed = true;
  } else if (!current.appointmentAt && !appointmentAt) {
    next.appointmentAt = new Date().toISOString();
    owned.add("appointmentAt");
  }
  if (changed) {
    next.needsReview = true;
    next.reviewReason = reason;
  }
  next.whatsappOwned = [...owned];
  return { next, changed };
}

function fillOrder(current: Order, extraction: Extraction, reason: string, profileName: string, stage: Stage) {
  const owned = new Set(current.whatsappOwned ?? []);
  const next: OrderInput = {
    customerName: current.customerName,
    phone: current.phone,
    product: current.product,
    price: current.price,
    priceAmount: current.priceAmount,
    orderDate: current.orderDate,
    address: current.address,
    notes: current.notes,
    status: current.status,
    origin: current.origin ?? "whatsapp",
    fromWhatsapp: true,
  };
  const name = extraction.name?.trim() || (!current.customerName.trim() ? profileName : "");
  const address = joinAddress(extraction.district, extraction.address);
  const product = (extraction.items ?? []).map((item) => item.trim()).filter(Boolean).join(", ");
  const price = extraction.price?.trim() || "";
  const notes = composeNotes(extraction, stage === "active" && extraction.deliveryAt ? [`Teslim: ${extraction.deliveryAt.trim()}`] : []);
  const orderDate = dayKey(extraction.orderDate);
  let changed = false;
  const write = (field: string, value: string, apply: () => void) => {
    const currentValue = String((current as unknown as Record<string, string>)[field] ?? "");
    if (value && value.trim() !== currentValue.trim() && canFill(current.lockedFields, current.whatsappOwned, field, currentValue)) {
      apply();
      owned.add(field);
      changed = true;
    }
  };
  write("customerName", name, () => { next.customerName = name; });
  write("address", address, () => { next.address = address; });
  write("product", product, () => { next.product = product; });
  write("price", price, () => { next.price = price; next.priceAmount = parsePriceAmount(price); owned.add("price"); });
  write("notes", notes, () => { next.notes = notes; });
  write("orderDate", orderDate, () => { next.orderDate = orderDate; });
  if (changed) {
    next.needsReview = true;
    next.reviewReason = reason;
  }
  next.whatsappOwned = [...owned];
  return next;
}

export async function commitExtraction(phone: string, profileName: string, extraction: Extraction) {
  const digits = normalizePhone(phone);
  const shown = displayPhone(digits);
  const found = await findPipeline(shown || phone);
  const plan = planAction(extraction, found.stage);
  if (plan.bucket === "skip") {
    await dismissReview(digits);
    return { bucket: plan.bucket, created: false };
  }
  if (plan.bucket === "review") {
    await upsertReview({
      phone: digits,
      profileName,
      name: extraction.name?.trim() || profileName || shown,
      reason: plan.reason,
      suggested: extraction.stage ?? "unknown",
      summary: composeNotes(extraction).slice(0, 280),
      updatedAt: new Date().toISOString(),
    });
    return { bucket: plan.bucket, created: false };
  }
  await dismissReview(digits);
  const store = getStore();
  const address = joinAddress(extraction.district, extraction.address);
  const product = (extraction.items ?? []).map((item) => item.trim()).filter(Boolean).join(", ") || "Mobilya";
  const price = extraction.price?.trim() || "";
  const notes = composeNotes(extraction);
  const orderDate = dayKey(extraction.orderDate) || todayIstanbul();
  const delivery = asIso(extraction.deliveryAt);

  if (found.stage === "archive" && found.order) {
    await store.updateOrder(found.order.id, fillOrder(found.order, extraction, plan.reason, profileName, "archive"));
    return { bucket: "archive" as const, created: false };
  }
  if (found.stage === "active" && found.order && plan.moveTo !== "archive") {
    await store.updateOrder(found.order.id, fillOrder(found.order, extraction, plan.reason, profileName, "active"));
    return { bucket: "active" as const, created: false };
  }
  if (found.stage === "active" && found.order && plan.moveTo === "archive") {
    const patch = fillOrder(found.order, extraction, plan.reason, profileName, "archive");
    patch.status = "completed";
    patch.completedAt = delivery || new Date().toISOString();
    patch.needsReview = true;
    patch.reviewReason = plan.reason;
    await store.updateOrder(found.order.id, patch);
    return { bucket: "archive" as const, created: false };
  }
  if (found.stage === "measurement" && found.measurement && plan.moveTo === "measurement") {
    const filled = fillMeasurement(found.measurement, extraction, plan.reason, profileName);
    if (!filled.next.appointmentAt) filled.next.appointmentAt = found.measurement.appointmentAt;
    await store.updateMeasurement(found.measurement.id, filled.next);
    return { bucket: "measurement" as const, created: false };
  }
  if ((plan.moveTo === "active" || plan.moveTo === "archive") && found.measurement) {
    await store.updateMeasurement(found.measurement.id, {
      ...fillMeasurement(found.measurement, extraction, plan.reason, profileName).next,
      status: "done",
      needsReview: false,
      reviewReason: "",
    });
  }
  if (plan.moveTo === "measurement") {
    const appointmentAt = asIso(extraction.appointmentAt);
    const owned = ["phone", "appointmentAt"];
    if (extraction.name?.trim() || profileName) owned.push("customerName");
    if (address) owned.push("address");
    const text = appointmentAt ? notes : [notes, "Ölçü tarihi mesajda geçmiyor."].filter(Boolean).join("\n");
    if (text) owned.push("notes");
    await store.createMeasurement({
      customerName: extraction.name?.trim() || profileName || "WhatsApp müşterisi",
      phone: shown,
      address,
      appointmentAt: appointmentAt || new Date().toISOString(),
      notes: text,
      status: "scheduled",
      origin: "whatsapp",
      needsReview: true,
      reviewReason: plan.reason,
      lockedFields: [],
      whatsappOwned: owned,
    });
    return { bucket: "measurement" as const, created: true };
  }
  const owned = ["phone", "product"];
  if (extraction.name?.trim() || profileName) owned.push("customerName");
  if (address) owned.push("address");
  if (price) owned.push("price");
  if (notes) owned.push("notes");
  owned.push("orderDate");
  await store.createOrder({
    customerName: extraction.name?.trim() || profileName || "WhatsApp müşterisi",
    phone: shown,
    product,
    price,
    priceAmount: price ? parsePriceAmount(price) : 0,
    orderDate,
    address,
    notes,
    status: plan.moveTo === "archive" ? "completed" : "active",
    completedAt: plan.moveTo === "archive" ? delivery || new Date().toISOString() : null,
    origin: "whatsapp",
    needsReview: true,
    reviewReason: plan.reason,
    lockedFields: [],
    whatsappOwned: owned,
  });
  return { bucket: plan.moveTo === "archive" ? "archive" as const : "active" as const, created: true };
}

export async function applyConversation(phone: string, profileName: string) {
  if (!aiConfigured()) throw new Error("AI_GATEWAY_API_KEY gerekli");
  const messages = await conversation(phone);
  if (!messages.length) return { bucket: "skip" as const, created: false };
  const { object } = await generateObject({
    model: "openai/gpt-4.1-mini",
    schema: extractionSchema,
    prompt: [
      "Mobilyam Gelsin bir mobilya atölyesi. Konuşma Türkçe, Arapça veya İngilizce olabilir.",
      "Yalnızca açıkça yazılanı kullan. Uydurma. Emin değilsen confidence low olsun.",
      "customer false: aile, arkadaş, tedarikçi, kargo, reklam veya mobilya müşterisi olmayan kişi.",
      "stage measurement: ölçü veya keşif istiyor, anlaşma yok.",
      "stage active: fiyat veya kapora konuşulmuş, üretimde, sipariş alınmış veya teslim bekleniyor.",
      "stage archive: teslim edildi, kuruldu veya iş bitti.",
      "reason kısa Türkçe gerekçe olsun, örneğin teslim edildi.",
      "Tarihler yalnızca gün netse ISO 8601 olsun. Saat yoksa İstanbul öğleni (12:00).",
      buildTranscript(messages),
    ].join("\n\n"),
  });
  const knownName = profileName || messages.find((item) => item.profileName)?.profileName || "";
  return commitExtraction(phone, knownName, object);
}
