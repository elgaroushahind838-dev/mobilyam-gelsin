import { createFileStore } from "./memory";
import { createPostgresStore } from "./postgres";
import type { Store } from "./types";

export const SETUP_MESSAGE =
  "Kalıcı veri için Vercel projesine Neon Postgres bağlayın ve DATABASE_URL tanımlayın. Fotoğraf yüklemek için Vercel Blob bağlayıp BLOB_READ_WRITE_TOKEN ekleyin. Ayrıntılar PR açıklamasında.";

export function storeMode(): "postgres" | "file" | "unavailable" {
  if (process.env.DATABASE_URL) return "postgres";
  if (process.env.VERCEL) return "unavailable";
  return "file";
}

export function getStore(): Store {
  const mode = storeMode();
  if (mode === "postgres") return createPostgresStore();
  if (mode === "file") return createFileStore();
  throw new StoreUnavailable(SETUP_MESSAGE);
}

export class StoreUnavailable extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreUnavailable";
  }
}
