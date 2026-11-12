"use client";

import { useEffect, useState } from "react";
import { emptyPackageContent } from "@/lib/seed-packages";
import type { ColorOption, L10n, Product, WeddingPackage } from "@/lib/types";
import { adminJson, dangerClass, fieldClass, ghostClass, primaryClass } from "./client";

type Draft = Omit<WeddingPackage, "id" | "createdAt">;

const blank = (): L10n => ({ tr: "", en: "", ar: "" });

function lines(items: L10n[], key: keyof L10n) {
  return items.map((item) => item[key]).join("\n");
}

function zipLines(tr: string, en: string, ar: string): L10n[] {
  const rows = tr.split("\n");
  const enRows = en.split("\n");
  const arRows = ar.split("\n");
  return rows
    .map((line, index) => ({ tr: line.trim(), en: (enRows[index] ?? "").trim(), ar: (arRows[index] ?? "").trim() }))
    .filter((item) => item.tr || item.en || item.ar);
}

function L10nInput({ label, value, onChange }: { label: string; value: L10n; onChange: (value: L10n) => void }) {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {(["tr", "en", "ar"] as const).map((key) => (
        <label key={key} className="text-sm">
          {label} {key.toUpperCase()}
          <input value={value[key]} onChange={(event) => onChange({ ...value, [key]: event.target.value })} className={`${fieldClass} mt-1`} />
        </label>
      ))}
    </div>
  );
}

