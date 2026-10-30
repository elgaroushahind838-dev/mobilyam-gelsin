"use client";

import { useEffect, useMemo, useState } from "react";
import type { Order } from "@/lib/types";
import { formatWhen, todayIstanbul, whatsAppLink } from "@/lib/format";
import { adminJson, dangerClass, fieldClass, ghostClass, primaryClass } from "./client";

const empty = { customerName: "", phone: "", product: "", price: "", orderDate: "" };

export default function OrdersScreen({ status }: { status: "active" | "completed" }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  function load() {
    return adminJson<{ orders: Order[] }>(`/api/admin/orders?status=${status}`).then((data) => {
      setOrders(data.orders);
    });
  }

  useEffect(() => {
    let ignore = false;
    adminJson<{ orders: Order[] }>(`/api/admin/orders?status=${status}`)
      .then((data) => {
        if (!ignore) setOrders(data.orders);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [status]);

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("tr");
    if (!needle) return orders;
    return orders.filter((order) => `${order.customerName} ${order.phone} ${order.product}`.toLocaleLowerCase("tr").includes(needle));
  }, [orders, query]);

  function reset() {
    setForm({ ...empty, orderDate: todayIstanbul() });
    setEditing(null);
    setOpen(false);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      if (editing) await adminJson(`/api/admin/orders/${editing}`, { method: "PATCH", body: JSON.stringify(form) });
      else await adminJson("/api/admin/orders", { method: "POST", body: JSON.stringify({ ...form, status }) });
      reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi");
    }
  }

  async function complete(id: string) {
    setError("");
    try {
      await adminJson(`/api/admin/orders/${id}`, { method: "PATCH", body: JSON.stringify({ action: "complete" }) });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tamamlanamadı");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Bu kaydı silmek istiyor musunuz?")) return;
    await adminJson(`/api/admin/orders/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">{status === "active" ? "Aktif Siparişler" : "Tamamlanan Siparişler"}</h1>
          <p className="mt-1 text-sm text-[#6b625a]">{orders.length} kayıt</p>
        </div>
        <button type="button" className={primaryClass} onClick={() => { setOpen(true); setForm({ ...empty, orderDate: todayIstanbul() }); setEditing(null); }}>Yeni kayıt</button>
      </div>
      {error && <p className="mt-4 rounded-2xl bg-[#fdf4f3] px-4 py-3 text-sm text-[#9b3b32]">{error}</p>}
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ad, telefon veya ürün ara" className={`${fieldClass} mt-4`} />
      {open && (
        <form onSubmit={save} className="mt-4 grid gap-3 rounded-3xl border border-[#efeae3] bg-white p-4 md:grid-cols-2">
          <label className="text-sm">Müşteri<input required value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} className={`${fieldClass} mt-1`} /></label>
          <label className="text-sm">Telefon<input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className={`${fieldClass} mt-1`} /></label>
          <label className="text-sm">Ürün<input required value={form.product} onChange={(event) => setForm({ ...form, product: event.target.value })} className={`${fieldClass} mt-1`} /></label>
          <label className="text-sm">Fiyat<input required value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className={`${fieldClass} mt-1`} placeholder="19.000 TL" /></label>
          <label className="text-sm">Tarih<input required type="date" value={form.orderDate} onChange={(event) => setForm({ ...form, orderDate: event.target.value })} className={`${fieldClass} mt-1`} /></label>
          <div className="flex gap-2 md:col-span-2">
            <button className={primaryClass} type="submit">{editing ? "Güncelle" : "Kaydet"}</button>
            <button className={ghostClass} type="button" onClick={reset}>Vazgeç</button>
          </div>
        </form>
      )}
      <div className="mt-4 grid gap-3">
        {visible.length === 0 && <p className="rounded-3xl bg-white px-4 py-8 text-center text-sm text-[#6b625a]">Kayıt yok.</p>}
        {visible.map((order) => (
          <article key={order.id} className="rounded-3xl border border-[#efeae3] bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">{order.customerName}</h2>
                <p className="text-sm text-[#6b625a]">{order.phone}</p>
              </div>
              <p className="font-serif text-xl">{order.price}</p>
            </div>
            <p className="mt-2 text-sm">{order.product}</p>
            <p className="mt-1 text-xs text-[#8c7f73]">{formatWhen(order.orderDate)}{order.completedAt ? ` · tamamlandı ${formatWhen(order.completedAt)}` : ""}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a className="rounded-xl bg-[#25D366] px-3 py-2 text-sm font-semibold text-white" href={whatsAppLink(order.phone)} target="_blank" rel="noreferrer">WhatsApp</a>
              {status === "active" && <button type="button" className={primaryClass} onClick={() => complete(order.id)}>Tamamlandı</button>}
              <button type="button" className={ghostClass} onClick={() => { setEditing(order.id); setForm({ customerName: order.customerName, phone: order.phone, product: order.product, price: order.price, orderDate: order.orderDate }); setOpen(true); }}>Düzenle</button>
              <button type="button" className={dangerClass} onClick={() => remove(order.id)}>Sil</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
