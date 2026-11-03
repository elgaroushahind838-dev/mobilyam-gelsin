import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { neon } from "@neondatabase/serverless";

export type WhatsappConnection = {
  wabaId: string;
  phoneNumberId: string;
  displayPhone: string;
  tokenEncrypted: string;
  connectedAt: string;
};

export type StoredMessage = {
  id: string;
  phone: string;
  direction: "in" | "out";
  body: string;
  profileName: string;
  at: string;
};

type Query = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;

export type ImportStatus = "idle" | "receiving" | "processing" | "done" | "declined";

export type ImportState = {
  status: ImportStatus;
  progress: number;
  tick: string;
  updatedAt: string;
  lockUntil: string;
};

export type HistoryOutcome = "" | "measurement" | "active" | "archive" | "skip" | "review";

export type ContactCursor = {
  phone: string;
  profileName: string;
  processedId: string;
  pending: boolean;
  history: boolean;
  historyOutcome: HistoryOutcome;
  historyCreated: boolean;
};

export type ReviewItem = {
  phone: string;
  profileName: string;
  name: string;
  reason: string;
  suggested: "measurement" | "active" | "archive" | "unknown";
  summary: string;
  updatedAt: string;
};

export const emptyImport = (): ImportState => ({ status: "idle", progress: 0, tick: "", updatedAt: "", lockUntil: "" });

type FileData = {
  connection: WhatsappConnection | null;
  messages: StoredMessage[];
  importState?: ImportState;
  contacts?: ContactCursor[];
  reviews?: ReviewItem[];
};

const filePath = path.join(process.cwd(), "data", "whatsapp.json");
let dbReady: Promise<Query> | null = null;
let queue: Promise<unknown> = Promise.resolve();

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

async function database() {
  if (!dbReady) {
    const sql = neon(process.env.DATABASE_URL!) as unknown as Query;
    dbReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS whatsapp_connection (
        id text PRIMARY KEY,
        waba_id text NOT NULL,
        phone_number_id text NOT NULL,
        display_phone text NOT NULL DEFAULT '',
        token_encrypted text NOT NULL,
        connected_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS whatsapp_messages (
        message_id text PRIMARY KEY,
        contact_phone text NOT NULL,
        direction text NOT NULL,
        body text NOT NULL DEFAULT '',
        profile_name text NOT NULL DEFAULT '',
        received_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`CREATE INDEX IF NOT EXISTS whatsapp_messages_contact_idx ON whatsapp_messages (contact_phone, received_at)`;
      await sql`CREATE TABLE IF NOT EXISTS whatsapp_import (
        id text PRIMARY KEY,
        status text NOT NULL DEFAULT 'idle',
        progress integer NOT NULL DEFAULT 0,
        tick text NOT NULL DEFAULT '',
        updated_at timestamptz,
        lock_until timestamptz
      )`;
      await sql`CREATE TABLE IF NOT EXISTS whatsapp_contacts (
        phone text PRIMARY KEY,
        profile_name text NOT NULL DEFAULT '',
        processed_id text NOT NULL DEFAULT '',
        pending boolean NOT NULL DEFAULT false,
        history boolean NOT NULL DEFAULT false,
        history_outcome text NOT NULL DEFAULT '',
        history_created boolean NOT NULL DEFAULT false
      )`;
      await sql`CREATE TABLE IF NOT EXISTS whatsapp_reviews (
        phone text PRIMARY KEY,
        profile_name text NOT NULL DEFAULT '',
        name text NOT NULL DEFAULT '',
        reason text NOT NULL DEFAULT '',
        suggested text NOT NULL DEFAULT 'unknown',
        summary text NOT NULL DEFAULT '',
        updated_at timestamptz NOT NULL DEFAULT now()
      )`;
      return sql;
    })();
  }
  return dbReady;
}

