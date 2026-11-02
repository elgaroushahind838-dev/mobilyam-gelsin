import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isStore, requireAdmin } from "@/lib/admin-api";
import { detectImage, maxImageBytes } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const store = await requireAdmin(request);
  if (!isStore(store)) return store;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Dosya seçin" }, { status: 400 });
  if (file.size > maxImageBytes()) return NextResponse.json({ error: "Görsel 4 MB'dan küçük olmalı" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > maxImageBytes()) return NextResponse.json({ error: "Görsel 4 MB'dan küçük olmalı" }, { status: 400 });
  const kind = detectImage(bytes);
  if (!kind) {
    return NextResponse.json({ error: "Yalnızca JPEG, PNG, WEBP, GIF veya HEIC yükleyin" }, { status: 400 });
  }

  const filename = `${crypto.randomUUID()}.${kind.ext}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`products/${filename}`, new Blob([bytes], { type: kind.mime }), {
      access: "public",
      contentType: kind.mime,
    });
    return NextResponse.json({ url: blob.url, storage: "blob" });
  }

  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: "Fotoğraf yüklemek için Vercel Blob bağlayın (BLOB_READ_WRITE_TOKEN). Geçici olarak bir görsel adresi de yazabilirsiniz." },
      { status: 503 },
    );
  }

  const directory = path.join(process.cwd(), "public", "uploads");
  const target = path.join(directory, filename);
  if (!target.startsWith(`${directory}${path.sep}`)) {
    return NextResponse.json({ error: "Dosya adı geçersiz" }, { status: 400 });
  }
  await mkdir(directory, { recursive: true });
  await writeFile(target, bytes);
  return NextResponse.json({ url: `/uploads/${filename}`, storage: "local" });
}
