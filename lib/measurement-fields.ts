import type { Measurement, Order } from "./types";
import type { MeasurementInput, OrderInput } from "./store/types";

const MEASUREMENT_FIELDS = ["customerName", "phone", "address", "appointmentAt", "notes"] as const;
const ORDER_FIELDS = ["customerName", "phone", "product", "price", "orderDate", "address", "notes"] as const;

function same(field: string, left: string, right: string) {
  if (field === "phone") return left.replace(/\D/g, "") === right.replace(/\D/g, "");
  if (field === "appointmentAt") {
    const a = new Date(left).getTime();
    const b = new Date(right).getTime();
    if (!Number.isNaN(a) && !Number.isNaN(b)) return Math.abs(a - b) < 60_000;
  }
  return left.trim() === right.trim();
}

function lockFields<T extends { lockedFields?: string[] }>(current: T, input: Partial<T>, fields: readonly (keyof T)[]) {
  const locked = new Set(current.lockedFields ?? []);
  for (const field of fields) {
    const next = input[field];
    if (next === undefined) continue;
    if (!same(String(field), String(current[field] ?? ""), String(next ?? ""))) locked.add(String(field));
  }
  return [...locked];
}

export function lockEditedFields(current: Measurement, input: MeasurementInput) {
  return lockFields(current, input, MEASUREMENT_FIELDS);
}

export function lockOrderFields(current: Order, input: Partial<OrderInput>) {
  return lockFields(current, input, ORDER_FIELDS);
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