async function readFileData(): Promise<FileData> {
  try {
    const parsed = JSON.parse(await readFile(filePath, "utf8")) as Partial<FileData>;
    return { connection: parsed.connection ?? null, messages: parsed.messages ?? [], importState: parsed.importState, contacts: parsed.contacts ?? [], reviews: parsed.reviews ?? [] };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { connection: null, messages: [], contacts: [], reviews: [] };
    throw error;
  }
}

async function writeFileData(data: FileData) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data));
}

export function whatsappStoreAvailable() {
  return mode() !== "unavailable";
}

export async function readConnection(): Promise<WhatsappConnection | null> {
  if (mode() === "unavailable") return null;
  if (mode() === "file") return (await readFileData()).connection;
  const sql = await database();
  const rows = await sql`SELECT * FROM whatsapp_connection WHERE id = 'default' LIMIT 1`;
  const row = rows[0];
  if (!row) return null;
  return {
    wabaId: String(row.waba_id),
    phoneNumberId: String(row.phone_number_id),
    displayPhone: String(row.display_phone ?? ""),
    tokenEncrypted: String(row.token_encrypted),
    connectedAt: new Date(String(row.connected_at)).toISOString(),
  };
}

export async function saveConnection(connection: WhatsappConnection) {
  if (mode() === "unavailable") throw new Error("WhatsApp kaydı için Neon gerekli");
  if (mode() === "file") {
    await withLock(async () => {
      const data = await readFileData();
      data.connection = connection;
      await writeFileData(data);
    });
    return;
  }
  const sql = await database();
  await sql`INSERT INTO whatsapp_connection (id, waba_id, phone_number_id, display_phone, token_encrypted, connected_at)
    VALUES ('default', ${connection.wabaId}, ${connection.phoneNumberId}, ${connection.displayPhone}, ${connection.tokenEncrypted}, ${connection.connectedAt})
    ON CONFLICT (id) DO UPDATE SET
      waba_id = EXCLUDED.waba_id,
      phone_number_id = EXCLUDED.phone_number_id,
      display_phone = EXCLUDED.display_phone,
      token_encrypted = EXCLUDED.token_encrypted,
      connected_at = EXCLUDED.connected_at`;
}

export async function clearConnection() {
  if (mode() === "unavailable") return;
  if (mode() === "file") {
    await withLock(async () => {
      const data = await readFileData();
      data.connection = null;
      await writeFileData(data);
    });
    return;
  }
  const sql = await database();
  await sql`DELETE FROM whatsapp_connection WHERE id = 'default'`;
}

export async function insertMessages(messages: StoredMessage[]) {
  if (!messages.length || mode() === "unavailable") return [] as StoredMessage[];
  if (mode() === "file") {
    return withLock(async () => {
      const data = await readFileData();
      const seen = new Set(data.messages.map((item) => item.id));
      const fresh: StoredMessage[] = [];
      for (const item of messages) {
        if (!item.id || seen.has(item.id)) continue;
        seen.add(item.id);
        fresh.push(item);
      }
      data.messages = data.messages.concat(fresh).slice(-100000);
      await writeFileData(data);
      return fresh;
    });
  }
  const sql = await database();
  const seen = new Set<string>();
  const fresh: StoredMessage[] = [];
  for (const message of messages) {
    if (seen.has(message.id)) continue;
    seen.add(message.id);
    const rows = await sql`INSERT INTO whatsapp_messages (message_id, contact_phone, direction, body, profile_name, received_at)
      VALUES (${message.id}, ${message.phone}, ${message.direction}, ${message.body.slice(0, 4000)}, ${message.profileName.slice(0, 200)}, ${message.at})
      ON CONFLICT (message_id) DO NOTHING
      RETURNING message_id`;
    if (rows.length) fresh.push(message);
  }
  return fresh;
}

