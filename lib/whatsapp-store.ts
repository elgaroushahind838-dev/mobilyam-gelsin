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

type FileData = { connection: WhatsappConnection | null; messages: StoredMessage[] };

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
      return sql;
    })();
  }
  return dbReady;
}

async function readFileData(): Promise<FileData> {
  try {
    const parsed = JSON.parse(await readFile(filePath, "utf8")) as Partial<FileData>;
    return { connection: parsed.connection ?? null, messages: parsed.messages ?? [] };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { connection: null, messages: [] };
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
      const fresh = messages.filter((item) => item.id && !seen.has(item.id));
      data.messages = data.messages.concat(fresh).slice(-5000);
      await writeFileData(data);
      return fresh;
    });
  }
  const sql = await database();
  const fresh: StoredMessage[] = [];
  for (const message of messages) {
    const rows = await sql`INSERT INTO whatsapp_messages (message_id, contact_phone, direction, body, profile_name, received_at)
      VALUES (${message.id}, ${message.phone}, ${message.direction}, ${message.body.slice(0, 4000)}, ${message.profileName.slice(0, 200)}, ${message.at})
      ON CONFLICT (message_id) DO NOTHING
      RETURNING message_id`;
    if (rows.length) fresh.push(message);
  }
  return fresh;
}

export async function latestMessageId(phone: string) {
  if (mode() === "file") {
    const rows = (await readFileData()).messages.filter((item) => item.phone === phone);
    return rows.at(-1)?.id ?? "";
  }
  const sql = await database();
  const rows = await sql`SELECT message_id FROM whatsapp_messages WHERE contact_phone = ${phone} ORDER BY received_at DESC LIMIT 1`;
  return String(rows[0]?.message_id ?? "");
}

export async function conversation(phone: string) {
  if (mode() === "file") {
    return (await readFileData()).messages.filter((item) => item.phone === phone).slice(-30);
  }
  const sql = await database();
  const rows = await sql`SELECT message_id, contact_phone, direction, body, profile_name, received_at
    FROM whatsapp_messages WHERE contact_phone = ${phone} ORDER BY received_at DESC LIMIT 30`;
  return rows.reverse().map((row) => ({
    id: String(row.message_id),
    phone: String(row.contact_phone),
    direction: row.direction === "out" ? "out" as const : "in" as const,
    body: String(row.body ?? ""),
    profileName: String(row.profile_name ?? ""),
    at: new Date(String(row.received_at)).toISOString(),
  }));
}
