import { deleteLoginAttempt, readLoginAttempt, writeLoginAttempt, type LoginAttempt } from "./security-store";

const LIMIT = 8;
const WINDOW_MS = 15 * 60 * 1000;
const memory = new Map<string, LoginAttempt>();

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const raw = (forwarded?.split(",")[0] || request.headers.get("x-real-ip") || "unknown").trim();
  return raw.slice(0, 80) || "unknown";
}

function freshen(attempt: LoginAttempt | null, now: number): LoginAttempt {
  if (!attempt) return { failures: 0, windowStart: now, lockedUntil: null };
  const locked = attempt.lockedUntil !== null && attempt.lockedUntil > now;
  if (!locked && now - attempt.windowStart > WINDOW_MS) return { failures: 0, windowStart: now, lockedUntil: null };
  return attempt;
}

function stricter(left: LoginAttempt | null, right: LoginAttempt | null): LoginAttempt | null {
  if (!left) return right;
  if (!right) return left;
  const now = Date.now();
  const leftLocked = left.lockedUntil !== null && left.lockedUntil > now;
  const rightLocked = right.lockedUntil !== null && right.lockedUntil > now;
  if (leftLocked && !rightLocked) return left;
  if (rightLocked && !leftLocked) return right;
  return left.failures >= right.failures ? left : right;
}

async function load(ip: string): Promise<LoginAttempt | null> {
  let remote: LoginAttempt | null = null;
  try {
    remote = await readLoginAttempt(ip);
  } catch {
    remote = null;
  }
  return stricter(memory.get(ip) ?? null, remote);
}

function retryAfter(attempt: LoginAttempt, now: number): number {
  if (!attempt.lockedUntil || attempt.lockedUntil <= now) return 0;
  return Math.max(1, Math.ceil((attempt.lockedUntil - now) / 1000));
}

export async function loginBlocked(ip: string): Promise<number> {
  const now = Date.now();
  return retryAfter(freshen(await load(ip), now), now);
}

export async function recordLoginFailure(ip: string): Promise<number> {
  const now = Date.now();
  const current = freshen(await load(ip), now);
  const next: LoginAttempt = {
    failures: current.failures + 1,
    windowStart: current.failures === 0 ? now : current.windowStart,
    lockedUntil: current.failures + 1 >= LIMIT ? now + WINDOW_MS : null,
  };
  memory.set(ip, next);
  try {
    await writeLoginAttempt(ip, next);
  } catch {
    // The in-memory counter still applies on this instance.
  }
  return retryAfter(next, now);
}

export async function clearLoginFailures(ip: string): Promise<void> {
  memory.delete(ip);
  try {
    await deleteLoginAttempt(ip);
  } catch {
    // A cleared memory counter is enough for this instance.
  }
}