function asStored(row: Record<string, unknown>): StoredMessage {
  return {
    id: String(row.message_id),
    phone: String(row.contact_phone),
    direction: row.direction === "out" ? "out" : "in",
    body: String(row.body ?? ""),
    profileName: String(row.profile_name ?? ""),
    at: new Date(String(row.received_at)).toISOString(),
  };
}

function asContact(row: Record<string, unknown>): ContactCursor {
  const outcome = String(row.history_outcome ?? "");
  return {
    phone: String(row.phone),
    profileName: String(row.profile_name ?? ""),
    processedId: String(row.processed_id ?? ""),
    pending: row.pending === true || row.pending === "t" || row.pending === "true",
    history: row.history === true || row.history === "t" || row.history === "true",
    historyOutcome: outcome === "measurement" || outcome === "active" || outcome === "archive" || outcome === "skip" || outcome === "review" ? outcome : "",
    historyCreated: row.history_created === true || row.history_created === "t" || row.history_created === "true",
  };
}

export async function latestMessageId(phone: string) {
  if (mode() === "unavailable") return "";
  if (mode() === "file") {
    const rows = (await readFileData()).messages.filter((item) => item.phone === phone).sort((a, b) => a.at.localeCompare(b.at));
    return rows.at(-1)?.id ?? "";
  }
  const sql = await database();
  const rows = await sql`SELECT message_id FROM whatsapp_messages WHERE contact_phone = ${phone} ORDER BY received_at DESC, message_id DESC LIMIT 1`;
  return String(rows[0]?.message_id ?? "");
}

export async function conversation(phone: string) {
  if (mode() === "unavailable") return [] as StoredMessage[];
  if (mode() === "file") {
    return (await readFileData()).messages.filter((item) => item.phone === phone).sort((a, b) => a.at.localeCompare(b.at) || a.id.localeCompare(b.id));
  }
  const sql = await database();
  const rows = await sql`SELECT message_id, contact_phone, direction, body, profile_name, received_at
    FROM whatsapp_messages WHERE contact_phone = ${phone} ORDER BY received_at ASC, message_id ASC`;
  return rows.map((row) => asStored(row));
}

function importFromRow(row: Record<string, unknown> | undefined): ImportState {
  if (!row) return emptyImport();
  const status = String(row.status ?? "idle");
  return {
    status: status === "receiving" || status === "processing" || status === "done" || status === "declined" ? status : "idle",
    progress: Number(row.progress ?? 0) || 0,
    tick: String(row.tick ?? ""),
    updatedAt: row.updated_at ? new Date(String(row.updated_at)).toISOString() : "",
    lockUntil: row.lock_until ? new Date(String(row.lock_until)).toISOString() : "",
  };
}

export async function readImport(): Promise<ImportState> {
  if (mode() === "unavailable") return emptyImport();
  if (mode() === "file") return { ...emptyImport(), ...(await readFileData()).importState };
  const sql = await database();
  const rows = await sql`SELECT * FROM whatsapp_import WHERE id = 'default' LIMIT 1`;
  return importFromRow(rows[0]);
}

export async function saveImport(patch: Partial<ImportState>) {
  const next = { ...(await readImport()), ...patch };
  if (mode() === "unavailable") return next;
  if (mode() === "file") {
    await withLock(async () => {
      const data = await readFileData();
      data.importState = next;
      await writeFileData(data);
    });
    return next;
  }
  const sql = await database();
  await sql`INSERT INTO whatsapp_import (id, status, progress, tick, updated_at, lock_until)
    VALUES ('default', ${next.status}, ${next.progress}, ${next.tick}, ${next.updatedAt || null}, ${next.lockUntil || null})
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status, progress = EXCLUDED.progress, tick = EXCLUDED.tick,
      updated_at = EXCLUDED.updated_at, lock_until = EXCLUDED.lock_until`;
  return next;
}

export async function listContacts(): Promise<ContactCursor[]> {
  if (mode() === "unavailable") return [];
  if (mode() === "file") return (await readFileData()).contacts ?? [];
  const sql = await database();
  const rows = await sql`SELECT * FROM whatsapp_contacts ORDER BY phone ASC`;
  return rows.map((row) => asContact(row));
}

