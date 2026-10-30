const COOKIE = "mg_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

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
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToBase64Url(signature);
}

export async function createSessionToken(): Promise<string> {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(exp);
  const signature = await hmac(payload, sessionSecret());
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  const secret = sessionSecret();
  if (!token || !secret) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = await hmac(payload, secret);
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  if (mismatch !== 0) return false;
  const exp = Number(payload);
  return Number.isFinite(exp) && exp > Date.now();
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