export default function PackagesScreen() {
  const [packages, setPackages] = useState<WeddingPackage[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [included, setIncluded] = useState({ tr: "", en: "", ar: "" });
  const [fabrics, setFabrics] = useState({ tr: "", en: "", ar: "" });
  const [products, setProducts] = useState<Product[]>([]);
  const [pickedProduct, setPickedProduct] = useState("");

  function load() {
    return adminJson<{ packages: WeddingPackage[] }>("/api/admin/packages").then((data) => setPackages(data.packages));
  }

  useEffect(() => {
    adminJson<{ products: Product[] }>("/api/admin/products")
      .then((data) => setProducts(data.products))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let ignore = false;
    adminJson<{ packages: WeddingPackage[] }>("/api/admin/packages")
      .then((data) => {
        if (!ignore) setPackages(data.packages);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, []);

  function openNew() {
    const next = emptyPackageContent();
    setEditing(null);
    setDraft(next);
    setIncluded({ tr: "", en: "", ar: "" });
    setFabrics({ tr: lines(next.fabrics, "tr"), en: lines(next.fabrics, "en"), ar: lines(next.fabrics, "ar") });
  }

  function openEdit(item: WeddingPackage) {
    const { id, createdAt, ...rest } = item;
    setEditing(id);
    setDraft(rest);
    setIncluded({ tr: lines(item.included, "tr"), en: lines(item.included, "en"), ar: lines(item.included, "ar") });
    setFabrics({ tr: lines(item.fabrics, "tr"), en: lines(item.fabrics, "en"), ar: lines(item.fabrics, "ar") });
  }

  async function upload(file: File, apply: (url: string) => void) {
    const body = new FormData();
    body.set("file", file);
    const data = await adminJson<{ url: string }>("/api/admin/upload", { method: "POST", body });
    apply(data.url);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setError("");
    const payload = {
      ...draft,
      included: zipLines(included.tr, included.en, included.ar),
      fabrics: zipLines(fabrics.tr, fabrics.en, fabrics.ar),
    };
    try {
      if (editing) await adminJson(`/api/admin/packages/${editing}`, { method: "PATCH", body: JSON.stringify(payload) });
      else await adminJson("/api/admin/packages", { method: "POST", body: JSON.stringify(payload) });
      setDraft(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Bu düğün paketi siteden de kalkacak. Silinsin mi?")) return;
    await adminJson(`/api/admin/packages/${id}`, { method: "DELETE" });
    await load();
  }

  function addCatalogProduct() {
    const product = products.find((item) => item.id === pickedProduct);
    if (!product || !draft) return;
    const line = {
      tr: product.name,
      en: product.nameEn && product.nameEn !== product.name ? product.nameEn : product.name,
      ar: product.nameAr && product.nameAr !== product.name ? product.nameAr : product.name,
    };
    setIncluded({
      tr: [included.tr, line.tr].filter(Boolean).join("\n"),
      en: [included.en, line.en].filter(Boolean).join("\n"),
      ar: [included.ar, line.ar].filter(Boolean).join("\n"),
    });
    const room = product.categorySlug === "oturma-odasi" ? "sofa" : product.categorySlug === "yemek-odasi" ? "dining" : product.categorySlug === "yatak-odasi" ? "bed" : null;
    const photo = product.images[0];
    const items = [...(draft.items ?? []), { productId: product.id, room: room === "sofa" ? "living" as const : room === "dining" ? "dining" as const : room === "bed" ? "bedroom" as const : "entry" as const, quantity: 1 }];
    if (room && photo && !draft.images[room].includes(photo)) {
      setDraft({ ...draft, items, images: { ...draft.images, [room]: [...draft.images[room], photo] } });
    } else {
      setDraft({ ...draft, items });
    }
    setPickedProduct("");
  }

  function patchColors(key: "woods" | "sofaColors", index: number, patch: Partial<ColorOption>) {
    if (!draft) return;
    const next = draft[key].map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch, name: patch.name ?? item.name } : item));
    setDraft({ ...draft, [key]: next });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl">Düğün Paketleri</h2>
          <p className="mt-1 text-sm text-[#6b625a]">Ad, açıklama, görsel ve seçenekler sitedeki paket sayfalarına yansır.</p>
        </div>
        <button type="button" className={primaryClass} onClick={openNew}>Yeni paket</button>
      </div>
      {error && <p className="mt-4 rounded-2xl bg-[#fdf4f3] px-4 py-3 text-sm text-[#9b3b32]">{error}</p>}
      <div className="mt-4 grid gap-3">
        {packages.map((item) => (
          <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#efeae3] bg-white p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#8c7f73]">{item.active ? "Sitede" : "Gizli"} · sıra {item.displayOrder}</p>
              <h3 className="mt-1 text-lg font-semibold">{item.name.tr}</h3>
            </div>
            <div className="flex gap-2">
              <button type="button" className={ghostClass} onClick={() => openEdit(item)}>Düzenle</button>
              <button type="button" className={dangerClass} onClick={() => remove(item.id)}>Sil</button>
            </div>
          </article>
        ))}
      </div>
      {draft && (
        <form onSubmit={save} className="mt-4 grid gap-4 rounded-3xl border border-[#efeae3] bg-white p-4">
          <L10nInput label="Ad" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} />
          <L10nInput label="Kart satırı" value={draft.cardLine1} onChange={(cardLine1) => setDraft({ ...draft, cardLine1 })} />
          <L10nInput label="Kart alt satır" value={draft.cardLine2} onChange={(cardLine2) => setDraft({ ...draft, cardLine2 })} />
          <L10nInput label="Açıklama" value={draft.description} onChange={(description) => setDraft({ ...draft, description })} />
          <L10nInput label="Yatak odası başlık" value={draft.bedroomTitle} onChange={(bedroomTitle) => setDraft({ ...draft, bedroomTitle })} />
          <L10nInput label="Yatak odası açıklama" value={draft.bedroomDescription} onChange={(bedroomDescription) => setDraft({ ...draft, bedroomDescription })} />
          <L10nInput label="Oturma başlık" value={draft.livingTitle} onChange={(livingTitle) => setDraft({ ...draft, livingTitle })} />
          <L10nInput label="Oturma açıklama" value={draft.livingDescription} onChange={(livingDescription) => setDraft({ ...draft, livingDescription })} />
          <L10nInput label="Yemek odası başlık" value={draft.diningTitle} onChange={(diningTitle) => setDraft({ ...draft, diningTitle })} />
          <L10nInput label="Yemek odası açıklama" value={draft.diningDescription} onChange={(diningDescription) => setDraft({ ...draft, diningDescription })} />
          <L10nInput label="Tabla" value={draft.tabletop} onChange={(tabletop) => setDraft({ ...draft, tabletop })} />
          <L10nInput label="Sandalye" value={draft.chairs} onChange={(chairs) => setDraft({ ...draft, chairs })} />
          <L10nInput label="Uzman notu" value={draft.expert} onChange={(expert) => setDraft({ ...draft, expert })} />
          <div className="grid gap-2 md:grid-cols-3">
            {(["tr", "en", "ar"] as const).map((key) => (
              <label key={key} className="text-sm">Dahil olanlar {key.toUpperCase()}
                <textarea value={included[key]} onChange={(event) => setIncluded({ ...included, [key]: event.target.value })} rows={4} className={`${fieldClass} mt-1`} />
              </label>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="min-w-64 flex-1 text-sm">Katalogdan ürün ekle
              <select value={pickedProduct} onChange={(event) => setPickedProduct(event.target.value)} className={`${fieldClass} mt-1`}>
                <option value="">Ürün seç</option>
                {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
              </select>
            </label>
            <button type="button" className={ghostClass} disabled={!pickedProduct} onClick={addCatalogProduct}>Ekle</button>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            {(["tr", "en", "ar"] as const).map((key) => (
              <label key={key} className="text-sm">Kumaşlar {key.toUpperCase()}
                <textarea value={fabrics[key]} onChange={(event) => setFabrics({ ...fabrics, [key]: event.target.value })} rows={3} className={`${fieldClass} mt-1`} />
              </label>
            ))}
          </div>
          <fieldset className="grid gap-2">
            <legend className="text-sm font-semibold">Ahşap renkleri</legend>
            {draft.woods.map((item, index) => (
              <div key={`${item.color}-${index}`} className="grid gap-2 md:grid-cols-[88px_1fr_1fr_1fr_auto]">
                <input type="color" value={item.color} onChange={(event) => patchColors("woods", index, { color: event.target.value })} className="h-12 w-full" />
                {(["tr", "en", "ar"] as const).map((key) => (
                  <input key={key} value={item.name[key]} onChange={(event) => patchColors("woods", index, { name: { ...item.name, [key]: event.target.value } })} className={fieldClass} />
                ))}
                <button type="button" className={dangerClass} onClick={() => setDraft({ ...draft, woods: draft.woods.filter((_, itemIndex) => itemIndex !== index) })}>Sil</button>
              </div>
            ))}
            <button type="button" className={ghostClass} onClick={() => setDraft({ ...draft, woods: [...draft.woods, { color: "#8c7f73", name: blank() }] })}>Renk ekle</button>
          </fieldset>
          <fieldset className="grid gap-2">
            <legend className="text-sm font-semibold">Koltuk renkleri</legend>
            {draft.sofaColors.map((item, index) => (
              <div key={`${item.color}-${index}`} className="grid gap-2 md:grid-cols-[88px_1fr_1fr_1fr_auto]">
                <input type="color" value={item.color} onChange={(event) => patchColors("sofaColors", index, { color: event.target.value })} className="h-12 w-full" />
                {(["tr", "en", "ar"] as const).map((key) => (
                  <input key={key} value={item.name[key]} onChange={(event) => patchColors("sofaColors", index, { name: { ...item.name, [key]: event.target.value } })} className={fieldClass} />
                ))}
                <button type="button" className={dangerClass} onClick={() => setDraft({ ...draft, sofaColors: draft.sofaColors.filter((_, itemIndex) => itemIndex !== index) })}>Sil</button>
              </div>
            ))}
            <button type="button" className={ghostClass} onClick={() => setDraft({ ...draft, sofaColors: [...draft.sofaColors, { color: "#dcdde1", name: blank() }] })}>Renk ekle</button>
          </fieldset>
          {(["bed", "sofa", "dining"] as const).map((group) => (
            <label key={group} className="text-sm">
              {group === "bed" ? "Yatak odası görselleri" : group === "sofa" ? "Oturma görselleri" : "Yemek odası görselleri"}
              <textarea
                value={draft.images[group].join("\n")}
                onChange={(event) => setDraft({ ...draft, images: { ...draft.images, [group]: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) } })}
                rows={3}
                className={`${fieldClass} mt-1`}
              />
              <input type="file" accept="image/*" className={`${fieldClass} mt-2`} onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file || !draft) return;
                upload(file, (url) => setDraft((current) => current ? { ...current, images: { ...current.images, [group]: [...current.images[group], url] } } : current)).catch((err: Error) => setError(err.message));
              }} />
            </label>
          ))}
          <label className="text-sm">Kapak görseli
            <input value={draft.coverImage} onChange={(event) => setDraft({ ...draft, coverImage: event.target.value })} className={`${fieldClass} mt-1`} />
          </label>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm">Sıra
              <input type="number" value={draft.displayOrder} onChange={(event) => setDraft({ ...draft, displayOrder: Number(event.target.value) })} className={`${fieldClass} mt-1`} />
            </label>
            <label className="text-sm">Kısa adres
              <input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} className={`${fieldClass} mt-1`} placeholder="ekonomik" />
            </label>
            <label className="mt-6 flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} />
              Sitede göster
            </label>
          </div>
          <div className="flex gap-2">
            <button className={primaryClass} type="submit">{editing ? "Güncelle" : "Kaydet"}</button>
            <button className={ghostClass} type="button" onClick={() => setDraft(null)}>Vazgeç</button>
          </div>
        </form>
      )}
    </div>
  );
}
