export type Stage = "measurement" | "active" | "archive";
export type Bucket = Stage | "skip" | "review";

export type Extraction = {
  customer: boolean;
  confidence: "high" | "low";
  stage?: Stage;
  reason?: string;
  name?: string;
  district?: string;
  address?: string;
  items?: string[];
  appointmentAt?: string;
  price?: string;
  deposit?: string;
  deliveryAt?: string;
  orderDate?: string;
  notes?: string;
};

export function stageRank(stage: Stage | null) {
  if (stage === "measurement") return 1;
  if (stage === "active") return 2;
  if (stage === "archive") return 3;
  return 0;
}

export function reviewLine(reason: string | undefined) {
  const text = (reason || "").replace(/\s+/g, " ").trim().slice(0, 160);
  if (!text) return "Mesajdan güncellendi";
  if (text.toLowerCase().startsWith("mesajda")) return text;
  return `Mesajda: ${text}`;
}

export function planAction(extraction: Extraction, current: Stage | null): { bucket: Bucket; moveTo: Stage | null; reason: string } {
  const reason = reviewLine(extraction.reason);
  if (!extraction.customer && extraction.confidence === "high") return { bucket: "skip", moveTo: null, reason };
  if (extraction.confidence !== "high" || !extraction.stage) return { bucket: "review", moveTo: null, reason };
  if (!current) return { bucket: extraction.stage, moveTo: extraction.stage, reason };
  if (stageRank(extraction.stage) < stageRank(current)) return { bucket: current, moveTo: null, reason };
  return { bucket: extraction.stage, moveTo: extraction.stage, reason };
}

export function canFill(locked: string[] | undefined, owned: string[] | undefined, field: string, currentValue: string) {
  if ((locked ?? []).includes(field)) return false;
  if (!String(currentValue ?? "").trim()) return true;
  return (owned ?? []).includes(field);
}

export function joinAddress(district?: string, address?: string) {
  return [district, address].map((item) => item?.trim()).filter(Boolean).join(", ");
}

export function composeNotes(extraction: Extraction, extra: string[] = []) {
  const items = (extraction.items ?? []).map((item) => item.trim()).filter(Boolean);
  const lines = [
    items.length ? `İstenen: ${items.join(", ")}` : "",
    extraction.deposit?.trim() ? `Kapora: ${extraction.deposit.trim()}` : "",
    extraction.price?.trim() ? `Fiyat: ${extraction.price.trim()}` : "",
    ...extra,
    extraction.notes?.trim() || "",
  ].filter(Boolean);
  return lines.join("\n").slice(0, 4000);
}

export function buildTranscript(messages: { direction: "in" | "out"; body: string }[]) {
  const lines = messages.map((item) => `${item.direction === "out" ? "Atölye" : "Müşteri"}: ${item.body}`);
  const full = lines.join("\n");
  if (full.length <= 18000) return full;
  const head = lines.slice(0, 40).join("\n");
  const tail = lines.slice(-100).join("\n");
  return `${head}\n\n[Aradaki mesajlar kısaltıldı.]\n\n${tail}`.slice(-18000);
}

export function parseHistorySignal(value: Record<string, unknown>) {
  const chunks = Array.isArray(value.history) ? value.history : [];
  let progress: number | null = null;
  let errors = 0;
  let threads = 0;
  for (const chunk of chunks) {
    if (!chunk || typeof chunk !== "object") continue;
    const record = chunk as { metadata?: { progress?: unknown }; errors?: unknown[]; threads?: unknown[] };
    const parsed = Number(record.metadata?.progress);
    if (Number.isFinite(parsed)) progress = Math.max(progress ?? 0, Math.min(100, parsed));
    if (Array.isArray(record.errors) && record.errors.length) errors += record.errors.length;
    if (Array.isArray(record.threads)) threads += record.threads.length;
  }
  return { progress, declined: errors > 0 && threads === 0 };
}

export function shouldContinueImport(state: { status: string; progress: number; updatedAt: string; lockUntil: string }, pending: number, now: number) {
  if (pending <= 0) return false;
  const locked = Date.parse(state.lockUntil || "");
  if (Number.isFinite(locked) && locked > now) return false;
  if (state.status === "processing" || state.progress >= 100) return true;
  const updated = Date.parse(state.updatedAt || "");
  return state.status === "receiving" && Number.isFinite(updated) && now - updated > 45_000;
}
