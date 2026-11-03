import type { Measurement } from "./types";
import type { MeasurementInput } from "./store/types";

const FIELDS = ["customerName", "phone", "address", "appointmentAt", "notes"] as const;

function same(field: (typeof FIELDS)[number], left: string, right: string) {
  if (field === "phone") return left.replace(/\D/g, "") === right.replace(/\D/g, "");
  if (field === "appointmentAt") {
    const a = new Date(left).getTime();
    const b = new Date(right).getTime();
    if (!Number.isNaN(a) && !Number.isNaN(b)) return Math.abs(a - b) < 60_000;
  }
  return left.trim() === right.trim();
}

export function lockEditedFields(current: Measurement, input: MeasurementInput) {
  const locked = new Set(current.lockedFields ?? []);
  for (const field of FIELDS) {
    if (!same(field, String(current[field] ?? ""), String(input[field] ?? ""))) locked.add(field);
  }
  return [...locked];
}

export function listToText(values: string[] | undefined) {
  return (values ?? []).filter(Boolean).join(",");
}

export function textToList(value: unknown) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
