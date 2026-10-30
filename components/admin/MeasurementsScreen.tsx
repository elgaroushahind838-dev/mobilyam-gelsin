"use client";

import { useEffect, useMemo, useState } from "react";
import type { Measurement } from "@/lib/types";
import { formatWhen, mapsLink, whatsAppLink } from "@/lib/format";
import { adminJson, dangerClass, fieldClass, ghostClass, primaryClass } from "./client";

const empty = { customerName: "", phone: "", address: "", appointmentAt: "", notes: "" };

function toInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function MeasurementsScreen() {
  const [items, setItems] = useState<Measurement[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [promote, setPromote] = useState<Measurement | null>(null);
  const [promoteForm, setPromoteForm] = useState({ price: "", notes: "" });
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  function load() {
    return adminJson<{ measurements: Measurement[] }>("/api/admin/measurements").then((data) => {
      setItems(data.measurements);
    });
  }

  useEffect(() => {
    let ignore = false;
    adminJson<{ measurements: Measurement[] }>("/api/admin/measurements")
      .then((data) => {
        if (!ignore) setItems(data.measurements);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const pending = useMemo(
    () => items.filter((item) => item.status !== "done" && item.status !== "cancelled"),
    [items],
  );
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("tr");
    if (!needle) return pending;
    return pending.filter((item) => `${item.customerName} ${item.phone} ${item.address} ${item.notes}`.toLocaleLowerCase("tr").includes(needle));
  }, [pending, query]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const appointment = new Date(form.appointmentAt);
      if (Number.isNaN(appointment.getTime())) {
        setError("Randevu tarihi geçersiz.");
        return;
      }
      const payload = { ...form, appointmentAt: appointment.toISOString() };
      if (editing) await adminJson(`/api/admin/measurements/${editing}`, { method: "PATCH", body: JSON.stringify(payload) });
      else await adminJson("/api/admin/measurements", { method: "POST", body: JSON.stringify(payload) });
      setOpen(false);
      setEditing(null);
      setForm(empty);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Bu kaydı silmek istiyor musunuz?")) return;
    await adminJson(`/api/admin/measurements/${id}`, { method: "DELETE" });
    await load();
  }

  function openPromote(item: Measurement) {
    setPromote(item);
    setPromoteForm({ price: "", notes: "" });
    setError("");
  }

  async function promoteToActive(event: React.FormEvent) {
    event.preventDefault();
    if (!promote) return;
    setError("");
    try {
      await adminJson(`/api/admin/measurements/${promote.id}`, {
        method: "POST",
        body: JSON.stringify({ price: promoteForm.price, notes: promoteForm.notes }),
      });
      setPromote(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Aktif siparişe alınamadı");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">Ölçü Alınacak Müşteriler</h1>
          <p className="mt-1 text-sm text-[#6b625a]">{pending.length} randevu</p>
        </div>
        <button type="button" className={primaryClass} onClick={() => { setOpen(true); setEditing(null); setForm(empty); }}>Yeni kayıt</button>
      </div>
      {error && <p className="mt-4 rounded-2xl bg-[#fdf4f3] px-4 py-3 text-sm text-[#9b3b32]">{error}</p>}
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ad, telefon veya adres ara" className={`${fieldClass} mt-4`} />
      {open && (
        <form onSubmit={save} className="mt-4 grid gap-3 rounded-3xl border border-[#efeae3] bg-white p-4">
          <label className="text-sm">Müşteri<input required value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} className={`${fieldClass} mt-1`} /></label>
          <label className="text-sm">Telefon<input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className={`${fieldClass} mt-1`} /></label>
          <label className="text-sm">Adres<input required value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className={`${fieldClass} mt-1`} /></label>
          <label className="text-sm">Randevu<input required type="datetime-local" value={form.appointmentAt} onChange={(event) => setForm({ ...form, appointmentAt: event.target.value })} className={`${fieldClass} mt-1`} /></label>
          <label className="text-sm">Not<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} className={`${fieldClass} mt-1`} /></label>
          <div className="flex gap-2">
            <button className={primaryClass} type="submit">{editing ? "Güncelle" : "Kaydet"}</button>
            <button className={ghostClass} type="button" onClick={() => setOpen(false)}>Vazgeç</button>
          </div>
        </form>
      )}
      <div className="mt-4 grid gap-3">
        {visible.length === 0 && <p className="rounded-3xl bg-white px-4 py-8 text-center text-sm text-[#6b625a]">Randevu yok.</p>}
        {visible.map((item) => (
          <article key={item.id} className="rounded-3xl border border-[#efeae3] bg-white p-4">
            <h2 className="text-lg font-semibold">{item.customerName}</h2>
            <p className="text-sm text-[#6b625a]">{item.phone}</p>
            <p className="mt-2 text-sm">{item.address}</p>
            <p className="mt-1 text-xs text-[#8c7f73]">{formatWhen(item.appointmentAt)}</p>
            {item.notes && <p className="mt-2 text-sm text-[#4d453e]">{item.notes}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <a className="rounded-xl bg-[#25D366] px-3 py-2 text-sm font-semibold text-white" href={whatsAppLink(item.phone)} target="_blank" rel="noreferrer">WhatsApp</a>
              <a className={ghostClass} href={mapsLink(item.address)} target="_blank" rel="noreferrer">Harita</a>
              <button type="button" className={ghostClass} onClick={() => { setEditing(item.id); setForm({ customerName: item.customerName, phone: item.phone, address: item.address, appointmentAt: toInput(item.appointmentAt), notes: item.notes }); setOpen(true); setPromote(null); }}>Düzenle</button>
              <button type="button" className={dangerClass} onClick={() => remove(item.id)}>Sil</button>
            </div>
            <button type="button" className="mt-3 flex min-h-[52px] w-full items-center justify-center rounded-[14px] bg-[#2a241e] text-base font-bold text-white" onClick={() => openPromote(item)}>Aktif'e Al</button>
          </article>
        ))}
      </div>
      {promote && (
        <div className="fixed inset-0 z-30 bg-[#2a241e]/45" onClick={() => setPromote(null)}>
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="promote-title"
            onSubmit={promoteToActive}
            onClick={(event) => event.stopPropagation()}
            className="absolute inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] max-h-[calc(100%-76px)] overflow-y-auto rounded-t-[28px] bg-white px-4 pb-4 pt-3 shadow-[0_-12px_40px_rgba(42,36,30,0.12)] md:bottom-8 md:left-1/2 md:w-[32rem] md:-translate-x-1/2 md:rounded-[28px]"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#e6e0d8]" />
            <h2 id="promote-title" className="font-serif text-2xl">Aktif'e al</h2>
            <p className="mt-1 text-[13px] leading-snug text-[#6b625a]">Bilgiler ölçü kaydından geldi. Fiyat ve not isteğe bağlı.</p>
            <dl className="mt-3 rounded-2xl bg-[#f7f4ef] px-3 py-2 text-sm">
              <div className="flex justify-between gap-3 py-1"><dt className="text-xs font-semibold text-[#8c7f73]">Müşteri</dt><dd className="font-semibold">{promote.customerName}</dd></div>
              <div className="flex justify-between gap-3 py-1"><dt className="text-xs font-semibold text-[#8c7f73]">Telefon</dt><dd className="font-semibold">{promote.phone}</dd></div>
              <div className="py-1"><dt className="text-xs font-semibold text-[#8c7f73]">Adres</dt><dd className="font-semibold">{promote.address}</dd></div>
              <div className="py-1"><dt className="text-xs font-semibold text-[#8c7f73]">Not</dt><dd className="font-semibold">{promote.notes.trim() || "—"}</dd></div>
            </dl>
            <label className="mt-3 block text-[13px] font-semibold text-[#6b625a]">Fiyat <span className="font-medium text-[#8c7f73]">(isteğe bağlı)</span>
              <input value={promoteForm.price} onChange={(event) => setPromoteForm({ ...promoteForm, price: event.target.value })} className={`${fieldClass} mt-1.5`} placeholder="19.000 TL" />
            </label>
            <label className="mt-2 block text-[13px] font-semibold text-[#6b625a]">Not <span className="font-medium text-[#8c7f73]">(isteğe bağlı)</span>
              <textarea value={promoteForm.notes} onChange={(event) => setPromoteForm({ ...promoteForm, notes: event.target.value })} rows={2} className={`${fieldClass} mt-1.5`} placeholder="Montaj notu" />
            </label>
            {error && <p className="mt-3 rounded-2xl bg-[#fdf4f3] px-4 py-3 text-sm text-[#9b3b32]">{error}</p>}
            <div className="mt-3 grid grid-cols-[110px_1fr] gap-2">
              <button type="button" className={ghostClass} onClick={() => setPromote(null)}>Vazgeç</button>
              <button type="submit" className="min-h-12 rounded-[14px] bg-[#2a241e] text-base font-bold text-white">Aktif'e Al</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
