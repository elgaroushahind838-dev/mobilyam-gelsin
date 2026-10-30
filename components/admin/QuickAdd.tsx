"use client";

import { useState } from "react";
import { parseWhatsAppSnippet } from "@/lib/whatsapp-parse";
import { fieldClass, ghostClass } from "./client";

export default function QuickAdd({ onFill }: { onFill: (value: { name: string; phone: string; notes: string }) => void }) {
  const [text, setText] = useState("");
  const [hint, setHint] = useState("");

  function apply() {
    const parsed = parseWhatsAppSnippet(text);
    if (!parsed.phone && !parsed.name) {
      setHint("Mesajda telefon veya isim bulunamadı. Alanları elle doldurabilirsiniz.");
    } else {
      setHint(parsed.phone ? "Telefon bulundu, formu kontrol edin." : "İsim bulundu, telefonu kontrol edin.");
    }
    onFill(parsed);
  }

  return (
    <div className="rounded-3xl border border-dashed border-[#d9d0c6] bg-[#f7f4ef] p-4">
      <p className="text-sm font-semibold">WhatsApp mesajından ekle</p>
      <p className="mt-1 text-xs leading-relaxed text-[#6b625a]">Sohbetten kopyaladığınız metni yapıştırın. İsim ve telefon bulunursa form dolar.</p>
      <textarea value={text} onChange={(event) => setText(event.target.value)} rows={3} className={`${fieldClass} mt-3`} placeholder="Örn: Merhaba ben Ayşe Yılmaz, 0555 111 22 33" />
      <button type="button" onClick={apply} className={`${ghostClass} mt-3`}>Formu doldur</button>
      {hint && <p className="mt-2 text-xs text-[#6b625a]">{hint}</p>}
    </div>
  );
}
