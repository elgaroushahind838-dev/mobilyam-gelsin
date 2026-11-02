import { deleteAdminSession, saveAdminSession, sessionIsActive } from "./security-store";

const COOKIE = "mg_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function adminCookieName() {
  return COOKIE;
}

export function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToBase64Url(signature);
}

function signaturesMatch(expected: string, actual: string): boolean {
  if (expected.length !== actual.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) mismatch |= expected.charCodeAt(i) ^ actual.charCodeAt(i);
  return mismatch === 0;
}

type VerifiedToken = { kind: "legacy"; exp: number } | { kind: "session"; id: string; exp: number };

async function readVerified(token: string | undefined | null): Promise<VerifiedToken | null> {
  const secret = sessionSecret();
  if (!token || !secret) return null;
  const parts = token.split(".");
  if (parts.length === 2) {
    const [payload, signature] = parts;
    if (!payload || !signature) return null;
    const expected = await hmac(payload, secret);
    if (!signaturesMatch(expected, signature)) return null;
    const exp = Number(payload);
    if (!Number.isFinite(exp) || exp <= Date.now()) return null;
    return { kind: "legacy", exp };
  }
  if (parts.length !== 3) return null;
  const [id, expText, signature] = parts;
  if (!id || !expText || !signature || !/^[a-f0-9]{32}$/.test(id)) return null;
  const expected = await hmac(`${id}.${expText}`, secret);
  if (!signaturesMatch(expected, signature)) return null;
  const exp = Number(expText);
  if (!Number.isFinite(exp) || exp <= Date.now()) return null;
  return { kind: "session", id, exp };
}

export async function createSessionToken(): Promise<string> {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const secret = sessionSecret();
  const id = crypto.randomUUID().replace(/-/g, "");
  const saved = await saveAdminSession(id, exp);
  const payload = saved ? `${id}.${exp}` : String(exp);
  const signature = await hmac(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  const parsed = await readVerified(token);
  if (!parsed) return false;
  if (parsed.kind === "legacy") return true;
  return sessionIsActive(parsed.id);
}

export async function revokeSessionToken(token: string | undefined | null): Promise<void> {
  const parsed = await readVerified(token);
  if (parsed?.kind === "session") await deleteAdminSession(parsed.id);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

export async function isAdminRequest(request: Request): Promise<boolean> {
  const cookie = request.headers.get("cookie") ?? "";
  const token = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (await verifySessionToken(token ? decodeURIComponent(token) : undefined)) return true;

  const expected = process.env.EXPORT_TOKEN;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(\S+)\s*$/i.exec(header);
  if (!match) return false;
  return passwordsMatch(match[1], expected);
}

export async function passwordsMatch(input: string, expected: string): Promise<boolean> {
  const digest = async (value: string) => {
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return new Uint8Array(hash);
  };
  const [left, right] = await Promise.all([digest(input), digest(expected)]);
  let mismatch = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) mismatch |= (left[i] ?? 0) ^ (right[i] ?? 0);
  return mismatch === 0;
}
