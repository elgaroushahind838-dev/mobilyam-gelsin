"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, type Product } from "@/lib/types";
import { adminJson, dangerClass, fieldClass, ghostClass, primaryClass } from "./client";

const empty = {
  name: "",
  description: "",
  categorySlug: "yatak-odasi",
  imageUrl: "",
};

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  function load() {
    return adminJson<{ products: Product[] }>("/api/admin/products").then((data) => {
      setProducts(data.products);
    });
  }

  useEffect(() => {
    let ignore = false;
    adminJson<{ products: Product[] }>("/api/admin/products")
      .then((data) => {
        if (!ignore) setProducts(data.products);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("tr");
    if (!needle) return products;
    return products.filter((product) => `${product.name} ${product.categoryLabel} ${product.tag}`.toLocaleLowerCase("tr").includes(needle));
  }, [products, query]);

  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      const data = await adminJson<{ url: string }>("/api/admin/upload", { method: "POST", body });
      setForm((current) => ({ ...current, imageUrl: data.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Görsel yüklenemedi");
    } finally {
      setUploading(false);
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      if (editing) await adminJson(`/api/admin/products/${editing}`, { method: "PATCH", body: JSON.stringify(form) });
      else await adminJson("/api/admin/products", { method: "POST", body: JSON.stringify(form) });
      setOpen(false);
      setEditing(null);
      setForm(empty);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Bu ürün vitrinden de kalkacak. Silinsin mi?")) return;
    await adminJson(`/api/admin/products/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">Ürünler</h1>
          <p className="mt-1 text-sm text-[#6b625a]">Buradaki değişiklikler sitedeki koleksiyonlara yansır.</p>
        </div>
        <button type="button" className={primaryClass} onClick={() => { setOpen(true); setEditing(null); setForm(empty); }}>Yeni ürün</button>
      </div>
      {error && <p className="mt-4 rounded-2xl bg-[#fdf4f3] px-4 py-3 text-sm text-[#9b3b32]">{error}</p>}
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ürün veya koleksiyon ara" className={`${fieldClass} mt-4`} />
      {open && (
        <form onSubmit={save} className="mt-4 grid gap-3 rounded-3xl border border-[#efeae3] bg-white p-4 md:grid-cols-2">
          <label className="text-sm md:col-span-2">Ad<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={`${fieldClass} mt-1`} /></label>
          <label className="text-sm md:col-span-2">Açıklama<textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} className={`${fieldClass} mt-1`} /></label>
          <label className="text-sm">Koleksiyon
            <select value={form.categorySlug} onChange={(event) => setForm({ ...form, categorySlug: event.target.value })} className={`${fieldClass} mt-1`}>
              {CATEGORIES.map((category) => <option key={category.slug} value={category.slug}>{category.label}</option>)}
            </select>
          </label>
          <label className="text-sm">Fotoğraf
            <input type="file" accept="image/*" className={`${fieldClass} mt-1`} onChange={(event) => { const file = event.target.files?.[0]; if (file) upload(file); }} />
          </label>
          <label className="text-sm md:col-span-2">Veya görsel adresi<input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} className={`${fieldClass} mt-1`} placeholder="/images/ornek.jpeg" /></label>
          {form.imageUrl && <img src={form.imageUrl} alt="" className="h-28 w-28 rounded-2xl object-cover" />}
          <div className="flex gap-2 md:col-span-2">
            <button className={primaryClass} type="submit" disabled={uploading}>{uploading ? "Yükleniyor" : editing ? "Güncelle" : "Kaydet"}</button>
            <button className={ghostClass} type="button" onClick={() => setOpen(false)}>Vazgeç</button>
          </div>
        </form>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {visible.map((product) => (
          <article key={product.id} className="overflow-hidden rounded-3xl border border-[#efeae3] bg-white">
            <img src={product.images[0]} alt="" className="h-40 w-full object-cover" />
            <div className="p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#8c7f73]">{product.categoryLabel}</p>
              <h2 className="mt-1 text-lg font-semibold">{product.name}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-[#6b625a]">{product.description}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" className={ghostClass} onClick={() => { setEditing(product.id); setForm({ name: product.name, description: product.description, categorySlug: product.categorySlug, imageUrl: product.images[0] || "" }); setOpen(true); }}>Düzenle</button>
                <button type="button" className={dangerClass} onClick={() => remove(product.id)}>Sil</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
