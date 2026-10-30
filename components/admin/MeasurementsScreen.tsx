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
  const [convertId, setConvertId] = useState<string | null>(null);
  const [convertForm, setConvertForm] = useState({ product: "Özel ölçü mobilya", price: "" });
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

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("tr");
    if (!needle) return items;
    return items.filter((item) => `${item.customerName} ${item.phone} ${item.address} ${item.notes}`.toLocaleLowerCase("tr").includes(needle));
  }, [items, query]);

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

  async function convert(id: string) {
    setError("");
    try {
      await adminJson(`/api/admin/measurements/${id}`, { method: "POST", body: JSON.stringify(convertForm) });
      setConvertId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Siparişe çevrilemedi");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">Ölçü Alınacak Müşteriler</h1>
          <p className="mt-1 text-sm text-[#6b625a]">{items.length} randevu</p>
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
              <button type="button" className={primaryClass} onClick={() => { setConvertId(item.id); setConvertForm({ product: "Özel ölçü mobilya", price: "" }); }}>Siparişe çevir</button>
              <button type="button" className={ghostClass} onClick={() => { setEditing(item.id); setForm({ customerName: item.customerName, phone: item.phone, address: item.address, appointmentAt: toInput(item.appointmentAt), notes: item.notes }); setOpen(true); }}>Düzenle</button>
              <button type="button" className={dangerClass} onClick={() => remove(item.id)}>Sil</button>
            </div>
            {convertId === item.id && (
              <div className="mt-3 grid gap-2 rounded-2xl bg-[#f7f4ef] p-3 sm:grid-cols-[1fr_160px_auto]">
                <input className={fieldClass} value={convertForm.product} onChange={(event) => setConvertForm({ ...convertForm, product: event.target.value })} placeholder="Ürün" />
                <input className={fieldClass} value={convertForm.price} onChange={(event) => setConvertForm({ ...convertForm, price: event.target.value })} placeholder="Fiyat" />
                <button type="button" className={primaryClass} onClick={() => convert(item.id)}>Aktif sipariş yap</button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
