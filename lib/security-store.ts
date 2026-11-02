import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { neon } from "@neondatabase/serverless";

type Query = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;

export type LoginAttempt = {
  failures: number;
  windowStart: number;
  lockedUntil: number | null;
};

type SecurityData = {
  sessions: { id: string; exp: number }[];
  attempts: ({ ip: string } & LoginAttempt)[];
};

const filePath = path.join(process.cwd(), "data", "security.json");
let queue: Promise<unknown> = Promise.resolve();
let dbReady: Promise<Query> | null = null;

function mode(): "postgres" | "file" | "unavailable" {
  if (process.env.DATABASE_URL) return "postgres";
  if (process.env.VERCEL) return "unavailable";
  return "file";
}

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(() => undefined, () => undefined);
  return run;
}

function emptyData(): SecurityData {
  return { sessions: [], attempts: [] };
}

async function readFileData(): Promise<SecurityData> {
  try {
    const parsed = JSON.parse(await readFile(filePath, "utf8")) as Partial<SecurityData>;
    return {
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyData();
    throw error;
  }
}

async function writeFileData(data: SecurityData) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data));
}

async function database(): Promise<Query> {
  if (!dbReady) {
    const sql = neon(process.env.DATABASE_URL!) as unknown as Query;
    dbReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS admin_sessions (
        id text PRIMARY KEY,
        expires_at timestamptz NOT NULL
      )`;
      await sql`CREATE TABLE IF NOT EXISTS login_attempts (
        ip text PRIMARY KEY,
        failures integer NOT NULL,
        window_start timestamptz NOT NULL,
        locked_until timestamptz
      )`;
      return sql;
    })();
  }
  return dbReady;
}

function asTime(value: unknown): number {
  if (value instanceof Date) return value.getTime();
  const parsed = Date.parse(String(value ?? ""));
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function saveAdminSession(id: string, exp: number): Promise<boolean> {
  const where = mode();
  if (where === "unavailable") return false;
  try {
    if (where === "file") {
      await withLock(async () => {
        const data = await readFileData();
        const now = Date.now();
        data.sessions = data.sessions.filter((item) => item.exp > now && item.id !== id);
        data.sessions.push({ id, exp });
        await writeFileData(data);
      });
      return true;
    }
    const sql = await database();
    await sql`INSERT INTO admin_sessions (id, expires_at) VALUES (${id}, ${new Date(exp).toISOString()})
      ON CONFLICT (id) DO UPDATE SET expires_at = EXCLUDED.expires_at`;
    await sql`DELETE FROM admin_sessions WHERE expires_at <= now()`;
    return true;
  } catch {
    return false;
  }
}

export async function sessionIsActive(id: string): Promise<boolean> {
  if (mode() === "unavailable") return true;
  try {
    if (mode() === "file") {
      const data = await readFileData();
      return data.sessions.some((item) => item.id === id && item.exp > Date.now());
    }
    const sql = await database();
    const rows = await sql`SELECT id FROM admin_sessions WHERE id = ${id} AND expires_at > now() LIMIT 1`;
    return rows.length > 0;
  } catch {
    return true;
  }
}

export async function deleteAdminSession(id: string): Promise<void> {
  if (mode() === "unavailable") return;
  try {
    if (mode() === "file") {
      await withLock(async () => {
        const data = await readFileData();
        data.sessions = data.sessions.filter((item) => item.id !== id);
        await writeFileData(data);
      });
      return;
    }
    const sql = await database();
    await sql`DELETE FROM admin_sessions WHERE id = ${id}`;
  } catch {
    // Cookie is still cleared by the logout route.
  }
}

export async function readLoginAttempt(ip: string): Promise<LoginAttempt | null> {
  if (mode() === "unavailable") return null;
  if (mode() === "file") {
    const data = await readFileData();
    const row = data.attempts.find((item) => item.ip === ip);
    return row ? { failures: row.failures, windowStart: row.windowStart, lockedUntil: row.lockedUntil } : null;
  }
  const sql = await database();
  const rows = await sql`SELECT failures, window_start, locked_until FROM login_attempts WHERE ip = ${ip} LIMIT 1`;
  const row = rows[0];
  if (!row) return null;
  return {
    failures: Number(row.failures ?? 0),
    windowStart: asTime(row.window_start),
    lockedUntil: row.locked_until ? asTime(row.locked_until) : null,
  };
}

export async function writeLoginAttempt(ip: string, attempt: LoginAttempt): Promise<void> {
  if (mode() === "unavailable") return;
  if (mode() === "file") {
    await withLock(async () => {
      const data = await readFileData();
      data.attempts = data.attempts.filter((item) => item.ip !== ip);
      data.attempts.push({ ip, ...attempt });
      await writeFileData(data);
    });
    return;
  }
  const sql = await database();
  const locked = attempt.lockedUntil ? new Date(attempt.lockedUntil).toISOString() : null;
  await sql`INSERT INTO login_attempts (ip, failures, window_start, locked_until)
    VALUES (${ip}, ${attempt.failures}, ${new Date(attempt.windowStart).toISOString()}, ${locked})
    ON CONFLICT (ip) DO UPDATE SET
      failures = EXCLUDED.failures,
      window_start = EXCLUDED.window_start,
      locked_until = EXCLUDED.locked_until`;
}

export async function deleteLoginAttempt(ip: string): Promise<void> {
  if (mode() === "unavailable") return;
  if (mode() === "file") {
    await withLock(async () => {
      const data = await readFileData();
      data.attempts = data.attempts.filter((item) => item.ip !== ip);
      await writeFileData(data);
    });
    return;
  }
  const sql = await database();
  await sql`DELETE FROM login_attempts WHERE ip = ${ip}`;
}
