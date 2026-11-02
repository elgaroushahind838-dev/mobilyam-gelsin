"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/types";
import { formatWhen, todayIstanbul, whatsAppLink } from "@/lib/format";
import ListSkeleton from "./ListSkeleton";
import { ADMIN_PAGE_SIZE, adminJson, adminPageUrl, dangerClass, fieldClass, ghostClass, primaryClass } from "./client";

const empty = { customerName: "", phone: "", product: "", price: "", orderDate: "" };

function StageTrack({ current }: { current: "active" | "completed" }) {
  const steps = [
    { label: "Ölçü", state: "done" as const },
    { label: "Aktif", state: current === "completed" ? "done" as const : "now" as const },
    { label: "Arşiv", state: current === "completed" ? "now" as const : "wait" as const },
  ];
  return (
    <div className="mb-3 flex items-center" aria-label="Ölçü, Aktif, Arşiv">
      {steps.map((step, index) => (
        <div key={step.label} className="flex min-w-0 flex-1 items-center">
          {index > 0 && <div className={`mx-2 h-px min-w-4 flex-1 ${steps[index - 1].state === "done" ? "bg-[#2a241e]" : "bg-[#e6e0d8]"}`} />}
          <div className={`flex items-center gap-1.5 text-xs font-bold ${step.state === "wait" ? "text-[#a3988d]" : "text-[#2a241e]"}`}>
            <span className={`grid h-[22px] w-[22px] place-items-center rounded-full border text-[11px] ${step.state === "done" ? "border-[#2a241e] bg-[#2a241e] text-white" : step.state === "now" ? "border-[#2a241e] bg-white shadow-[0_0_0_4px_#f3efe8]" : "border-[#d9d1c7] bg-white text-[#8c7f73]"}`}>
              {step.state === "done" ? "✓" : index + 1}
            </span>
            {step.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrdersScreen({ status }: { status: "active" | "completed" }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  function load(offset = 0, needle = query, append = false) {
    setLoading(!append);
    return adminJson<{ orders: Order[]; total: number }>(adminPageUrl("/api/admin/orders", { status, limit: ADMIN_PAGE_SIZE, offset, q: needle.trim() })).then((data) => {
      setOrders((current) => (append ? [...current, ...data.orders] : data.orders));
      setTotal(data.total);
      setLoading(false);
    });
  }

  useEffect(() => {
    let ignore = false;
    const handle = setTimeout(() => {
      adminJson<{ orders: Order[]; total: number }>(adminPageUrl("/api/admin/orders", { status, limit: ADMIN_PAGE_SIZE, offset: 0, q: query.trim() }))
        .then((data) => {
          if (ignore) return;
          setOrders(data.orders);
          setTotal(data.total);
          setLoading(false);
        })
        .catch((err: Error) => {
          if (!ignore) setError(err.message);
          if (!ignore) setLoading(false);
        });
    }, query ? 250 : 0);
    return () => {
      ignore = true;
      clearTimeout(handle);
    };
  }, [status, query]);

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
          <p className="mt-1 text-sm text-[#6b625a]">{total} kayıt</p>
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
        {loading && orders.length === 0 && <ListSkeleton />}
        {!loading && orders.length === 0 && <p className="rounded-3xl bg-white px-4 py-8 text-center text-sm text-[#6b625a]">Kayıt yok.</p>}
        {orders.map((order) => (
          <article key={order.id} className="rounded-3xl border border-[#efeae3] bg-white p-4">
            <StageTrack current={status} />
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">{order.customerName}</h2>
                <p className="text-sm text-[#6b625a]">{order.phone}</p>
              </div>
              {order.price ? <p className="font-serif text-xl">{order.price}</p> : null}
            </div>
            <p className="mt-2 text-sm">{order.product}</p>
            {order.address ? <p className="mt-1 text-sm text-[#4d453e]">{order.address}</p> : null}
            {order.notes ? <p className="mt-1 text-sm text-[#4d453e]">{order.notes}</p> : null}
            <p className="mt-1 text-xs text-[#8c7f73]">{formatWhen(order.orderDate)}{order.completedAt ? ` · tamamlandı ${formatWhen(order.completedAt)}` : ""}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a className="rounded-xl bg-[#25D366] px-3 py-2 text-sm font-semibold text-white" href={whatsAppLink(order.phone)} target="_blank" rel="noreferrer">WhatsApp</a>
              <button type="button" className={ghostClass} onClick={() => { setEditing(order.id); setForm({ customerName: order.customerName, phone: order.phone, product: order.product, price: order.price, orderDate: order.orderDate }); setOpen(true); }}>Düzenle</button>
              <button type="button" className={dangerClass} onClick={() => remove(order.id)}>Sil</button>
            </div>
            {status === "active" && (
              <button type="button" className="mt-3 flex min-h-[52px] w-full items-center justify-center rounded-[14px] bg-[#2a241e] text-base font-bold text-white" onClick={() => complete(order.id)}>
                Tamamlandı → Arşiv
              </button>
            )}
          </article>
        ))}
      </div>
      {orders.length < total && (
        <button type="button" className={`${ghostClass} mt-4 w-full`} onClick={() => load(orders.length, query, true).catch((err: Error) => setError(err.message))}>
          Daha fazla göster
        </button>
      )}
    </div>
  );
}