export async function upsertContact(phone: string, patch: Partial<ContactCursor>) {
  const contacts = await listContacts();
  const current = contacts.find((item) => item.phone === phone);
  const next: ContactCursor = {
    phone,
    profileName: patch.profileName || current?.profileName || "",
    processedId: patch.processedId ?? current?.processedId ?? "",
    pending: patch.pending ?? current?.pending ?? false,
    history: patch.history ?? current?.history ?? false,
    historyOutcome: patch.historyOutcome ?? current?.historyOutcome ?? "",
    historyCreated: patch.historyCreated ?? current?.historyCreated ?? false,
  };
  if (mode() === "file") {
    await withLock(async () => {
      const data = await readFileData();
      const list = data.contacts ?? [];
      const index = list.findIndex((item) => item.phone === phone);
      if (index >= 0) list[index] = next;
      else list.push(next);
      data.contacts = list;
      await writeFileData(data);
    });
    return next;
  }
  const sql = await database();
  await sql`INSERT INTO whatsapp_contacts (phone, profile_name, processed_id, pending, history, history_outcome, history_created)
    VALUES (${next.phone}, ${next.profileName}, ${next.processedId}, ${next.pending}, ${next.history}, ${next.historyOutcome}, ${next.historyCreated})
    ON CONFLICT (phone) DO UPDATE SET
      profile_name = EXCLUDED.profile_name, processed_id = EXCLUDED.processed_id, pending = EXCLUDED.pending,
      history = EXCLUDED.history, history_outcome = EXCLUDED.history_outcome, history_created = EXCLUDED.history_created`;
  return next;
}

export async function listReviews(): Promise<ReviewItem[]> {
  if (mode() === "unavailable") return [];
  if (mode() === "file") return [...((await readFileData()).reviews ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const sql = await database();
  const rows = await sql`SELECT * FROM whatsapp_reviews ORDER BY updated_at DESC`;
  return rows.map((row) => ({
    phone: String(row.phone),
    profileName: String(row.profile_name ?? ""),
    name: String(row.name ?? ""),
    reason: String(row.reason ?? ""),
    suggested: row.suggested === "measurement" || row.suggested === "active" || row.suggested === "archive" ? row.suggested : "unknown",
    summary: String(row.summary ?? ""),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  }));
}

export async function upsertReview(item: ReviewItem) {
  if (mode() === "unavailable") return;
  if (mode() === "file") {
    await withLock(async () => {
      const data = await readFileData();
      const list = data.reviews ?? [];
      const index = list.findIndex((row) => row.phone === item.phone);
      if (index >= 0) list[index] = item;
      else list.push(item);
      data.reviews = list;
      await writeFileData(data);
    });
    return;
  }
  const sql = await database();
  await sql`INSERT INTO whatsapp_reviews (phone, profile_name, name, reason, suggested, summary, updated_at)
    VALUES (${item.phone}, ${item.profileName}, ${item.name}, ${item.reason}, ${item.suggested}, ${item.summary}, ${item.updatedAt})
    ON CONFLICT (phone) DO UPDATE SET
      profile_name = EXCLUDED.profile_name, name = EXCLUDED.name, reason = EXCLUDED.reason,
      suggested = EXCLUDED.suggested, summary = EXCLUDED.summary, updated_at = EXCLUDED.updated_at`;
}

export async function dismissReview(phone: string) {
  if (mode() === "unavailable") return;
  if (mode() === "file") {
    await withLock(async () => {
      const data = await readFileData();
      data.reviews = (data.reviews ?? []).filter((item) => item.phone !== phone);
      await writeFileData(data);
    });
    return;
  }
  const sql = await database();
  await sql`DELETE FROM whatsapp_reviews WHERE phone = ${phone}`;
}
