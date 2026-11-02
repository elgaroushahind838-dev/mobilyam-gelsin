"use client";

import { useEffect, useState } from "react";
import { adminJson } from "./client";
import ListSkeleton from "./ListSkeleton";

type Report = {
  totals: {
    page_view: number;
    visitors: number;
    product_view: number;
    impression: number;
    card_click: number;
    whatsapp: number;
    phone: number;
    map: number;
  };
  series: { day: string; views: number; visitors: number }[];
  topViews: { slug: string; name: string; total: number }[];
  topWhatsapp: { slug: string; name: string; total: number }[];
  sources: { source: string; total: number }[];
  languages: { language: string; total: number }[];
  devices: { device: string; total: number }[];
};

const ranges = [
  { id: "today", label: "Bugün" },
  { id: "7", label: "7 gün" },
  { id: "30", label: "30 gün" },
] as const;

const sourceLabel: Record<string, string> = {
  direct: "Doğrudan",
  google: "Google",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  bing: "Bing",
  yandex: "Yandex",
  other: "Diğer",
};

const deviceLabel: Record<string, string> = { mobile: "Telefon", tablet: "Tablet", desktop: "Bilgisayar" };

function dayLabel(day: string) {
  const [, month, date] = day.split("-");
  return `${date}.${month}`;
}

function RankList({ title, rows }: { title: string; rows: { name: string; total: number }[] }) {
  return (
    <section className="rounded-3xl border border-[#efeae3] bg-white p-4">
      <h2 className="font-serif text-2xl">{title}</h2>
      {rows.length === 0 ? <p className="mt-3 text-sm text-[#6b625a]">Bu aralıkta kayıt yok.</p> : (
        <ol className="mt-3 space-y-2">
          {rows.map((row, index) => (
            <li key={`${row.name}-${index}`} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate"><span className="mr-2 text-[#8c7f73]">{index + 1}.</span>{row.name}</span>
              <span className="font-semibold">{row.total}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default function StatsScreen() {
  const [range, setRange] = useState<(typeof ranges)[number]["id"]>("7");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setReport(null);
    adminJson<Report>(`/api/admin/stats?range=${range}`)
      .then((data) => {
        if (!ignore) setReport(data);
      })
      .catch((err: Error) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, [range]);

  const max = Math.max(1, ...(report?.series.map((item) => item.views) ?? [1]));

  return (
    <div>
      <h1 className="font-serif text-3xl md:text-4xl">İstatistikler</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#6b625a]">
        Katalog ziyaretleri burada birikir. Kişisel veri tutulmaz. Botlar ve yönetim gezintisi sayılmaz.
      </p>
      <div className="mt-4 flex gap-2">
        {ranges.map((item) => (
          <button key={item.id} type="button" onClick={() => setRange(item.id)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${range === item.id ? "bg-[#2a241e] text-white" : "border border-[#e6e0d8] bg-white"}`}>
            {item.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-4 rounded-2xl bg-[#fdf4f3] px-4 py-3 text-sm text-[#9b3b32]">{error}</p>}
      {!report && !error ? <div className="mt-6"><ListSkeleton /></div> : null}
      {report && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["Sayfa görüntüleme", report.totals.page_view],
              ["Tekil ziyaretçi", report.totals.visitors],
              ["Ürün görüntüleme", report.totals.product_view],
              ["Kart gösterimi", report.totals.impression],
              ["Kart tıklama", report.totals.card_click],
              ["WhatsApp", report.totals.whatsapp],
              ["Telefon", report.totals.phone],
              ["Harita", report.totals.map],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-3xl border border-[#efeae3] bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8c7f73]">{label}</p>
                <p className="mt-2 font-serif text-3xl">{value}</p>
              </div>
            ))}
          </div>
          <section className="mt-4 rounded-3xl border border-[#efeae3] bg-white p-4">
            <h2 className="font-serif text-2xl">Günlük görüntüleme</h2>
            <div className="mt-4 flex h-36 items-end gap-1 overflow-x-auto">
              {report.series.map((item) => (
                <div key={item.day} className="flex min-w-6 flex-1 flex-col items-center justify-end gap-1">
                  <div className="w-full rounded-t-md bg-[#2a241e]" style={{ height: `${Math.max(4, (item.views / max) * 112)}px` }} title={`${item.views} görüntüleme, ${item.visitors} ziyaretçi`} />
                  {report.series.length <= 14 && <span className="text-[10px] text-[#8c7f73]">{dayLabel(item.day)}</span>}
                </div>
              ))}
            </div>
          </section>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <RankList title="En çok görüntülenen ürünler" rows={report.topViews} />
            <RankList title="En çok WhatsApp tıklananlar" rows={report.topWhatsapp} />
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <RankList title="Kaynaklar" rows={report.sources.map((item) => ({ name: sourceLabel[item.source] || item.source, total: item.total }))} />
            <RankList title="Dil" rows={report.languages.map((item) => ({ name: item.language.toUpperCase(), total: item.total }))} />
            <RankList title="Cihaz" rows={report.devices.map((item) => ({ name: deviceLabel[item.device] || item.device, total: item.total }))} />
          </div>
        </>
      )}
    </div>
  );
}
