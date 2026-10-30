import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isStore, requireAdmin } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const store = await requireAdmin();
  if (!isStore(store)) return store;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Dosya seçin" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Yalnızca görsel yükleyin" }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Görsel 4 MB'dan küçük olmalı" }, { status: 400 });

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`products/${crypto.randomUUID()}-${file.name}`, file, { access: "public" });
    return NextResponse.json({ url: blob.url, storage: "blob" });
  }

  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "Fotoğraf yüklemek için Vercel Blob bağlayın (BLOB_READ_WRITE_TOKEN). Geçici olarak bir görsel adresi de yazabilirsiniz." },
      { status: 503 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9.]+/g, "-").slice(-40);
  const filename = `${crypto.randomUUID()}-${safeName}`;
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), bytes);
  return NextResponse.json({ url: `/uploads/${filename}`, storage: "local" });
}
