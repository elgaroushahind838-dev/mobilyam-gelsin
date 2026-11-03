import { applyConversation } from "./whatsapp-capture";
import { shouldContinueImport } from "./whatsapp-stage";
import { latestMessageId, listContacts, readImport, saveImport, upsertContact, type ContactCursor } from "./whatsapp-store";

const BATCH = 4;

export type ImportView = {
  status: string;
  progress: number;
  pending: number;
  conversations: number;
  processed: number;
  addedMeasurement: number;
  addedActive: number;
  addedArchive: number;
  skipped: number;
  updatedAt: string;
};

function counts(contacts: ContactCursor[]) {
  const history = contacts.filter((item) => item.history && item.historyOutcome);
  const added = (outcome: ContactCursor["historyOutcome"]) => history.filter((item) => item.historyOutcome === outcome && item.historyCreated).length;
  return {
    conversations: contacts.filter((item) => item.history).length,
    processed: history.length,
    addedMeasurement: added("measurement"),
    addedActive: added("active"),
    addedArchive: added("archive"),
    skipped: history.filter((item) => item.historyOutcome === "skip").length,
  };
}

export async function importView(): Promise<ImportView> {
  const [state, contacts] = await Promise.all([readImport(), listContacts()]);
  return {
    status: state.status,
    progress: state.progress,
    updatedAt: state.updatedAt,
    pending: contacts.filter((item) => item.history && item.pending).length,
    ...counts(contacts),
  };
}

export async function noteHistory(input: { tick: string; progress: number | null; declined: boolean; phones: { phone: string; profileName: string }[] }) {
  const now = new Date().toISOString();
  if (input.declined) {
    const pending = (await listContacts()).some((item) => item.history && item.pending);
    await saveImport({ status: pending ? "receiving" : "declined", tick: input.tick, updatedAt: now, lockUntil: "" });
    return pending;
  }
  for (const item of input.phones) {
    if (!item.phone) continue;
    await upsertContact(item.phone, { history: true, pending: true, profileName: item.profileName });
  }
  const current = await readImport();
  const freshSync = current.status === "done" || current.status === "declined" || current.status === "idle";
  const progress = input.progress == null ? current.progress : freshSync ? input.progress : Math.max(current.progress, input.progress);
  await saveImport({ status: "receiving", progress, tick: input.tick, updatedAt: now });
  return true;
}

export async function deferLive(phone: string, profileName: string) {
  const state = await readImport();
  if (state.status !== "receiving" && state.status !== "processing") return false;
  await upsertContact(phone, { pending: true, history: true, profileName });
  return true;
}

export async function runImportBatch() {
  const state = await readImport();
  const pending = (await listContacts()).filter((item) => item.history && item.pending);
  if (!shouldContinueImport(state, pending.length, Date.now())) {
    if (!pending.length && state.status !== "declined" && (state.status === "processing" || state.progress >= 100)) {
      await saveImport({ status: "done", lockUntil: "", updatedAt: new Date().toISOString() });
    }
    return false;
  }
  await saveImport({ status: "processing", lockUntil: new Date(Date.now() + 55_000).toISOString(), updatedAt: new Date().toISOString() });
  const deadline = Date.now() + 40_000;
  for (const contact of pending.slice(0, BATCH)) {
    if (Date.now() > deadline) break;
    try {
      const latest = await latestMessageId(contact.phone);
      if (contact.processedId && contact.processedId === latest && contact.historyOutcome) {
        await upsertContact(contact.phone, { pending: false });
        continue;
      }
      const result = await applyConversation(contact.phone, contact.profileName);
      await upsertContact(contact.phone, {
        pending: false,
        processedId: latest,
        historyOutcome: result.bucket,
        historyCreated: contact.historyCreated || result.created,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      if (error instanceof Error && error.message.includes("AI_GATEWAY")) {
        await saveImport({ status: "receiving", lockUntil: new Date(Date.now() + 120_000).toISOString(), updatedAt: new Date().toISOString() });
        return true;
      }
      continue;
    }
  }
  const left = (await listContacts()).some((item) => item.history && item.pending);
  await saveImport({ status: left ? "processing" : "done", lockUntil: "", updatedAt: new Date().toISOString() });
  return left;
}
