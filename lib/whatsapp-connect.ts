import { decryptSecret, encryptSecret } from "./whatsapp-crypto";
import { clearConnection, readConnection, saveConnection, type WhatsappConnection } from "./whatsapp-store";

const GRAPH = "https://graph.facebook.com/v21.0";

async function graph(path: string, token: string, init?: RequestInit) {
  const response = await fetch(`${GRAPH}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data?.error?.message === "string" ? data.error.message : "Meta isteği başarısız";
    throw new Error(message.slice(0, 180));
  }
  return data as Record<string, unknown>;
}

export async function exchangeCode(code: string) {
  const appId = process.env.META_APP_ID || "";
  const secret = process.env.META_APP_SECRET || "";
  if (!appId || !secret) throw new Error("META_APP_ID ve META_APP_SECRET gerekli");
  const url = new URL(`${GRAPH}/oauth/access_token`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", secret);
  url.searchParams.set("code", code);
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || typeof data.access_token !== "string") throw new Error("WhatsApp jetonu alınamadı");
  return data.access_token as string;
}

export async function subscribeWaba(wabaId: string, token: string) {
  await graph(`/${wabaId}/subscribed_apps`, token, { method: "POST" });
}

export async function unsubscribeWaba(connection: WhatsappConnection) {
  try {
    const token = decryptSecret(connection.tokenEncrypted);
    await graph(`/${connection.wabaId}/subscribed_apps`, token, { method: "DELETE" });
  } catch {
    // Disconnect locally even if Meta is unreachable.
  }
}

async function displayPhone(phoneNumberId: string, token: string) {
  try {
    const data = await graph(`/${phoneNumberId}?fields=display_phone_number`, token);
    return String(data.display_phone_number ?? "");
  } catch {
    return "";
  }
}

export async function connectWhatsapp(input: { code: string; wabaId: string; phoneNumberId: string }) {
  const token = await exchangeCode(input.code);
  const phone = await displayPhone(input.phoneNumberId, token);
  await saveConnection({
    wabaId: input.wabaId,
    phoneNumberId: input.phoneNumberId,
    displayPhone: phone,
    tokenEncrypted: encryptSecret(token),
    connectedAt: new Date().toISOString(),
  });
  await subscribeWaba(input.wabaId, token);
  return { displayPhone: phone };
}

export async function disconnectWhatsapp() {
  const current = await readConnection();
  if (current) await unsubscribeWaba(current);
  await clearConnection();
}

export async function connectionStatus() {
  const current = await readConnection();
  return {
    appId: process.env.META_APP_ID || "",
    configId: process.env.META_ES_CONFIG_ID || "",
    connected: Boolean(current),
    displayPhone: current?.displayPhone || "",
    wabaId: current?.wabaId || "",
    phoneNumberId: current?.phoneNumberId || "",
    connectedAt: current?.connectedAt || "",
  };
}
