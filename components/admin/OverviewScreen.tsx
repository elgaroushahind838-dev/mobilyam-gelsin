"use client";

import { useEffect, useState } from "react";
import { adminJson } from "./client";

type Summary = {
  activeOrders: number;
  pendingMeasurements: number;
  monthRevenueLabel: string;
};

export default function OverviewScreen() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminJson<Summary>("/api/admin/summary")
      .then(setSummary)
      .catch((err: Error) => setError(err.message));
  }, []);

  const cards = [
    { label: "Aktif sipariş", value: summary ? String(summary.activeOrders) : "—" },
    { label: "Ölçü bekleyen", value: summary ? String(summary.pendingMeasurements) : "—" },
    { label: "Bu ay tamamlanan ciro", value: summary?.monthRevenueLabel ?? "—" },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl md:text-4xl">Özet</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#6b625a]">
        Siparişler, ölçü randevuları ve vitrindeki ürünler buradan yönetilir. Telefonunuzda tarayıcı menüsünden “Ana ekrana ekle” ile uygulama gibi açılır.
      </p>
      {error && <p className="mt-4 rounded-2xl bg-[#fdf4f3] px-4 py-3 text-sm text-[#9b3b32]">{error}</p>}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-[#efeae3] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8c7f73]">{card.label}</p>
            <p className="mt-3 font-serif text-3xl">{card.value}</p>
          </div>
        ))}
      </div>
      <a href="/api/admin/export" className="mt-4 inline-flex w-fit items-center justify-center rounded-xl border border-[#e6e0d8] bg-white px-4 py-2.5 text-sm font-medium text-[#2a241e] hover:bg-[#f4f1eb]">
        Excel indir
      </a>
    </div>
  );
}
