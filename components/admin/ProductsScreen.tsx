"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PackagesScreen from "./PackagesScreen";
import { CATEGORIES, type Product, type ProductSubtype } from "@/lib/types";
import { adminJson, dangerClass, fieldClass, ghostClass, primaryClass } from "./client";

const empty = {
  name: "",
  description: "",
  categorySlug: "yatak-odasi",
  subtypeSlug: "",
  images: [] as string[],
  bestSeller: false,
  bestSellerOrder: 0,
};

function ProductsBody() {
  const tab = useSearchParams().get("sekme") === "paketler" ? "paketler" : "urunler";
  const [section, setSection] = useState(tab);
  useEffect(() => setSection(tab), [tab]);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [subtypes, setSubtypes] = useState<ProductSubtype[]>([]);
  const [subtypeName, setSubtypeName] = useState("");

  function loadSubtypes(room = form.categorySlug) {
    return adminJson<{ subtypes: ProductSubtype[] }>(`/api/admin/subtypes?room=${room}`).then((data) => setSubtypes(data.subtypes));
  }

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

  useEffect(() => {
    let ignore = false;
    loadSubtypes(form.categorySlug).catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, [form.categorySlug]);

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("tr");
    if (!needle) return products;
    return products.filter((product) => `${product.name} ${product.categoryLabel} ${product.tag}`.toLocaleLowerCase("tr").includes(needle));
  }, [products, query]);

  async function uploadMany(files: FileList | File[]) {
    setUploading(true);
    setError("");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.set("file", file);
        const data = await adminJson<{ url: string }>("/api/admin/upload", { method: "POST", body });
        urls.push(data.url);
      }
      setForm((current) => ({ ...current, images: [...current.images, ...urls] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Görsel yüklenemedi");
    } finally {
      setUploading(false);
    }
  }

  function makeCover(index: number) {
    setForm((current) => {
      const next = [...current.images];
      const [item] = next.splice(index, 1);
      if (!item) return current;
      next.unshift(item);
      return { ...current, images: next };
    });
  }

  function moveImage(index: number, direction: -1 | 1) {
    setForm((current) => {
      const next = [...current.images];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...current, images: next };
    });
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

  async function saveProduct(product: Product, patch: { bestSeller?: boolean; bestSellerOrder?: number }) {
    setError("");
    await adminJson(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: product.name,
        description: product.description,
        categorySlug: product.categorySlug,
        images: product.images,
        subtypeSlug: product.subtypeSlug,
        bestSeller: patch.bestSeller ?? product.bestSeller,
        bestSellerOrder: patch.bestSellerOrder ?? product.bestSellerOrder,
      }),
    });
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm("Bu ürün vitrinden de kalkacak. Silinsin mi?")) return;
    await adminJson(`/api/admin/products/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button type="button" className={section === "urunler" ? primaryClass : ghostClass} onClick={() => setSection("urunler")}>Ürünler</button>
        <button type="button" className={section === "paketler" ? primaryClass : ghostClass} onClick={() => setSection("paketler")}>Düğün paketleri</button>
      </div>
      {section === "paketler" ? <PackagesScreen /> : <>
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
          <label className="text-sm">Oda
            <select value={form.categorySlug} onChange={(event) => setForm({ ...form, categorySlug: event.target.value, subtypeSlug: "" })} className={`${fieldClass} mt-1`}>
              {CATEGORIES.map((category) => <option key={category.slug} value={category.slug}>{category.label}</option>)}
            </select>
          </label>
          <label className="text-sm">Alt tür
            <select value={form.subtypeSlug} onChange={(event) => setForm({ ...form, subtypeSlug: event.target.value })} className={`${fieldClass} mt-1`}>
              <option value="">Belirsiz</option>
              {subtypes.map((item) => <option key={item.id} value={item.slug}>{item.label.tr}</option>)}
            </select>
          </label>
          <div className="flex gap-2 md:col-span-2">
            <input value={subtypeName} onChange={(event) => setSubtypeName(event.target.value)} placeholder="Yeni alt tür" className={fieldClass} />
            <button type="button" className={ghostClass} onClick={() => {
              if (!subtypeName.trim()) return;
              adminJson("/api/admin/subtypes", { method: "POST", body: JSON.stringify({ roomSlug: form.categorySlug, label: { tr: subtypeName, en: subtypeName, ar: subtypeName } }) })
                .then(() => { setSubtypeName(""); return loadSubtypes(); })
                .catch((err: Error) => setError(err.message));
            }}>Alt tür ekle</button>
          </div>
          <div className="flex flex-wrap gap-2 md:col-span-2">
            {subtypes.map((item) => (
              <span key={item.id} className="inline-flex items-center gap-2 rounded-full bg-[#f7f4ef] px-3 py-1 text-xs">
                {item.label.tr}
                <button type="button" className="text-[#9b3b32]" onClick={() => adminJson(`/api/admin/subtypes/${item.id}`, { method: "DELETE" }).then(() => loadSubtypes()).catch((err: Error) => setError(err.message))}>sil</button>
              </span>
            ))}
          </div>
          <label className="text-sm md:col-span-2">Fotoğraflar
            <input type="file" accept="image/*" multiple className={`${fieldClass} mt-1`} onChange={(event) => { if (event.target.files?.length) uploadMany(event.target.files); }} />
          </label>
          <div className="flex flex-wrap gap-3 md:col-span-2">
            {form.images.map((url, index) => (
              <div key={url} className="w-28">
                <img src={url} alt="" className="h-24 w-28 rounded-2xl object-cover" />
                <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
                  <button type="button" className={ghostClass} onClick={() => moveImage(index, -1)}>↑</button>
                  <button type="button" className={ghostClass} onClick={() => moveImage(index, 1)}>↓</button>
                  <button type="button" className={ghostClass} onClick={() => makeCover(index)}>Kapak</button>
                  <button type="button" className={dangerClass} onClick={() => setForm({ ...form, images: form.images.filter((item) => item !== url) })}>Sil</button>
                </div>
                {index === 0 && <p className="text-[11px] font-semibold text-[#8c7f73]">Kapak</p>}
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold md:col-span-2">
            <input type="checkbox" checked={form.bestSeller} onChange={(event) => setForm({ ...form, bestSeller: event.target.checked })} />
            En çok satan
          </label>
          {form.bestSeller && (
            <label className="text-sm">Sıra
              <input type="number" min={0} value={form.bestSellerOrder} onChange={(event) => setForm({ ...form, bestSellerOrder: Number(event.target.value) })} className={`${fieldClass} mt-1`} />
            </label>
          )}
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
              <label className="mt-3 flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={Boolean(product.bestSeller)}
                  onChange={() => saveProduct(product, { bestSeller: !product.bestSeller }).catch((err: Error) => setError(err.message))}
                />
                En çok satan
              </label>
              {product.bestSeller && (
                <label className="mt-2 block text-sm">Sıra
                  <input
                    type="number"
                    min={0}
                    defaultValue={product.bestSellerOrder || 0}
                    key={`${product.id}-${product.bestSellerOrder}`}
                    onBlur={(event) => {
                      const next = Number(event.target.value);
                      if (next === product.bestSellerOrder) return;
                      saveProduct(product, { bestSellerOrder: Number.isFinite(next) ? next : 0 }).catch((err: Error) => setError(err.message));
                    }}
                    className={`${fieldClass} mt-1`}
                  />
                </label>
              )}
              <div className="mt-3 flex gap-2">
                <button type="button" className={ghostClass} onClick={() => { setEditing(product.id); setForm({ name: product.name, description: product.description, categorySlug: product.categorySlug, subtypeSlug: product.subtypeSlug || "", images: product.images, bestSeller: Boolean(product.bestSeller), bestSellerOrder: product.bestSellerOrder || 0 }); setOpen(true); }}>Düzenle</button>
                <button type="button" className={dangerClass} onClick={() => remove(product.id)}>Sil</button>
              </div>
            </div>
          </article>
        ))}
      </div>
      </>}
    </div>
  );
}

export default function ProductsScreen() {
  return (
    <Suspense fallback={null}>
      <ProductsBody />
    </Suspense>
  );
}
